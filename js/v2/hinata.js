// Hinata: a small Japanese town with a pond, a rice shop, a fish stall, a tea house, a torii on the east path, and tatami interiors.
import * as T from '../../vendor/three.module.js';
import {box,ball,cyl,sign,mat,mesh,signStyles,archway} from './parts.js';
const wood='#4a3a2c',tile='#4f5663',stone='#8f8a7c';
const kanban=(p,text,x,y,z,w=2.5)=>sign(p,text,x,y,z,w,null,signStyles.ja);
export const hinata={
 sky:{background:'#d8e2e4',fog:[45,120],hemi:['#f7f4ea','#7d8d7b',2],sun:['#fff4e0',2.9,[-14,30,16]]},
 doors:{home:{x:-15,z:10},cafe:{x:14,z:-4}},
 town(t){
 const s=t.scene;t.koi=[];t.lanterns=[];box(s,0,-.3,0,110,.5,110,'#98a97c');
 // A raked gravel courtyard with a few flat stepping stones, drawn once into a repeating texture.
 const cv=document.createElement('canvas');cv.width=cv.height=512;const cx=cv.getContext('2d');cx.fillStyle='#d5cfbd';cx.fillRect(0,0,512,512);for(let i=0;i<900;i++){const v=190+(i*37%28);cx.fillStyle=`rgb(${v+8},${v+4},${v-8})`;cx.fillRect((i*131)%512,(i*71)%512,3,3)}cx.fillStyle='#b5b0a1';for(let i=0;i<7;i++){cx.beginPath();cx.ellipse(70+(i*173)%400,60+(i*211)%420,34,24,i,0,7);cx.fill()}const tx=new T.CanvasTexture(cv);tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(6,6);tx.colorSpace=T.SRGBColorSpace;
 const court=new T.Mesh(new T.BoxGeometry(37,.12,34),new T.MeshStandardMaterial({map:tx,roughness:1}));court.position.set(0,-.01,1);court.receiveShadow=true;s.add(court);
 box(s,0,-.025,23,8,.1,20,'#cbc5b2');box(s,26,-.02,4,24,.1,6,'#cbc5b2');box(s,-26,-.02,4,24,.1,6,'#cbc5b2');
 house(t,-12,-9,7,5.4,5.5,'#efe5d0','#3f5a7a','こめや','shop');
 house(t,-3,-14,7,7,5,'#e8dcc6','#6a5a48','あおいのいえ');
 house(t,6,-14,7,6,5,'#ece2cf','#6a5a48','');
 house(t,14,-8,6,5.5,6,'#e4d6bf','#8a3b2f','ちゃや かえで','cafe');
 house(t,-15,5,6,4.2,6,'#efe6d3','#6a5a48','わたしのいえ','home');
 // Misty mountains, a far peak with a snow cap, and a row of pines behind the houses.
 for(let i=0;i<8;i++){const x=-34+i*10;ball(s,x,1,-42,12+i%3*2,['#8fa39a','#9fb0a5','#b1bfb3'][i%3],1).scale.y=.8}
 cyl(s,10,7,-64,0,24,26,'#93a6a6',7);cyl(s,10,17.5,-64,0,5.2,5.4,'#f1f2ee',7);
 for(const x of [-27,-20,20,27])house(t,x,-24,5,4+(x%3),4,'#e9dfc8','#6a5a48','',null,false);
 for(let i=0;i<10;i++){const x=-26+i*5.6;i%3===0?maple(t,x,-22,1):pine(t,x,-22,1.1)}
 // Torii and a small shrine at the end of the east path; a bamboo grove on the west.
 for(const z of [2.4,5.6]){cyl(s,22,2.1,z,.16,.2,4.2,'#b8412f');cyl(s,22,.12,z,.3,.34,.24,stone);t.obstacle(22,z,.6,.6)}box(s,22,4.42,4,.32,.18,4.9,'#2e2a28');box(s,22,4.2,4,.26,.14,4.5,'#b8412f');box(s,22,3.4,4,.16,.16,4,'#b8412f');
 const shrine=house(t,33,4,4,3.2,4,'#e6dcc5','#6a5a48','',null,false,'#5f7d6f');shrine.rotation.y=Math.PI/2;toro(t,25,2);toro(t,25,6);pine(t,29,-1,1.2);pine(t,29,9,1.1);
 for(const [x,z]of [[-24,0],[-26,8],[-22,9],[-27,-1]])bamboo(t,x,z);
 // The pond: stone rim, still water, lily pads, koi, a bamboo spout and a lantern.
 const pond=new T.Group();s.add(pond);cyl(pond,0,.1,0,2.85,2.95,.2,stone,18);cyl(pond,0,.21,0,2.55,2.55,.04,'#6f9c98',32);const rim=mesh(new T.TorusGeometry(2.72,.17,8,28),stone,0,.27,0,pond);rim.rotation.x=Math.PI/2;for(const [x,z,r]of [[-.9,.7,.3],[.6,-1.1,.26],[1.3,.9,.22],[-1.6,-.6,.2]])cyl(pond,x,.245,z,r,r,.02,'#6f9257',10);
 for(let i=0;i<4;i++){const k=ball(pond,0,.24,0,.13,['#e07a3c','#f3efe6','#e0533a','#e8a25a'][i]);k.scale.set(1.7,.55,.8);t.koi.push({mesh:k,a:i*1.6,r:1.1+i*.25,speed:.5+i*.12})}
 const spout=cyl(pond,-1.7,1,0,.09,.09,1.1,'#b8a66a');spout.rotation.z=1.1;cyl(pond,-2.1,.5,0,.08,.1,1,'#8f8560');for(let i=0;i<4;i++)t.water.push({mesh:ball(pond,-1.45+i*.05,.9,0,.04,'#c5e2dc'),top:1.05,fall:.8});
 ball(pond,1.4,.3,1.7,.42,stone);toro(t,2.2,-1.7,pond);t.obstacle(0,0,5.6,5.6);
 // Fish stall with a blue and white awning, crates of fish on ice.
 const stall=new T.Group();stall.position.set(10,0,3);s.add(stall);box(stall,0,.85,0,4,1.45,1.6,'#6b5340');box(stall,0,1.6,0,4.1,.1,1.7,'#c9b27a');for(const x of [-1.9,1.9])for(const z of [-.65,.65])cyl(stall,x,1.85,z,.055,.055,3.7,wood);for(let i=0;i<10;i++){const aw=box(stall,-2.025+i*.45,3.25,0,.45,.14,2.6,i%2?'#f1ece0':'#3f5a7a');aw.rotation.x=-.1;box(stall,-2.025+i*.45,3.05,1.25,.45,.32,.08,i%2?'#f1ece0':'#3f5a7a')}
 for(let i=0;i<3;i++){box(stall,-1.3+i*1.3,1.75,0,1.1,.2,1.05,'#c9b27a');for(let j=0;j<4;j++)ball(stall,-1.6+i*1.3+(j%2)*.55,1.92,Math.floor(j/2)*.45-.22,.14,'#eef2f2');for(let j=0;j<3;j++){const f=ball(stall,-1.55+i*1.3+j*.4,2.02,.05-(j%2)*.3,.13,['#7f93a3','#e08a7a','#a7b6bf'][i]);f.scale.set(1.6,.5,.7)}}kanban(stall,'さかなや',0,2.45,1,2.7);t.obstacle(10,3,4,1.8);
 pine(t,-7,5,1.2);pine(t,7,9,1.1);maple(t,-9,-3,.9);pine(t,18,10,1.2);pine(t,-20,-4,1.2);pine(t,19,-15,1.3);maple(t,-19,13,1.1);maple(t,14,16,.9);maple(t,-7,18,.85);
 for(const [x,z]of [[-5,-4],[5,-5],[-6,10],[16,6]])tsukubai(t,x,z);
 bench(t,-4,4,.9);bench(t,4,-4,-.9);bench(t,-9,12,0);
 for(const [x,z]of [[-7,1],[7,-4],[-17,11],[18,0]])toro(t,x,z);
 for(const [x,z]of [[11,-3],[15,-2],[15,1]])teaBench(t,x,z);cyl(s,15,2.7,-.5,1.7,1.7,.04,'#b8412f',12);cyl(s,15,2.95,-.5,0,1.7,.5,'#c9503a',12);cyl(s,15,1.4,-.5,.04,.05,2.8,'#3b2f2b');
 // The shared low table with cushions: onigiri, salmon and tea appear when the chapter is complete.
 const dinner=new T.Group();dinner.position.set(-6,0,-6);s.add(dinner);box(dinner,0,.62,0,3.3,.12,1.6,'#8b6a48');for(const x of [-1.3,1.3])for(const z of [-.5,.5])box(dinner,x,.3,z,.14,.6,.14,'#6b4c3a');box(dinner,0,.69,0,.9,.02,1.5,'#f3e8cb');for(const x of [-1,0,1])for(const z of [-1.15,1.15])box(dinner,x,.05,z,.62,.09,.62,z<0?'#3f5a7a':'#b9873f');
 t.dinnerFood=new T.Group();dinner.add(t.dinnerFood);t.dinnerFood.visible=false;for(let i=0;i<4;i++){const x=-1.05+i*.7;cyl(t.dinnerFood,x,.87,-.3,0,.2,.34,'#f6f2e8',3);box(t.dinnerFood,x,.76,-.18,.2,.12,.16,'#2b2f2a')}for(const x of [-.9,.3]){cyl(t.dinnerFood,x,.72,.4,.3,.3,.03,'#eef2f2',16);const f=ball(t.dinnerFood,x,.78,.4,.14,'#e08a7a');f.scale.set(1.6,.5,.8)}cyl(t.dinnerFood,1.1,.78,.4,.14,.11,.18,'#7d8f7a');ball(t.dinnerFood,1.1,.93,.4,.07,'#7d8f7a');for(const x of [-1.2,-.4,.4,1.2])cyl(t.dinnerFood,x,.74,.95,.09,.07,.12,'#eae1c9');t.obstacle(-6,-6,3.3,1.6);
 // Paper lanterns strung across the courtyard.
 const points=[];for(let i=0;i<=24;i++){const x=-14+i*28/24,y=7-Math.sin(i/24*Math.PI)*1.9;points.push(new T.Vector3(x,y,-5));if(i%3===0)chochin(t,s,x,y-.45,-5,i%2?'#d9603f':'#f0e6d2')}s.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:'#5a4a3a'})));
 t.npc('aoi','あおい',-3,4,{shirt:'#a94a4a',hair:'#2b2622',style:'long',skin:'#e8c4a4'});t.npc('kenji','けんじ',-11,-4.5,{shirt:'#4b5a78',hair:'#2a2622',style:'crop',skin:'#d9b28f'});t.npc('yui','ゆい',9,5.2,{shirt:'#5a8a8f',hair:'#3a2f2a',style:'bob',skin:'#e4c1a0'});t.npc('sora','そら',10,8,{shirt:'#7a6a94',hair:'#3a2f2a',style:'curls',skin:'#e0b590',hat:'flowercrown'});
 t.addEntity('home','わたしのいえ',-15,8.8,'door',1.8);t.addEntity('cafe','ちゃや かえで',14,-4.5,'door',2);t.addEntity('table','テーブル',-6,-4.3,'table',1.8);t.addEntity('fountain','いけ',0,3,'object',1.2);
 // A plain gate back to The Crossing — the same shape and neutral colour as the hub's
 // own archways, so both ends of the trip look like the same place.
 archway(t,0,24,'#8d8a7d','THE CROSSING');t.addEntity('door_hub','クロッシング',0,20,'door',2.2);
 },
 rooms(t){
 // Home: tatami, a futon, a low table, a tokonoma alcove and the tansu wardrobe.
 t.homeRoom=new T.Group();t.scene.add(t.homeRoom);const s=t.homeRoom;box(s,100,-.08,0,12,.2,10,'#7d7455');for(let i=0;i<6;i++)for(let j=0;j<10;j++)box(s,95+i*2,.03,-4.5+j,1.9,.04,.9,j%2?'#c7c290':'#cdc898');
 box(s,100,2,-5,12,4,.2,'#efe6d3');box(s,94,2,0,.2,4,10,'#e9dfc9');box(s,106,2,0,.2,4,10,'#e9dfc9');box(s,100,3.94,-4.88,12,.14,.14,wood);for(const x of [94.1,105.9])box(s,x,2,-4.9,.18,4,.18,wood);box(s,100,.25,-4.88,12,.1,.1,wood);
 box(s,96,.12,-3,2,.18,3,'#f2ede0');box(s,96,.24,-2.7,1.9,.08,2.2,'#4b5f80');box(s,96,.27,-4,.8,.12,.4,'#f6f2e8');
 cyl(s,100,.4,1,1,1,.08,'#8b6a48',24);for(const a of [0,2.1,4.2])cyl(s,100+Math.cos(a)*.6,.18,1+Math.sin(a)*.6,.05,.06,.36,'#6b4c3a');ball(s,100.2,.55,1,.16,'#7d8f7a');cyl(s,100.5,.52,.85,.03,.03,.3,'#7d8f7a').rotation.z=-1.1;for(const [x,z]of [[99.5,.6],[100.4,1.5]])cyl(s,x,.5,z,.09,.07,.12,'#eae1c9');box(s,98.6,.05,1,.62,.09,.62,'#a94a4a');box(s,101.4,.05,1,.62,.09,.62,'#3f5a7a');
 box(s,104,1.2,-4.4,2,2.4,.7,'#5a3f2f');for(let i=0;i<4;i++){box(s,104,.4+i*.55,-4.02,1.8,.42,.05,'#6b4c3a');box(s,104,.4+i*.55,-3.98,.3,.06,.03,'#c9b27a')}
 box(s,97.5,2.3,-4.85,.8,1.8,.04,'#f4efe2');box(s,97.5,3.25,-4.83,.9,.06,.06,wood);const stroke=ball(s,97.5,2.15,-4.8,.16,'#6f8f6a');stroke.scale.set(1,1.6,.2);cyl(s,98.7,.28,-4.4,.15,.2,.5,'#3f5a7a');cyl(s,98.7,.85,-4.4,.02,.02,.7,'#6b5140');for(let i=0;i<4;i++)ball(s,98.55+i*.1,1.05+i*.08,-4.4,.05,'#d8743f');
 box(s,101.5,2.2,-4.86,1.8,1.4,.05,'#f5f0e2');for(let i=0;i<4;i++)box(s,100.75+i*.5,2.2,-4.82,.04,1.4,.03,wood);for(let i=0;i<3;i++)box(s,101.5,1.65+i*.55,-4.82,1.8,.04,.03,wood);
 box(s,95.2,.6,3,.5,1.1,.5,'#efe4c6');for(const x of [94.97,95.43])box(s,x,.6,3.25,.04,1.1,.04,wood);kanban(s,'わたしのいえ',100,2.9,-4.85,2.8);t.roomSign=kanban(s,'← でる',100,1,4.3,2);
 t.addEntity('exit','ひろばに でる',100,3.7,'door',1.5);t.addEntity('mirror','たんす',103.5,-2.8,'wardrobe',1.8).room='home';
 // Tea house: dark floorboards, a counter with tea tins, a low table and hanging lanterns.
 t.cafeRoom=new T.Group();t.scene.add(t.cafeRoom);const c=t.cafeRoom;box(c,100,-.08,0,12,.2,10,'#7a5b42');for(let i=0;i<12;i++)box(c,94.5+i,.035,0,.03,.01,10,'#5a4331');box(c,100,2,-5,12,4,.2,'#e8dcc6');box(c,94,2,0,.2,4,10,'#e1d3ba');box(c,106,2,0,.2,4,10,'#e8dcc6');box(c,100,3.94,-4.88,12,.14,.14,wood);for(const x of [94.1,105.9])box(c,x,2,-4.9,.18,4,.18,wood);
 box(c,102,.9,-3,6,1.8,1.3,'#5a3f2f');box(c,102,1.85,-3,6.2,.12,1.5,'#c9b27a');box(c,102,2.8,-4.8,5,.08,.5,wood);box(c,102,3.5,-4.8,5,.08,.5,wood);for(let i=0;i<5;i++){cyl(c,100+i,3.05,-4.7,.16,.16,.42,['#3f5a7a','#7d8f7a','#b8412f','#c9b27a','#3f5a7a'][i]);cyl(c,100+i,3.7,-4.7,.12,.1,.16,'#eae1c9')}for(let i=0;i<4;i++)cyl(c,99.8+i*1.2,2,-3,.1,.08,.14,'#eae1c9');ball(c,103.5,2.08,-3,.18,'#7d8f7a');
 for(let i=0;i<3;i++)box(c,97.3+i*.5,2.15,-4.8,.46,.9,.03,'#8a3b2f');box(c,97.8,2.62,-4.8,1.6,.06,.06,wood);
 cyl(c,96.5,.38,0,1,1,.08,'#8b6a48',24);for(const a of [0,2.1,4.2])cyl(c,96.5+Math.cos(a)*.6,.17,Math.sin(a)*.6,.05,.06,.34,'#6b4c3a');for(const [x,z]of [[96.1,.2],[96.9,-.3]])cyl(c,x,.48,z,.09,.07,.12,'#eae1c9');box(c,96.5,.05,1.3,.62,.09,.62,'#a94a4a');box(c,96.5,.05,-1.3,.62,.09,.62,'#3f5a7a');
 chochin(t,c,98,3.2,-2,'#f0e6d2');chochin(t,c,104,3.2,1,'#d9603f');kanban(c,'ちゃや かえで',100,3.4,-4.85,3.2);const h=t.npc('haruto','はると',101,-1.3,{shirt:'#3f5a7a',style:'crop',hair:'#2a2622',skin:'#d9b28f'},c);h.room='cafe';h.y=2.6;kanban(c,'← でる',100,1,4.3,2);t.homeRoom.visible=t.cafeRoom.visible=false;
 },
 tick(t,dt){for(const k of t.koi){k.a+=dt*k.speed;k.mesh.position.set(Math.cos(k.a)*k.r,.24,Math.sin(k.a)*k.r);k.mesh.rotation.y=-k.a}for(const l of t.lanterns)l.position.x=l.userData.bx+Math.sin(t.time*1.1+l.userData.bx)*.05}
};
function house(t,x,z,w,h,d,wall,accent,label,entry=null,collision=true,roof=tile){const g=new T.Group();g.position.set(x,0,z);t.scene.add(g);box(g,0,.2,0,w+.2,.4,d+.2,'#8d887b');t.cameraBlockers.push(box(g,0,h/2,0,w,h,d,wall));
 // Timber frame over plaster: corner posts, a mid-height rail and the top beam.
 for(const sx of [-1,1])for(const sz of [-1,1])box(g,sx*w/2,h/2,sz*d/2,.2,h,.2,wood);box(g,0,h-.12,d/2+.05,w+.2,.22,.12,wood);box(g,0,h*.52,d/2+.05,w+.2,.14,.1,wood);for(const sx of [-1,1])box(g,sx*w*.16,h/2,d/2+.04,.12,h,.1,wood);
 // A low-pitched hip of dark tiles with deep eaves, tile rows, and a heavy ridge.
 const roofGeo=new T.BufferGeometry();const a=w/2+.9,b=d/2+.9,r=1.15;const verts=[-a,0,-b,a,0,-b,0,r,-b,-a,0,b,0,r,b,a,0,b,-a,0,-b,0,r,-b,0,r,b,-a,0,-b,0,r,b,-a,0,b,a,0,-b,a,0,b,0,r,b,a,0,-b,0,r,b,0,r,-b];roofGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));roofGeo.computeVertexNormals();const rm=new T.Mesh(roofGeo,mat(roof));rm.position.y=h;rm.castShadow=true;g.add(rm);
 for(let k=0;k<Math.floor(2*b/.4)+1;k++){const zz=-b+k*.4;for(const side of [-1,1]){const row=box(g,side*a/2,h+r/2+.03,zz,Math.hypot(a,r),.07,.1,'#5b626f');row.rotation.z=-side*Math.atan2(r,a)}}
 box(g,0,h+r+.05,0,w*.72,.16,.34,'#3d434d');for(const sz of [-1,1])box(g,0,h+.03,sz*b,2*a,.12,.16,'#3d434d');for(const sx of [-1,1])box(g,sx*a,h+.03,0,.16,.12,2*b,'#3d434d');
 if(h>5.8){const e=box(g,0,3.55,d/2+.6,w+.6,.09,1.3,roof);e.rotation.x=.12}
 // Sliding shoji door on a stone step, lattice windows.
 box(g,0,1.05,d/2+.03,1.4,2.1,.06,'#f5f0e2');for(const sx of [-.72,.72])box(g,sx,1.1,d/2+.06,.08,2.2,.08,wood);box(g,0,2.16,d/2+.06,1.52,.08,.08,wood);for(const sx of [-.47,-.235,0,.235,.47])box(g,sx,1.05,d/2+.065,.03,2.05,.03,wood);for(const yy of [.5,1.05,1.6])box(g,0,yy,d/2+.065,1.4,.03,.03,wood);box(g,0,.08,d/2+.45,1.6,.16,.7,'#a19b8c');
 for(const xx of [-w*.29,w*.29])for(const yy of (h>5.8?[1.65,4.7]:[2.8])){box(g,xx,yy,d/2+.04,1.3,1.3,.1,wood);box(g,xx,yy,d/2+.06,1.1,1.1,.04,'#f2ecdc');for(let i=0;i<8;i++)box(g,xx-.5+i*.143,yy,d/2+.1,.05,1.15,.05,wood);box(g,xx,yy-.7,d/2+.2,1.4,.08,.35,wood)}
 // Shops hang a split noren and a paper lantern under a small tiled awning.
 if(entry==='shop'||entry==='cafe'){for(let i=0;i<3;i++)box(g,-.47+i*.47,1.95,d/2+.16,.44,.75,.03,accent);box(g,0,2.36,d/2+.16,1.6,.06,.06,wood);const aw=box(g,0,2.58,d/2+.62,2.7,.08,1.15,roof);aw.rotation.x=.14;chochin(t,g,w*.36,2.05,d/2+.4,'#f0e6d2')}
 if(entry==='home'){chochin(t,g,w*.36,2.05,d/2+.4,'#f0e6d2');cyl(g,-w*.36,.3,d/2+.7,.3,.24,.5,'#7a5b42');ball(g,-w*.36,.85,d/2+.7,.4,'#4f6b4a').scale.y=.7}
 if(label)kanban(g,label,0,2.95,d/2+.14,Math.min(w-1,3.1));
 if(collision)t.obstacle(x,z,w,d);return g;
}
function chochin(t,p,x,y,z,color){cyl(p,x,y+.3,z,.02,.02,.3,'#3b2f2b');const l=ball(p,x,y,z,.22,color,2);l.scale.set(1,1.35,1);l.userData.bx=x;t.lanterns.push(l);for(const dy of [-.3,.3])cyl(p,x,y+dy,z,.1,.1,.05,'#3b2f2b');if(color!=='#d9603f')cyl(p,x,y,z,.225,.225,.08,'#b8412f');return l}
function pine(t,x,z,scale=1){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);t.scene.add(g);const trunk=cyl(g,.15,1.5,0,.14,.22,3,'#5e4a3a');trunk.rotation.z=.12;for(const [dx,y,r]of [[-.5,2.4,1.1],[.55,3.15,.95],[0,3.9,.75]]){const b=ball(g,dx,y,0,r,['#4f6b4a','#5a7a52','#46613f'][Math.round(y)%3],1);b.scale.set(1.35,.42,1.35)}t.obstacle(x,z,.9,.9)}
function maple(t,x,z,scale=1){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);t.scene.add(g);cyl(g,0,1.3,0,.14,.2,2.6,'#6b5140');for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ball(g,Math.cos(a)*.7,2.8+(i%2)*.4,Math.sin(a)*.7,1.05,['#c9573a','#d8743f','#b8452f'][i%3])}t.obstacle(x,z,.9,.9)}
function bamboo(t,x,z){for(let i=0;i<5;i++){const dx=Math.cos(i*2.1)*.6,dz=Math.sin(i*2.1)*.6;cyl(t.scene,x+dx,2.6,z+dz,.06,.07,5.2,'#7ea36a',6);for(let k=1;k<5;k++)cyl(t.scene,x+dx,k*1.1,z+dz,.075,.075,.06,'#5f8450',6);for(let k=0;k<3;k++){const leaf=ball(t.scene,x+dx+Math.cos(k*2+i)*.35,3.6+k*.6,z+dz+Math.sin(k*2+i)*.35,.16,'#86ad6c');leaf.scale.set(1.8,.3,.6)}}t.obstacle(x,z,1.4,1.4)}
function tsukubai(t,x,z){cyl(t.scene,x,.25,z,.45,.4,.5,stone,10);cyl(t.scene,x,.5,z,.32,.32,.03,'#6f9c98',16);ball(t.scene,x+.5,.2,z+.2,.28,'#5e7d4d');ball(t.scene,x-.4,.14,z-.35,.18,'#6f8f6a')}
function bench(t,x,z,r){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=r;t.scene.add(g);box(g,0,.5,0,2,.1,.7,'#a08055');box(g,0,.57,0,2,.04,.72,'#b23b3b');for(const xx of [-.8,.8])box(g,xx,.25,0,.1,.5,.6,'#63513f');t.obstacle(x,z,2,.7)}
function teaBench(t,x,z){bench(t,x,z,0);box(t.scene,x-.5,.64,z,.5,.04,.35,'#3b2f2b');for(const dx of [-.62,-.38])cyl(t.scene,x+dx,.72,z,.07,.06,.1,'#eae1c9');t.obstacle(x,z,2.6,1.5)}
function toro(t,x,z,p=t.scene){cyl(p,x,.15,z,.36,.4,.3,stone,8);cyl(p,x,.9,z,.12,.14,1.3,stone,8);box(p,x,1.62,z,.7,.14,.7,stone);box(p,x,1.95,z,.48,.52,.48,'#e8dcc2');cyl(p,x,2.4,z,.06,.62,.36,'#7a756a',4);ball(p,x,2.68,z,.1,stone)}
