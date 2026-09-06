// Independent retrieval, rather than exposure or XP, earns fading support.
export const MIN_GAP=60_000;
const intervals=[60_000,600_000,86_400_000,259_200_000,604_800_000];
export function ensure(records,id){return records[id]??=( {exposures:0,attempts:0,errors:0,successes:0,contexts:[],lastIndependent:null,due:0,lapsed:false} );}
export function expose(records,ids){for(const id of ids)ensure(records,id).exposures++}
export function answer(records,id,correct,{assisted=false,context='general',now=Date.now()}={}){
 const r=ensure(records,id);r.attempts++;r.exposures++;
 if(!correct){r.errors++;r.lapsed=true;r.due=now+MIN_GAP;return {credited:false,known:false}}
 if(assisted)return {credited:false,known:known(records,id)};
 if(r.lastIndependent!==null&&now-r.lastIndependent<MIN_GAP)return {credited:false,known:known(records,id)};
 r.successes++;r.lastIndependent=now;r.lapsed=false;if(!r.contexts.includes(context))r.contexts.push(context);r.due=now+intervals[Math.min(r.successes-1,intervals.length-1)];return {credited:true,known:known(records,id)};
}
export function known(records,id,now=Date.now()){const r=records[id];return !!r&&r.successes>=3&&r.contexts.length>=2&&!r.lapsed&&now<=r.due+259_200_000}
export function support(records,ids,mode='auto'){return mode==='full'||!ids.length||ids.some(id=>!known(records,id))}
export function due(records,ids,now=Date.now()){return ids.filter(id=>records[id]?.exposures>0&&records[id].due<=now).sort((a,b)=>records[a].due-records[b].due)}
export function freshState(){return {version:2,language:'es',character:null,position:{x:0,z:10,room:'town'},quest:'new',inventory:[],delivered:[],srs:{},xp:0,audio:true,support:'auto',startedAt:Date.now()}}
export function loadState(storage){try{const data=JSON.parse(storage.getItem('linguaquest_v2_es'));if(!data||data.version!==2||data.language!=='es')return freshState();const s={...freshState(),...data};if(!['new','gather','dinner','complete'].includes(s.quest))s.quest='new';s.inventory=Array.isArray(s.inventory)?s.inventory.filter(x=>['pan','tomates','aceite'].includes(x)):[];s.delivered=Array.isArray(s.delivered)?s.delivered.filter(x=>['pan','tomates','aceite'].includes(x)):[];s.srs=s.srs&&typeof s.srs==='object'&&!Array.isArray(s.srs)?s.srs:{};for(const [id,r]of Object.entries(s.srs)){if(!r||!Array.isArray(r.contexts)||!Number.isFinite(r.successes)||!Number.isFinite(r.exposures))delete s.srs[id]}s.character=s.character&&typeof s.character.name==='string'?s.character:null;if(!s.position||!['town','home','cafe'].includes(s.position.room)||!Number.isFinite(s.position.x)||!Number.isFinite(s.position.z))s.position=freshState().position;s.xp=Number.isFinite(s.xp)&&s.xp>=0?s.xp:0;s.support=['auto','full'].includes(s.support)?s.support:'auto';return s}catch{return freshState()}}
export function saveState(storage,state){try{storage.setItem('linguaquest_v2_es',JSON.stringify(state));return true}catch{return false}}
