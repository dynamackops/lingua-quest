// Accounts and cloud saves.
//
// The game already funnels every read and write through a `storage` object with
// localStorage's getItem/setItem shape (see learning.js). That is the only seam
// this module needs: `store` below is a drop-in replacement for localStorage, so
// neither learning.js nor its save-format validation changes at all.
//
// Two modes, matching the product rule that progress is a reason to have an
// account:
//   guest — an in-memory Map. Nothing is written anywhere. Closing the tab ends
//           the story, which is exactly what "guests don't get saves" means.
//   user  — the same Map, hydrated from Postgres on sign-in and flushed back on
//           a debounce. The Map stays the working copy so the synchronous
//           getItem/setItem contract the game relies on still holds.
import {AuthClient,PostgrestClient} from '../../vendor/supabase.module.js';
import {SUPABASE_URL,SUPABASE_KEY} from './config.js';

// The five records the game keeps, mapped to the `slot` column. Anything not on
// this list is treated as incidental and stays in memory only.
const SLOTS={linguaquest_v2_es:'es',linguaquest_v2_ja:'ja',linguaquest_v2_hub:'hub',linguaquest_v2_character:'character',linguaquest_world:'world'};
const KEY_FOR=Object.fromEntries(Object.entries(SLOTS).map(([k,s])=>[s,k]));
// A sign-up cannot open a session until the player confirms their email, so the
// run they just finished would evaporate while they check their inbox. This one
// key carries it across that gap and is cleared the moment it is adopted. It is
// a handoff for a sign-up already in progress, not a guest save.
const PENDING='linguaquest_pending_save';
const PENDING_MAX_AGE=86_400_000;

let local;try{local=window.localStorage}catch{local=null}
const readLocal=k=>{try{return local?.getItem(k)??null}catch{return null}};
const writeLocal=(k,v)=>{try{local?.setItem(k,v)}catch{}};
const dropLocal=k=>{try{local?.removeItem(k)}catch{}};

export const auth=new AuthClient({
 url:`${SUPABASE_URL}/auth/v1`,
 headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`},
 storageKey:'linguaquest_auth',
 // Session tokens are not game saves: persisting them is what keeps a signed-in
 // player signed in, and auto-refresh is what stops a long play session from
 // silently losing the ability to write.
 persistSession:true,autoRefreshToken:true,
 // Confirmation and password-reset links come back with tokens in the URL.
 detectSessionInUrl:true,flowType:'pkce'
});

let session=null,status='guest',listeners=[],statusListeners=[];
// What the last sign-in did with the run that was in progress. The UI needs to
// know: adopting a guest run is a quiet success, whereas loading an account that
// already had saves must never be applied on top of the current scene.
export let lastHydration=null;
const rest=token=>new PostgrestClient(`${SUPABASE_URL}/rest/v1`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`}});
function setStatus(s){if(status===s)return;status=s;for(const fn of statusListeners)fn(s)}
export const onStatus=fn=>{statusListeners.push(fn);fn(status)};
export const onAuth=fn=>{listeners.push(fn);fn(session)};
export const currentUser=()=>session?.user??null;
export const signedIn=()=>!!session;

// ---------------------------------------------------------------- the store

const map=new Map();
let mode='guest',dirty=new Set(),timer=0;

export const store={
 getItem:key=>map.has(key)?map.get(key):null,
 setItem(key,value){
  map.set(key,String(value));
  if(mode==='user'&&SLOTS[key]){dirty.add(key);schedule()}
 },
 removeItem(key){map.delete(key);if(mode==='user'&&SLOTS[key]){dirty.add(key);schedule()}}
};

function schedule(){clearTimeout(timer);setStatus('saving');timer=setTimeout(()=>{flush()},1200)}

async function flush(){
 if(mode!=='user'||!dirty.size)return;
 const token=session?.access_token;if(!token)return;
 const keys=[...dirty];dirty.clear();
 const rows=keys.map(k=>({user_id:session.user.id,slot:SLOTS[k],data:parse(map.get(k))})).filter(r=>r.data!==undefined);
 if(!rows.length){setStatus('saved');return}
 const {error}=await rest(token).from('saves').upsert(rows,{onConflict:'user_id,slot'});
 // Losing a flush must not lose the write: put the keys back so the next one
 // retries them rather than leaving the cloud permanently behind the session.
 if(error){for(const k of keys)dirty.add(k);setStatus('error');return}
 setStatus('saved');
}

