// The Crossing: a deliberately plain neutral plaza. No language flavor here —
// two archways lead to Valdeluz and Hinata. This is the very first thing a new
// player sees, so it stays sparse on purpose rather than pre-biasing a choice.
import * as T from '../../vendor/three.module.js';
import {box,ball,cyl,sign,makeAvatar} from './parts.js';
export const hub={
 sky:{background:'#e7e4da',fog:[46,110],hemi:['#fbf8ee','#8d8a7d',2],sun:['#fff6e4',2.6,[-16,28,15]]},
 doors:{home:{x:-15,z:10},cafe:{x:14,z:-4}},
 town(t){
  const s=t.scene;box(s,0,-.3,0,110,.5,110,'#cfcabb');
  const plaza=new T.Mesh(new T.CylinderGeometry(15,15,.12,48),new T.MeshStandardMaterial({color:'#d9d4c4',roughness:1}));plaza.position.y=-.02;plaza.receiveShadow=true;s.add(plaza);
  const ring=new T.Mesh(new T.TorusGeometry(15,.18,10,48),new T.MeshStandardMaterial({color:'#a79c81'}));ring.rotation.x=Math.PI/2;ring.position.y=.02;s.add(ring);
  // A simple compass inlay in the plaza floor — decorative, no gameplay meaning.
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const spoke=box(s,Math.cos(a)*7,0,Math.sin(a)*7,.14,.02,9,'#c2bca8');spoke.rotation.y=-a}
  cyl(s,0,.05,0,1.3,1.3,.1,'#b7ad91',24);
  archway(t,-14,-10,'#c98457','ESPAÑA','door_es');
  archway(t,14,-10,'#5c7a86','日本','door_ja');
  for(const [x,z]of [[-9,6],[9,6]])bench(t,x,z);
  for(const [x,z]of [[-11,-2],[11,-2]])lamp(t,x,z);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const x=Math.cos(a)*28,z=Math.sin(a)*28;ball(s,x,1.6,z,2.4,'#a9b09a',1).scale.y=.7}
  const guide=makeAvatar({shirt:'#8a95a6',hair:'#4a3f36',style:'bob',skin:'#c9976e',accessory:'scarf'});guide.position.set(0,0,4);s.add(guide);
  t.addEntity('guide','Aya',0,4,'npc',2.4).avatar=guide;
  // Trigger points sit a few units in front of each solid archway (toward the plaza
  // center), matching how home/cafe doors work elsewhere: the structure itself blocks
  // walking, and interacting near it (not literally passing through it) fires the event.
  t.addEntity('door_es','Puerta de España',-14,-6.5,'door',2.2);
  t.addEntity('door_ja','日本の扉',14,-6.5,'door',2.2);
 },
 rooms(t){
  // The hub has no interiors of its own yet — placeholder empty groups satisfy
  // Town.enter()'s unconditional homeRoom/cafeRoom references.
  t.homeRoom=new T.Group();t.scene.add(t.homeRoom);t.homeRoom.visible=false;
  t.cafeRoom=new T.Group();t.scene.add(t.cafeRoom);t.cafeRoom.visible=false;
  t.dinnerFood=new T.Group();t.dinnerFood.visible=false;
 }
};
function archway(t,x,z,color,label,doorId){
 const g=new T.Group();g.position.set(x,0,z);t.scene.add(g);
 for(const side of [-1,1])box(g,side*1.5,1.8,0,.5,3.6,.5,color);
 box(g,0,3.5,0,3.9,.5,.5,color);
 sign(g,label,0,4.35,0,2.6,'#fff',{bg:color,border:'#00000022',font:'bold 46px Georgia',color:'#fff'});
 t.cameraBlockers.push(box(g,0,1.8,-.6,.1,3.6,.1,color));
 t.obstacle(x,z,3,1.2);
}
function bench(t,x,z){const g=new T.Group();g.position.set(x,0,z);t.scene.add(g);for(let i=0;i<3;i++)box(g,0,.6,-.25+i*.22,2,.1,.18,'#a99b7f');for(const xx of [-.75,.75])box(g,xx,.34,0,.08,.7,.7,'#736c5c');t.obstacle(x,z,2,.7)}
function lamp(t,x,z){cyl(t.scene,x,1.8,z,.05,.09,3.6,'#7a7462');box(t.scene,x,3.6,z,.38,.6,.38,'#efe6cf');cyl(t.scene,x,3.95,z,0,.36,.25,'#847c66',4)}
