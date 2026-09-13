// The cloud store replaces localStorage for every game save, so the contract it
// has to honour is learning.js's: synchronous getItem/setItem, and a save that
// round-trips back into an identical state. These tests also pin the rule that a
// guest's progress never reaches persistent storage.
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadState,saveState,freshState,loadCharacter,saveCharacter,saveKey,CHARACTER_KEY} from '../js/v2/learning.js';

// cloud.js builds an AuthClient at module scope and reaches for window/localStorage,
// so give it just enough of a browser to import cleanly under Node.
const written=new Map();
const fakeLocalStorage={
 getItem:k=>written.has(k)?written.get(k):null,
 setItem:(k,v)=>{written.set(k,String(v))},
 removeItem:k=>{written.delete(k)}
};
globalThis.window={localStorage:fakeLocalStorage,addEventListener(){},removeEventListener(){}};
globalThis.localStorage=fakeLocalStorage;
globalThis.location={origin:'https://example.test',pathname:'/'};
globalThis.fetch=async()=>{throw new Error('the tests never reach the network')};
globalThis.addEventListener??=()=>{};
globalThis.removeEventListener??=()=>{};

const {store}=await import('../js/v2/cloud.js');

test('the guest store satisfies the same getItem/setItem contract as localStorage', () => {
 assert.equal(store.getItem('linguaquest_v2_es'), null);
 store.setItem('linguaquest_v2_es', 'hello');
 assert.equal(store.getItem('linguaquest_v2_es'), 'hello');
 store.removeItem('linguaquest_v2_es');
 assert.equal(store.getItem('linguaquest_v2_es'), null);
});

test('a guest save round-trips through learning.js exactly as a local one would', () => {
 const state = freshState('es');
 state.quest = 'gather';
 state.inventory = ['pan'];
 state.xp = 40;
 state.coins = 12;
 state.character = {name:'Ada', hat:'none'};
 assert.equal(saveState(store, state), true);

 const back = loadState(store, 'es', ['pan','tomates','aceite']);
 assert.equal(back.quest, 'gather');
 assert.deepEqual(back.inventory, ['pan']);
 assert.equal(back.xp, 40);
 assert.equal(back.coins, 12);
 assert.equal(back.character.name, 'Ada');
});

test('the shared character record round-trips through the store too', () => {
 assert.equal(saveCharacter(store, {name:'Ada', hair:'#302b28'}), true);
 assert.equal(loadCharacter(store, ['es','ja']).name, 'Ada');
});

test('nothing a guest does is written to persistent storage', () => {
 written.clear();
 saveState(store, {...freshState('ja'), xp: 99});
 saveCharacter(store, {name:'Guest'});
 store.setItem('linguaquest_world', 'ja');
 assert.equal(written.size, 0, 'a guest session must leave no persistent trace');
 assert.equal(fakeLocalStorage.getItem(saveKey('ja')), null);
 assert.equal(fakeLocalStorage.getItem(CHARACTER_KEY), null);
});

test('each language still keeps its own slot, unchanged by the store swap', () => {
 saveState(store, {...freshState('es'), xp: 5});
 saveState(store, {...freshState('ja'), xp: 70});
 assert.equal(loadState(store, 'es', ['pan','tomates','aceite']).xp, 5);
 assert.equal(loadState(store, 'ja', ['gohan','sake','ocha']).xp, 70);
});