// A last-gasp write on tab close. fetch(keepalive) survives teardown where an
// ordinary awaited request does not; sendBeacon cannot carry the auth header.
export function flushNow(){
 if(mode!=='user'||!dirty.size||!session?.access_token)return;
 const keys=[...dirty];dirty.clear();
 const rows=keys.map(k=>({user_id:session.user.id,slot:SLOTS[k],data:parse(map.get(k))})).filter(r=>r.data!==undefined);
 if(!rows.length)return;
 try{
  fetch(`${SUPABASE_URL}/rest/v1/saves?on_conflict=user_id,slot`,{
   method:'POST',keepalive:true,
   headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},
   body:JSON.stringify(rows)
  }).catch(()=>{});
 }catch{}
}

const parse=raw=>{try{return JSON.parse(raw)}catch{return undefined}};

// --------------------------------------------------------------- hydration

// Signing in adopts one of two stories, never a blend of both. A brand-new
// account takes the guest run the player is signing in to keep; an account that
// already has saves wins outright, because silently overwriting real progress
// from another device is the one unrecoverable mistake here.
async function hydrate(){
 const token=session.access_token;
 const {data,error}=await rest(token).from('saves').select('slot,data');
 if(error){setStatus('error');return {adopted:false,failed:true}}
 const cloud=new Map((data||[]).map(r=>[KEY_FOR[r.slot],JSON.stringify(r.data)]));
 const carried=[...map.entries()].filter(([k])=>SLOTS[k]);
 const pending=takePending();
 const hasCloud=cloud.size>0;
 mode='user';
 if(hasCloud){
  map.clear();
  for(const [k,v]of cloud)if(k)map.set(k,v);
  setStatus('saved');
  return {adopted:false,failed:false};
 }
 // Nothing stored yet: keep whatever this session (or a just-confirmed sign-up)
 // was carrying, and push it up as the account's first save.
 map.clear();
 for(const [k,v]of pending??carried)map.set(k,v);
 for(const k of map.keys())if(SLOTS[k])dirty.add(k);
 await flush();
 return {adopted:map.size>0,failed:false};
}

function stashPending(){
 const rows=[...map.entries()].filter(([k])=>SLOTS[k]);
 if(!rows.length)return;
 writeLocal(PENDING,JSON.stringify({at:Date.now(),rows}));
}
function takePending(){
 const raw=readLocal(PENDING);if(!raw)return null;
 dropLocal(PENDING);
 try{const {at,rows}=JSON.parse(raw);if(!Array.isArray(rows)||!(Date.now()-at<PENDING_MAX_AGE))return null;return rows}catch{return null}
}
export const clearPending=()=>dropLocal(PENDING);

// ------------------------------------------------------------------- events

let ready;
export function init(){
 ready??=new Promise(resolve=>{
  let settled=false;
  auth.onAuthStateChange(async(event,next)=>{
   session=next;
   if(event==='SIGNED_OUT'){mode='guest';dirty.clear();map.clear();setStatus('guest')}
   else if(next&&mode!=='user')lastHydration=await hydrate();
   else if(next)setStatus('saved');
   for(const fn of listeners)fn(session,event);
   if(!settled){settled=true;resolve(session)}
  });
  // onAuthStateChange fires an INITIAL_SESSION event on its own, but a hard
  // failure to reach the auth server would otherwise leave this pending forever.
  setTimeout(()=>{if(!settled){settled=true;resolve(session)}},6000);
 });
 return ready;
}

// -------------------------------------------------------------------- verbs

const redirect=()=>location.origin+location.pathname;

export async function signUp(email,password,displayName){
 const {data,error}=await auth.signUp({email,password,options:{emailRedirectTo:redirect(),data:displayName?{display_name:displayName}:undefined}});
 if(error)return {error:error.message};
 // With confirmations on, Supabase returns a user but no session. Hold the run
 // in progress so confirming the email does not cost the player their evening.
 if(!data.session){stashPending();return {pending:true}}
 return {pending:false};
}

export async function signIn(email,password){
 const {error}=await auth.signInWithPassword({email,password});
 if(error)return {error:error.message};
 return {};
}

export async function sendReset(email){
 const {error}=await auth.resetPasswordForEmail(email,{redirectTo:redirect()});
 return error?{error:error.message}:{};
}

export async function resendConfirmation(email){
 const {error}=await auth.resend({type:'signup',email,options:{emailRedirectTo:redirect()}});
 return error?{error:error.message}:{};
}

export async function setPassword(password){
 const {error}=await auth.updateUser({password});
 return error?{error:error.message}:{};
}

export async function signOut(){
 flushNow();
 clearPending();
 await auth.signOut();
}
