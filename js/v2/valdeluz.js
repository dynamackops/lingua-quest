// Valdeluz: the sunlit Spanish plaza, its bakery, market, café and home, plus the two interiors.
import * as T from '../../vendor/three.module.js';
import {box,ball,cyl,sign,mat,makeAvatar,archway} from './parts.js';
export const valdeluz={
 sky:{background:'#dce6df',fog:[42,105],hemi:['#fffae8','#829176',2.1],sun:['#fff0cf',3.1,[-17,30,14]]},
 doors:{home:{x:-15,z:10},cafe:{x:14,z:-4}},
 town(t){
 const s=t.scene;box(s,0,-.3,0,110,.5,110,'#a6b282');
 // A paved square, with softly irregular limestone blocks drawn once into a texture.
 const cv=document.createElement('canvas');cv.width=cv.height=512;const cx=cv.getContext('2d');cx.fillStyle='#cbbf9f';cx.fillRect(0,0,512,512);for(let r=0;r<8;r++)for(let c=0;c<8;c++){const v=199+((r*13+c*7)%16);cx.fillStyle=`rgb(${v+12},${v+4},${v-15})`;cx.fillRect(c*64+(r%2)*32-30,r*64+1,62,62)}const tx=new T.CanvasTexture(cv);tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(6,6);tx.colorSpace=T.SRGBColorSpace;
 const plaza=new T.Mesh(new T.BoxGeometry(37,.12,34),new T.MeshStandardMaterial({map:tx,roughness:1}));plaza.position.set(0,-.01,1);plaza.receiveShadow=true;s.add(plaza);
 box(s,0,-.025,23,8,.1,20,'#cdbf9e');box(s,26,-.02,4,24,.1,6,'#cdbf9e');box(s,-26,-.02,4,24,.1,6,'#cdbf9e');
 building(t,-12,-9,7,5.4,5.5,'#eddfc3','#839786','PANADERÍA','bakery');
 building(t,-3,-14,7,7,5,'#e7cbb1','#78988e','CASA DE LUCÍA');
 building(t,6,-14,7,6,5,'#eeddbb','#738b78','');
 building(t,14,-8,6,5.5,6,'#d9b19a','#668879','CAFÉ AZAHAR','cafe');
 building(t,-15,5,6,4.2,6,'#eadbb8','#7b947c','MI CASA','home');
 // Low boundary walls and distant hillside houses.
 for(let i=0;i<8;i++){const x=-34+i*10;ball(s,x,1,-42,12+i%3*2,['#9cab8c','#abb798','#b6bea2'][i%3],1).scale.y=.6}
 for(const x of [-27,-20,20,27])building(t,x,-24,5,4+(x%3),4,'#e7d6b6','#849581','',null,false);
 for(let i=0;i<10;i++){const x=-26+i*5.6;tree(t,x,-22,1.1,i%3===0)}
 const fountain=new T.Group();s.add(fountain);fountain.position.set(0,0,0);
 cyl(fountain,0,.13,0,2.6,2.7,.24,'#bcb596',16);cyl(fountain,0,.39,0,2.2,2.35,.4,'#e5dbc0',16);cyl(fountain,0,.61,0,1.95,1.95,.055,'#7fa9a0',32);cyl(fountain,0,1.05,0,.3,.47,1.1,'#d8d0b2');cyl(fountain,0,1.5,0,1.1,.45,.18,'#e9dfc3',16);cyl(fountain,0,1.60,0,.96,.96,.035,'#8eb8b0',24);cyl(fountain,0,1.85,0,.14,.22,.5,'#d8d0b2');ball(fountain,0,2.12,0,.22,'#dfd8b9');t.obstacle(0,0,4.9,4.9);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;t.water.push({mesh:ball(fountain,Math.cos(a)*.85,1.1,Math.sin(a)*.85,.04,'#aed7cb'),top:1.4,fall:.7})}
 // Market pavilion, vegetables, baskets and striped canopy.
 const stall=new T.Group();stall.position.set(10,0,3);s.add(stall);box(stall,0,.85,0,4,1.45,1.6,'#a77e51');for(let i=0;i<8;i++)box(stall,-1.75+i*.5,.85,.82,.035,1.35,.035,'#8e6847');for(const x of [-1.9,1.9])for(const z of [-.65,.65])cyl(stall,x,1.85,z,.055,.055,3.7,'#8f7952');for(let i=0;i<10;i++){const aw=box(stall,-2.025+i*.45,3.25,0,.45,.14,2.6,i%2?'#e9dfb8':'#899764');aw.rotation.x=-.1;box(stall,-2.025+i*.45,3.05,1.25,.45,.32,.08,i%2?'#e9dfb8':'#899764')}
 for(let i=0;i<3;i++){box(stall,-1.3+i*1.3,1.65,0,1.1,.23,1.05,'#b39160');for(let j=0;j<6;j++)ball(stall,-1.62+i*1.3+(j%3)*.3,1.9,Math.floor(j/3)*.35-.2,.17,['#bf6043','#cbac4b','#79905b'][i])}sign(stall,'EL MERCADO',0,2.45,1,2.7);t.obstacle(10,3,4,1.8);
 tree(t,-7,5,1.2);tree(t,7,9,1.1);tree(t,-9,-3,.8);tree(t,18,10,1.2);tree(t,-20,-4,1.2,true);tree(t,19,-15,1.3,true);tree(t,-19,13,1.1,true);tree(t,14,16,.85);tree(t,-7,18,.8);
 for(const [x,z]of [[-5,-4],[5,-5],[-6,10],[16,6]])planter(t,x,z);
 bench(t,-4,4,.9);bench(t,4,-4,-.9);bench(t,-9,12,0);
 for(const [x,z]of [[-7,1],[7,-4],[-17,11],[18,0]])lamp(t,x,z);
 for(const [x,z]of [[11,-3],[15,-2],[15,1]])cafeTable(t,x,z);
 // Shared dinner table in the courtyard.
 const dinner=new T.Group();dinner.position.set(-6,0,-6);s.add(dinner);box(dinner,0,1,0,3.3,.15,1.6,'#a98a59');for(const x of [-1.3,1.3])for(const z of [-.5,.5])box(dinner,x,.5,z,.13,1,.13,'#90744e');box(dinner,0,1.09,0,3.15,.03,1.45,'#f3e8cb');for(const x of [-1,0,1]){cyl(dinner,x,1.13,.35,.24,.24,.035,'#f9f0d9');cyl(dinner,x,1.13,-.35,.24,.24,.035,'#f9f0d9')}
 t.dinnerFood=new T.Group();dinner.add(t.dinnerFood);t.dinnerFood.visible=false;for(let i=0;i<6;i++)ball(t.dinnerFood,(i%3-1)*.6,1.28,Math.floor(i/3)*.3-.15,.17,i%2?'#bd6249':'#d7ad65');t.obstacle(-6,-6,3.3,1.6);
 // Bunting strung across the plaza.
 const points=[];for(let i=0;i<=24;i++){const x=-14+i*28/24,y=7-Math.sin(i/24*Math.PI)*1.9;points.push(new T.Vector3(x,y,-5));if(i%2===0){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([x-.25,y,-5,x+.25,y,-5,x,y-.55,-5],3));geo.computeVertexNormals();const flag=new T.Mesh(geo,new T.MeshStandardMaterial({color:['#c17857','#a7ac77','#d8bd79','#789a91'][i/2%4],side:T.DoubleSide}));s.add(flag)}}s.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:'#8e876d'})));
 t.npc('lucia','Lucía',-3,4,{shirt:'#b98665',hair:'#6c4a36',style:'bun',skin:'#d6a17a'});t.npc('mateo','Mateo',-11,-4.5,{shirt:'#e5dbbd',hair:'#564431',style:'crop',skin:'#c99873'});t.npc('ines','Inés',9,5.2,{shirt:'#688c83',hair:'#49372c',style:'bob',skin:'#bb825e'});t.npc('marta','Marta',10,8,{shirt:'#a9789a',hair:'#5b4432',style:'curls',skin:'#caa377',hat:'flowercrown'});
 t.addEntity('home','Mi casa',-15,8.8,'door',1.8);t.addEntity('cafe','Café Azahar',14,-4.5,'door',2);t.addEntity('table','La mesa',-6,-4.3,'table',1.8);t.addEntity('fountain','La fuente',0,3,'object',1.2);
 // A plain gate back to The Crossing — the same shape and neutral colour as the hub's
 // own archways, so both ends of the trip look like the same place.
 archway(t,0,24,'#8d8a7d','THE CROSSING');t.addEntity('door_hub','El Cruce',0,20,'door',2.2);
 },
 rooms(t){
 t.homeRoom=new T.Group();t.scene.add(t.homeRoom);const s=t.homeRoom;box(s,100,-.08,0,12,.2,10,'#c4ad89');box(s,100,2,-5,12,4,.2,'#ede0c5');box(s,94,2,0,.2,4,10,'#e3d3b6');box(s,106,2,0,.2,4,10,'#e3d3b6');for(let i=0;i<12;i++)box(s,94.5+i,.035,0,.025,.01,10,'#b39a79');box(s,100,.04,0,5,.035,4,'#b98168');for(let i=0;i<4;i++)box(s,100,.065,-1.6+i,4.5,.02,.07,'#dbc3a0');
 box(s,96,.4,-3,2,.65,3,'#997e58');box(s,96,.79,-3,1.9,.15,2.9,'#f0e5cc');box(s,96,.92,-2.5,1.95,.09,1.8,'#8c9e85');box(s,96,.93,-4,1.4,.23,.6,'#f5ebd3');box(s,104,1.3,-4.4,2,2.6,.7,'#a68b62');box(s,104,1.5,-3.99,1,1.55,.03,'#a9c6bd');sign(s,'MI CASA',100,2.9,-4.85,2.8);
 box(s,99.5,2.2,-4.86,1.7,1.4,.05,'#9cb5a5');box(s,99.5,2.2,-4.80,.06,1.4,.04,'#f7eed8');box(s,99.5,2.2,-4.80,1.7,.06,.04,'#f7eed8');planter(t,95.3,2.8,s);cafeTable(t,103,1,s);t.roomSign=sign(s,'← SALIR',100,1,4.3,2);
 t.addEntity('exit','Salir a la plaza',100,3.7,'door',1.5);t.addEntity('mirror','Mi armario',103.5,-2.8,'wardrobe',1.8).room='home';
 t.cafeRoom=new T.Group();t.scene.add(t.cafeRoom);const c=t.cafeRoom;box(c,100,-.08,0,12,.2,10,'#cfbd9c');box(c,100,2,-5,12,4,.2,'#e8d7b8');box(c,94,2,0,.2,4,10,'#d9b89b');box(c,106,2,0,.2,4,10,'#e8d7b8');box(c,102,1,-3,6,1.8,1.3,'#849b84');box(c,102,1.95,-3,6.2,.15,1.5,'#d9c79f');for(let i=0;i<4;i++){box(c,100+i,2.6,-4.8,.6,.8,.1,'#758b73');cyl(c,99.5+i,2.18,-3,.13,.13,.32,'#eae1c9')}sign(c,'CAFÉ AZAHAR',100,3.4,-4.85,3.2);const diego=makeAvatar({shirt:'#d7be8d',style:'crop',hair:'#534331'});diego.position.set(101,0,-1.3);c.add(diego);t.addEntity('diego','Diego',101,-1.3,'npc',2.6).room='cafe';sign(c,'← SALIR',100,1,4.3,2);t.homeRoom.visible=t.cafeRoom.visible=false;
 }
};
function building(t,x,z,w,h,d,color,shutter,label,entry=null,collision=true){const g=new T.Group();g.position.set(x,0,z);t.scene.add(g);t.cameraBlockers.push(box(g,0,h/2,0,w,h,d,color));box(g,0,.23,0,w+.12,.4,d+.12,'#c4b799');box(g,0,h-.05,0,w+.3,.16,d+.3,'#cdb68e');
 const roof=new T.BufferGeometry();const a=w/2+.35,b=d/2+.35,r=1.4;const verts=[-a,0,-b,a,0,-b,0,r,-b,-a,0,b,0,r,b,a,0,b,-a,0,-b,0,r,-b,0,r,b,-a,0,-b,0,r,b,-a,0,b,a,0,-b,a,0,b,0,r,b,a,0,-b,0,r,b,0,r,-b];roof.setAttribute('position',new T.Float32BufferAttribute(verts,3));roof.computeVertexNormals();const rm=new T.Mesh(roof,mat('#b97955'));rm.position.y=h;rm.castShadow=true;g.add(rm);
 for(let k=0;k<Math.floor(d/.35)+1;k++){const zz=-b+k*.36;for(const side of [-1,1]){const ridge=box(g,side*a/2,h+r/2+.025,zz,Math.hypot(a,r),.065,.09,'#c38961');ridge.rotation.z=-side*Math.atan2(r,a)}}
 box(g,w*.3,h+.65,-.6,.65,1.3,.65,'#e2cfaf');box(g,w*.3,h+1.3,-.6,.85,.12,.85,'#b98765');
 box(g,0,1.05,d/2+.025,1.18,2.1,.07,'#698275');box(g,0,2.13,d/2+.08,1.4,.15,.2,'#cfbd96');ball(g,.36,1,d/2+.12,.052,'#d5b675');for(let i=-2;i<3;i++)box(g,i*.21,1.05,d/2+.08,.02,2,.02,'#536e60');
 for(const xx of [-w*.29,w*.29])for(const yy of (h>5.8?[1.65,4.5]:[2.8])){box(g,xx,yy,d/2+.04,1.25,1.55,.12,'#d0bb90');box(g,xx,yy,d/2+.12,.82,1.27,.07,'#53695e');for(const side of [-1,1]){box(g,xx+side*.61,yy,d/2+.17,.36,1.37,.12,shutter);for(let i=0;i<7;i++)box(g,xx+side*.61,yy-.55+i*.18,d/2+.245,.32,.045,.025,'#9bad8e')}box(g,xx,yy,d/2+.19,.035,1.25,.03,'#e5dac0');box(g,xx,yy,d/2+.19,.8,.035,.03,'#e5dac0');box(g,xx,yy-.82,d/2+.3,1.4,.15,.4,'#d0bd94');box(g,xx,yy-.67,d/2+.4,.9,.23,.25,'#b37957');for(let j=0;j<5;j++){ball(g,xx-.35+j*.17,yy-.5,d/2+.4,.12,'#859466');ball(g,xx-.35+j*.17,yy-.4,d/2+.46,.065,j%2?'#d5a78b':'#ae7069')}}
 if(label)sign(g,label,0,h>5.8?3.2:2.9,d/2+.15,Math.min(w-1,3.1));
 if(entry==='bakery'||entry==='cafe'){for(let i=0;i<10;i++){const aw=box(g,-w*.4+i*w*.08,2.6,d/2+.75,w*.08,.12,1.55,i%2?'#f0dfbc':entry==='cafe'?'#759188':'#be895f');aw.rotation.x=.16}}
 if(collision)t.obstacle(x,z,w,d);return g;
}
function tree(t,x,z,scale=1,cypress=false){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);t.scene.add(g);cyl(g,0,1.3,0,.16,.23,2.6,'#927a52');if(cypress){for(let i=0;i<3;i++){const b=ball(g,0,2.5+i*.85,0,1-i*.15,'#63836c');b.scale.y=1.6}}else{for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ball(g,Math.cos(a)*.7,2.8+(i%2)*.4,Math.sin(a)*.7,1.13,['#8c9f74','#96a47b','#81956e'][i%3])}for(let i=0;i<5;i++){const a=i*1.4;ball(g,Math.cos(a)*1.1,2.7,Math.sin(a)*1.1,.1,'#ba9e55')}}t.obstacle(x,z,.9,.9)}
function planter(t,x,z,p=t.scene){cyl(p,x,.3,z,.48,.35,.6,'#ba8562');ball(p,x,.65,z,.47,'#829865');for(let i=0;i<5;i++)ball(p,x+Math.cos(i*1.3)*.3,.88,z+Math.sin(i*1.3)*.3,.1,'#d0a69c')}
function bench(t,x,z,r){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=r;t.scene.add(g);for(let i=0;i<3;i++)box(g,0,.6,-.25+i*.22,2,.1,.18,'#a38a5c');for(let i=0;i<2;i++)box(g,0,.95+i*.2,-.38,2,.16,.08,'#ab9469');for(const xx of [-.75,.75]){box(g,xx,.34,0,.08,.7,.7,'#63705a');box(g,xx,.9,-.4,.07,.8,.08,'#63705a')}t.obstacle(x,z,2,.7)}
function lamp(t,x,z){cyl(t.scene,x,1.8,z,.05,.09,3.6,'#586455');box(t.scene,x,3.6,z,.38,.6,.38,'#e8d5a1');cyl(t.scene,x,3.95,z,0,.36,.25,'#5f6c58',4)}
function cafeTable(t,x,z,p=t.scene){cyl(p,x,.95,z,.7,.7,.12,'#d3be8f');cyl(p,x,.48,z,.06,.1,.9,'#63715d');for(const a of [0,Math.PI]){const xx=x+Math.cos(a),zz=z+Math.sin(a);box(p,xx,.48,zz,.5,.1,.5,'#86997a');box(p,xx+Math.cos(a)*.2,.8,zz,.08,.55,.5,'#86997a')}cyl(p,x,.99,z,.12,.1,.3,'#e9e1c8');if(p===t.scene)t.obstacle(x,z,2.6,1.5)}
