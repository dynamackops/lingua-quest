// The Crossing: a deliberately plain neutral plaza. No language flavor here —
// two archways lead to Valdeluz and Hinata. This is the very first thing a new
// player sees, so it stays sparse on purpose rather than pre-biasing a choice.
import * as T from '../../vendor/three.module.js';
import {box,ball,cyl,makeAvatar,archway,ground,cobble,bush,lampPost} from './parts.js';
export const hub={
 sky:{background:'#ead9b4',fog:[42,112],hemi:['#fff4dc','#8d8168',1.9],sun:['#ffd8a4',2.05,[-16,22,15]]},
 doors:{home:{x:-15,z:10},cafe:{x:14,z:-4}},
 town(t){
  const s=t.scene;ground(s);
  const cobbles=cobble().clone();cobbles.repeat.set(8,8);cobbles.userData.keep=true;
  const plaza=new T.Mesh(new T.CircleGeometry(15,48),new T.MeshStandardMaterial({map:cobbles,roughness:.93}));plaza.rotation.x=-Math.PI/2;plaza.position.y=.012;plaza.receiveShadow=true;s.add(plaza);
  const ring=new T.Mesh(new T.TorusGeometry(15,.18,10,48),new T.MeshStandardMaterial({color:'#a79c81'}));ring.rotation.x=Math.PI/2;ring.position.y=.02;s.add(ring);
  // A simple compass inlay in the plaza floor — decorative, no gameplay meaning.
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const spoke=box(s,Math.cos(a)*7,0,Math.sin(a)*7,.14,.02,9,'#c2bca8');spoke.rotation.y=-a}
  cyl(s,0,.05,0,1.3,1.3,.1,'#b7ad91',24);
  // Archways sit on the plaza ring itself, spread around the circle (west and
  // east) rather than side by side, so The Crossing reads as a hub with paths
  // radiating outward in different directions and has room for more doors later.
  archway(t,-15,0,'#c98457','ESPAÑA');
  archway(t,15,0,'#5c7a86','日本');
  // Two more archways, greyed out rather than painted in a language's own colour,
  // sitting in the ring's open back quadrants (away from the entry path) so the
  // hub visibly has room to grow without anything behind these doors working yet.
  archway(t,-10.6,-10.6,'#b5ae9b','ITALIA');
  archway(t,10.6,-10.6,'#b5ae9b','FRANCE');
  for(const [x,z]of [[-9,6],[9,6]])bench(t,x,z);
  for(const [x,z]of [[-11,-2],[11,-2]])lamp(t,x,z);
  for(const [x,z]of [[-6,8],[6,8],[-12,4],[12,4]])bush(s,x,z,.75);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const x=Math.cos(a)*28,z=Math.sin(a)*28;ball(s,x,1.6,z,2.4,'#a9b09a',1).scale.y=.7}
  const guide=makeAvatar({shirt:'#8a95a6',hair:'#4a3f36',style:'bob',skin:'#c9976e',accessory:'scarf'});guide.position.set(0,0,4);s.add(guide);
  t.addEntity('guide','Aya',0,4,'npc',2.4).avatar=guide;
  // Trigger points sit a few units in front of each solid archway (toward the plaza
  // center), matching how home/cafe doors work elsewhere: the structure itself blocks
  // walking, and interacting near it (not literally passing through it) fires the event.
  t.addEntity('door_es','Puerta de España',-11,0,'door',2.2);
  t.addEntity('door_ja','日本の扉',11,0,'door',2.2);
  t.addEntity('door_it','Italia (presto)',-7.8,-7.8,'door',2.2);
  t.addEntity('door_fr','France (bientôt)',7.8,-7.8,'door',2.2);
 },
 rooms(t){
  // The hub has no interiors of its own yet — placeholder empty groups satisfy
  // Town.enter()'s unconditional homeRoom/cafeRoom references.
  t.homeRoom=new T.Group();t.scene.add(t.homeRoom);t.homeRoom.visible=false;
  t.cafeRoom=new T.Group();t.scene.add(t.cafeRoom);t.cafeRoom.visible=false;
  t.dinnerFood=new T.Group();t.dinnerFood.visible=false;
 }
};
function bench(t,x,z){const g=new T.Group();g.position.set(x,0,z);t.scene.add(g);for(let i=0;i<3;i++)box(g,0,.6,-.25+i*.22,2,.1,.18,'#a99b7f');for(const xx of [-.75,.75])box(g,xx,.34,0,.08,.7,.7,'#736c5c');t.obstacle(x,z,2,.7)}
function lamp(t,x,z){lampPost(t.scene,x,z)}
