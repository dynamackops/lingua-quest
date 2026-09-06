import * as T from '../../vendor/three.module.js';
const mats=new Map();
function mat(c){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.92}));return mats.get(c)}
function mesh(g,c,x,y,z,parent){const m=new T.Mesh(g,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
const box=(p,x,y,z,w,h,d,c)=>mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p);
const ball=(p,x,y,z,r,c,detail=1)=>mesh(new T.IcosahedronGeometry(r,detail),c,x,y,z,p);
const cyl=(p,x,y,z,r1,r2,h,c,n=12)=>mesh(new T.CylinderGeometry(r1,r2,h,n),c,x,y,z,p);
function sign(p,text,x,y,z,w=2.5,color='#526a55'){
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#f4edda';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#cabd99';ctx.lineWidth=8;ctx.strokeRect(6,6,500,116);ctx.fillStyle=color;ctx.font='bold 45px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,67,474);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);p.add(m);return m;
}
export function makeAvatar(config={}){
 const c={skin:'#c98f68',hair:'#403027',shirt:'#819273',style:'bob',body:'regular',eyes:'#443526',accessory:'none',...config};
 const g=new T.Group(),skin=c.skin,hair=c.hair; const width=c.body==='broad'?1.18:c.body==='slim'?.87:1;
 const torso=cyl(g,0,1.02,0,.26*width,.32*width,.6,c.shirt); const head=ball(g,0,1.68,.01,.29,skin,2);head.scale.set(.88,1.08,.9);
 cyl(g,0,1.39,0,.10,.10,.16,skin);
 const legs=[],arms=[];
 for(const side of [-1,1]){
 const leg=new T.Group();leg.position.set(side*.14*width,.73,0);g.add(leg);cyl(leg,0,-.25,0,.105,.09,.48,'#59676d');box(leg,0,-.52,.075,.21,.14,.32,'#675746');legs.push(leg);
 const arm=new T.Group();arm.position.set(side*.31*width,1.25,0);g.add(arm);cyl(arm,0,-.12,0,.105,.085,.27,c.shirt);cyl(arm,0,-.34,0,.072,.075,.23,skin);ball(arm,0,-.46,0,.078,skin);arm.rotation.z=side*.12;arms.push(arm);
 ball(g,side*.097,1.73,.236,.035,c.eyes,2);ball(g,side*.104,1.743,.26,.009,'#fff9e7');ball(g,side*.24,1.69,0,.066,skin);
 }
 ball(g,0,1.64,.268,.044,skin);box(g,0,1.555,.24,.075,.015,.02,'#945f50');
 if(c.style!=='none'){
 const cap=ball(g,0,1.83,-.035,.293,hair,2);cap.scale.set(1,.70,1);
 if(['bob','long','bun'].includes(c.style))box(g,0,c.style==='long'?1.45:1.65,-.16,.46,c.style==='long'?.75:.35,.23,hair);
 if(c.style==='bob'){ball(g,-.23,1.7,-.015,.125,hair);ball(g,.23,1.7,-.015,.125,hair)}
 if(c.style==='bun')ball(g,0,2.075,-.08,.17,hair);
 if(c.style==='curls')for(let i=0;i<10;i++){const a=i/10*Math.PI*2;ball(g,Math.sin(a)*.22,1.89+Math.cos(a*3)*.035,Math.cos(a)*.18,.13,hair)}
 if(c.style==='crop'){const fringe=ball(g,.12,1.87,.13,.16,hair);fringe.scale.y=.6}
 }
 if(c.accessory==='glasses'){for(const side of [-1,1]){const ring=mesh(new T.TorusGeometry(.076,.012,6,16),'#65543a',side*.1,1.73,.27,g)}box(g,0,1.73,.27,.055,.013,.013,'#65543a')}
 if(c.accessory==='scarf'){cyl(g,0,1.4,0,.14,.18,.1,'#c77552');box(g,.13,1.24,.24,.13,.30,.06,'#c77552')}
 const shadow=new T.Mesh(new T.CircleGeometry(.34,24),new T.MeshBasicMaterial({color:'#3b3b26',transparent:true,opacity:.13,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.065;g.add(shadow);g.userData={legs,arms};return g;
}
export class Town{
 constructor(canvas,{onNear,onInteract,onMove,onTravelFailed}={}){
 this.canvas=canvas;this.onNear=onNear;this.onInteract=onInteract;this.onMove=onMove;this.onTravelFailed=onTravelFailed;this.scene=new T.Scene();this.scene.background=new T.Color('#dce6df');this.scene.fog=new T.Fog('#dce6df',42,105);
 this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;
 this.camera=new T.PerspectiveCamera(44,1,.1,180);this.scene.add(new T.HemisphereLight('#fffae8','#829176',2.1));const light=new T.DirectionalLight('#fff0cf',3.1);light.position.set(-17,30,14);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-38,right:38,top:35,bottom:-35,near:.5,far:90});light.shadow.normalBias=.045;this.scene.add(light);
 this.obstacles=[];this.cameraBlockers=[];this.entities=[];this.keys=new Set();this.path=[];this.yaw=.22;this.pitch=.59;this.distance=15;this.enabled=false;this.blocked=false;this.room='town';this.time=0;this.target=new T.Vector3(0,1,5);this.focus=this.target.clone();this.ray=new T.Raycaster();this.pointer=new T.Vector2();this.ground=new T.Plane(new T.Vector3(0,1,0),0);this.buildTown();this.buildRoom();this.player=makeAvatar();this.player.position.set(0,0,10);this.player.rotation.y=Math.PI;this.scene.add(this.player);this.buildLabels();this.bind();this.resize();this.last=performance.now();this.frame=requestAnimationFrame(t=>this.animate(t));
 }
 obstacle(x,z,w,d){this.obstacles.push({x,z,w:w/2+.36,d:d/2+.36})}
 addEntity(id,label,x,z,type='npc',y=2.8){const e={id,label,x,z,type,y};this.entities.push(e);return e}
 buildTown(){
 const s=this.scene;box(s,0,-.3,0,110,.5,110,'#a6b282');
 // A paved square, with softly irregular limestone blocks drawn once into a texture.
 const cv=document.createElement('canvas');cv.width=cv.height=512;const cx=cv.getContext('2d');cx.fillStyle='#cbbf9f';cx.fillRect(0,0,512,512);for(let r=0;r<8;r++)for(let c=0;c<8;c++){const v=199+((r*13+c*7)%16);cx.fillStyle=`rgb(${v+12},${v+4},${v-15})`;cx.fillRect(c*64+(r%2)*32-30,r*64+1,62,62)}const tx=new T.CanvasTexture(cv);tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(6,6);tx.colorSpace=T.SRGBColorSpace;
 const plaza=new T.Mesh(new T.BoxGeometry(37,.12,34),new T.MeshStandardMaterial({map:tx,roughness:1}));plaza.position.set(0,-.01,1);plaza.receiveShadow=true;s.add(plaza);
 box(s,0,-.025,23,8,.1,20,'#cdbf9e');box(s,26,-.02,4,24,.1,6,'#cdbf9e');box(s,-26,-.02,4,24,.1,6,'#cdbf9e');
 this.building(-12,-9,7,5.4,5.5,'#eddfc3','#839786','PANADERÍA','bakery');
 this.building(-3,-14,7,7,5,'#e7cbb1','#78988e','CASA DE LUCÍA');
 this.building(6,-14,7,6,5,'#eeddbb','#738b78','');
 this.building(14,-8,6,5.5,6,'#d9b19a','#668879','CAFÉ AZAHAR','cafe');
 this.building(-15,5,6,4.2,6,'#eadbb8','#7b947c','MI CASA','home');
 // Low boundary walls and distant hillside houses.
 for(let i=0;i<8;i++){const x=-34+i*10;ball(s,x,1,-42,12+i%3*2,['#9cab8c','#abb798','#b6bea2'][i%3],1).scale.y=.6}
 for(const x of [-27,-20,20,27])this.building(x,-24,5,4+(x%3),4,'#e7d6b6','#849581','',null,false);
 for(let i=0;i<10;i++){const x=-26+i*5.6;this.tree(x,-22,1.1,i%3===0)}
 this.fountain=new T.Group();s.add(this.fountain);this.fountain.position.set(0,0,0);
 cyl(this.fountain,0,.13,0,2.6,2.7,.24,'#bcb596',16);cyl(this.fountain,0,.39,0,2.2,2.35,.4,'#e5dbc0',16);cyl(this.fountain,0,.61,0,1.95,1.95,.055,'#7fa9a0',32);cyl(this.fountain,0,1.05,0,.3,.47,1.1,'#d8d0b2');cyl(this.fountain,0,1.5,0,1.1,.45,.18,'#e9dfc3',16);cyl(this.fountain,0,1.60,0,.96,.96,.035,'#8eb8b0',24);cyl(this.fountain,0,1.85,0,.14,.22,.5,'#d8d0b2');ball(this.fountain,0,2.12,0,.22,'#dfd8b9');this.obstacle(0,0,4.9,4.9);
 this.water=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const drop=ball(this.fountain,Math.cos(a)*.85,1.1,Math.sin(a)*.85,.04,'#aed7cb');this.water.push(drop)}
 // Market pavilion, vegetables, baskets and striped canopy.
 const stall=new T.Group();stall.position.set(10,0,3);s.add(stall);box(stall,0,.85,0,4,1.45,1.6,'#a77e51');for(let i=0;i<8;i++)box(stall,-1.75+i*.5,.85,.82,.035,1.35,.035,'#8e6847');for(const x of [-1.9,1.9])for(const z of [-.65,.65])cyl(stall,x,1.85,z,.055,.055,3.7,'#8f7952');for(let i=0;i<10;i++){const aw=box(stall,-2.025+i*.45,3.25,0,.45,.14,2.6,i%2?'#e9dfb8':'#899764');aw.rotation.x=-.1;box(stall,-2.025+i*.45,3.05,1.25,.45,.32,.08,i%2?'#e9dfb8':'#899764')}
 for(let i=0;i<3;i++){box(stall,-1.3+i*1.3,1.65,0,1.1,.23,1.05,'#b39160');for(let j=0;j<6;j++)ball(stall,-1.62+i*1.3+(j%3)*.3,1.9,Math.floor(j/3)*.35-.2,.17,['#bf6043','#cbac4b','#79905b'][i])}sign(stall,'EL MERCADO',0,2.45,1,2.7);this.obstacle(10,3,4,1.8);
 this.tree(-7,5,1.2);this.tree(7,9,1.1);this.tree(-9,-3,.8);this.tree(18,10,1.2);this.tree(-20,-4,1.2,true);this.tree(19,-15,1.3,true);this.tree(-19,13,1.1,true);this.tree(14,16,.85);this.tree(-7,18,.8);
 for(const [x,z]of [[-5,-4],[5,-5],[-6,10],[16,6]])this.planter(x,z);
 this.bench(-4,4,.9);this.bench(4,-4,-.9);this.bench(-9,12,0);
 for(const [x,z]of [[-7,1],[7,-4],[-17,11],[18,0]])this.lamp(x,z);
 for(const [x,z]of [[11,-3],[15,-2],[15,1]])this.cafeTable(x,z);
 // Shared dinner table in the courtyard.
 this.dinner=new T.Group();this.dinner.position.set(-6,0,-6);s.add(this.dinner);box(this.dinner,0,1,0,3.3,.15,1.6,'#a98a59');for(const x of [-1.3,1.3])for(const z of [-.5,.5])box(this.dinner,x,.5,z,.13,1,.13,'#90744e');box(this.dinner,0,1.09,0,3.15,.03,1.45,'#f3e8cb');for(const x of [-1,0,1]){cyl(this.dinner,x,1.13,.35,.24,.24,.035,'#f9f0d9');cyl(this.dinner,x,1.13,-.35,.24,.24,.035,'#f9f0d9')}
 this.dinnerFood=new T.Group();this.dinner.add(this.dinnerFood);this.dinnerFood.visible=false;for(let i=0;i<6;i++)ball(this.dinnerFood,(i%3-1)*.6,1.28,Math.floor(i/3)*.3-.15,.17,i%2?'#bd6249':'#d7ad65');this.obstacle(-6,-6,3.3,1.6);
 // Bunting strung across the plaza.
 const points=[];for(let i=0;i<=24;i++){const x=-14+i*28/24,y=7-Math.sin(i/24*Math.PI)*1.9;points.push(new T.Vector3(x,y,-5));if(i%2===0){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([x-.25,y,-5,x+.25,y,-5,x,y-.55,-5],3));geo.computeVertexNormals();const flag=new T.Mesh(geo,new T.MeshStandardMaterial({color:['#c17857','#a7ac77','#d8bd79','#789a91'][i/2%4],side:T.DoubleSide}));s.add(flag)}}s.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:'#8e876d'})));
 this.npc('lucia','Lucía',-3,4,{shirt:'#b98665',hair:'#6c4a36',style:'bun',skin:'#d6a17a'});this.npc('mateo','Mateo',-11,-4.5,{shirt:'#e5dbbd',hair:'#564431',style:'crop',skin:'#c99873'});this.npc('ines','Inés',9,5.2,{shirt:'#688c83',hair:'#49372c',style:'bob',skin:'#bb825e'});
 this.addEntity('home','Mi casa',-15,8.8,'door',1.8);this.addEntity('cafe','Café Azahar',14,-4.5,'door',2);this.addEntity('table','La mesa',-6,-4.3,'table',1.8);this.addEntity('fountain','La fuente',0,3,'object',1.2);
 }
 building(x,z,w,h,d,color,shutter,label,entry=null,collision=true){const g=new T.Group();g.position.set(x,0,z);this.scene.add(g);this.cameraBlockers.push(box(g,0,h/2,0,w,h,d,color));box(g,0,.23,0,w+.12,.4,d+.12,'#c4b799');box(g,0,h-.05,0,w+.3,.16,d+.3,'#cdb68e');
 const roof=new T.BufferGeometry();const a=w/2+.35,b=d/2+.35,r=1.4;const verts=[-a,0,-b,a,0,-b,0,r,-b,-a,0,b,0,r,b,a,0,b,-a,0,-b,0,r,-b,0,r,b,-a,0,-b,0,r,b,-a,0,b,a,0,-b,a,0,b,0,r,b,a,0,-b,0,r,b,0,r,-b];roof.setAttribute('position',new T.Float32BufferAttribute(verts,3));roof.computeVertexNormals();const rm=new T.Mesh(roof,mat('#b97955'));rm.position.y=h;rm.castShadow=true;g.add(rm);
 for(let k=0;k<Math.floor(d/.35)+1;k++){const zz=-b+k*.36;for(const side of [-1,1]){const ridge=box(g,side*a/2,h+r/2+.025,zz,Math.hypot(a,r),.065,.09,'#c38961');ridge.rotation.z=-side*Math.atan2(r,a)}}
 box(g,w*.3,h+.65,-.6,.65,1.3,.65,'#e2cfaf');box(g,w*.3,h+1.3,-.6,.85,.12,.85,'#b98765');
 box(g,0,1.05,d/2+.025,1.18,2.1,.07,'#698275');box(g,0,2.13,d/2+.08,1.4,.15,.2,'#cfbd96');ball(g,.36,1,d/2+.12,.052,'#d5b675');for(let i=-2;i<3;i++)box(g,i*.21,1.05,d/2+.08,.02,2,.02,'#536e60');
 for(const xx of [-w*.29,w*.29])for(const yy of (h>5.8?[1.65,4.5]:[2.8])){box(g,xx,yy,d/2+.04,1.25,1.55,.12,'#d0bb90');box(g,xx,yy,d/2+.12,.82,1.27,.07,'#53695e');for(const side of [-1,1]){box(g,xx+side*.61,yy,d/2+.17,.36,1.37,.12,shutter);for(let i=0;i<7;i++)box(g,xx+side*.61,yy-.55+i*.18,d/2+.245,.32,.045,.025,'#9bad8e')}box(g,xx,yy,d/2+.19,.035,1.25,.03,'#e5dac0');box(g,xx,yy,d/2+.19,.8,.035,.03,'#e5dac0');box(g,xx,yy-.82,d/2+.3,1.4,.15,.4,'#d0bd94');box(g,xx,yy-.67,d/2+.4,.9,.23,.25,'#b37957');for(let j=0;j<5;j++){ball(g,xx-.35+j*.17,yy-.5,d/2+.4,.12,'#859466');ball(g,xx-.35+j*.17,yy-.4,d/2+.46,.065,j%2?'#d5a78b':'#ae7069')}}
 if(label)sign(g,label,0,h>5.8?3.2:2.9,d/2+.15,Math.min(w-1,3.1));
 if(entry==='bakery'||entry==='cafe'){for(let i=0;i<10;i++){const aw=box(g,-w*.4+i*w*.08,2.6,d/2+.75,w*.08,.12,1.55,i%2?'#f0dfbc':entry==='cafe'?'#759188':'#be895f');aw.rotation.x=.16}}
 if(collision)this.obstacle(x,z,w,d);return g;
 }
 tree(x,z,scale=1,cypress=false){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);this.scene.add(g);cyl(g,0,1.3,0,.16,.23,2.6,'#927a52');if(cypress){for(let i=0;i<3;i++){const b=ball(g,0,2.5+i*.85,0,1-i*.15,'#63836c');b.scale.y=1.6}}else{for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ball(g,Math.cos(a)*.7,2.8+(i%2)*.4,Math.sin(a)*.7,1.13,['#8c9f74','#96a47b','#81956e'][i%3])}for(let i=0;i<5;i++){const a=i*1.4;ball(g,Math.cos(a)*1.1,2.7,Math.sin(a)*1.1,.1,'#ba9e55')}}this.obstacle(x,z,.9,.9)}
 planter(x,z){cyl(this.scene,x,.3,z,.48,.35,.6,'#ba8562');ball(this.scene,x,.65,z,.47,'#829865');for(let i=0;i<5;i++)ball(this.scene,x+Math.cos(i*1.3)*.3,.88,z+Math.sin(i*1.3)*.3,.1,'#d0a69c')}
 bench(x,z,r){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=r;this.scene.add(g);for(let i=0;i<3;i++)box(g,0,.6,-.25+i*.22,2,.1,.18,'#a38a5c');for(let i=0;i<2;i++)box(g,0,.95+i*.2,-.38,2,.16,.08,'#ab9469');for(const xx of [-.75,.75]){box(g,xx,.34,0,.08,.7,.7,'#63705a');box(g,xx,.9,-.4,.07,.8,.08,'#63705a')}this.obstacle(x,z,2,.7)}
 lamp(x,z){cyl(this.scene,x,1.8,z,.05,.09,3.6,'#586455');box(this.scene,x,3.6,z,.38,.6,.38,'#e8d5a1');cyl(this.scene,x,3.95,z,0,.36,.25,'#5f6c58',4)}
 cafeTable(x,z){cyl(this.scene,x,.95,z,.7,.7,.12,'#d3be8f');cyl(this.scene,x,.48,z,.06,.1,.9,'#63715d');for(const a of [0,Math.PI]){const xx=x+Math.cos(a),zz=z+Math.sin(a);box(this.scene,xx,.48,zz,.5,.1,.5,'#86997a');box(this.scene,xx+Math.cos(a)*.2,.8,zz,.08,.55,.5,'#86997a')}cyl(this.scene,x,.99,z,.12,.1,.3,'#e9e1c8');this.obstacle(x,z,2.6,1.5)}
 npc(id,label,x,z,c){const avatar=makeAvatar(c);avatar.position.set(x,0,z);this.scene.add(avatar);const e=this.addEntity(id,label,x,z);e.avatar=avatar;}
 buildRoom(){this.homeRoom=new T.Group();this.scene.add(this.homeRoom);const s=this.homeRoom;box(s,100,-.08,0,12,.2,10,'#c4ad89');box(s,100,2,-5,12,4,.2,'#ede0c5');box(s,94,2,0,.2,4,10,'#e3d3b6');box(s,106,2,0,.2,4,10,'#e3d3b6');for(let i=0;i<12;i++)box(s,94.5+i,.035,0,.025,.01,10,'#b39a79');box(s,100,.04,0,5,.035,4,'#b98168');for(let i=0;i<4;i++)box(s,100,.065,-1.6+i,4.5,.02,.07,'#dbc3a0');
 box(s,96,.4,-3,2,.65,3,'#997e58');box(s,96,.79,-3,1.9,.15,2.9,'#f0e5cc');box(s,96,.92,-2.5,1.95,.09,1.8,'#8c9e85');box(s,96,.93,-4,1.4,.23,.6,'#f5ebd3');box(s,104,1.3,-4.4,2,2.6,.7,'#a68b62');box(s,104,1.5,-3.99,1,1.55,.03,'#a9c6bd');sign(s,'MI CASA',100,2.9,-4.85,2.8);
 box(s,99.5,2.2,-4.86,1.7,1.4,.05,'#9cb5a5');box(s,99.5,2.2,-4.80,.06,1.4,.04,'#f7eed8');box(s,99.5,2.2,-4.80,1.7,.06,.04,'#f7eed8');this.planter(95.3,2.8);this.cafeTable(103,1);this.roomSign=sign(s,'← SALIR',100,1,4.3,2);
 this.addEntity('exit','Salir a la plaza',100,3.7,'door',1.5);this.addEntity('mirror','Mi armario',103.5,-2.8,'wardrobe',1.8).room='home';
 this.cafeRoom=new T.Group();this.scene.add(this.cafeRoom);const c=this.cafeRoom;box(c,100,-.08,0,12,.2,10,'#cfbd9c');box(c,100,2,-5,12,4,.2,'#e8d7b8');box(c,94,2,0,.2,4,10,'#d9b89b');box(c,106,2,0,.2,4,10,'#e8d7b8');box(c,102,1,-3,6,1.8,1.3,'#849b84');box(c,102,1.95,-3,6.2,.15,1.5,'#d9c79f');for(let i=0;i<4;i++){box(c,100+i,2.6,-4.8,.6,.8,.1,'#758b73');cyl(c,99.5+i,2.18,-3,.13,.13,.32,'#eae1c9')}sign(c,'CAFÉ AZAHAR',100,3.4,-4.85,3.2);const diego=makeAvatar({shirt:'#d7be8d',style:'crop',hair:'#534331'});diego.position.set(101,0,-1.3);c.add(diego);this.addEntity('diego','Diego',101,-1.3,'npc',2.6).room='cafe';sign(c,'← SALIR',100,1,4.3,2);this.homeRoom.visible=this.cafeRoom.visible=false;
 }
 buildLabels(){const root=document.getElementById('labels');root.replaceChildren();for(const e of this.entities){const b=document.createElement('button');b.className='world-label';b.textContent=(e.type==='npc'?'✦ ':'')+e.label;b.setAttribute('aria-label',e.label);b.addEventListener('click',()=>{if(!this.enabled||this.blocked)return;this.walkTo(e.x,e.z,e)});root.append(b);e.labelEl=b}}
 setAvatar(c){const pos=this.player.position.clone(),rot=this.player.rotation.y;this.scene.remove(this.player);this.disposeAvatar(this.player);this.player=makeAvatar(c);this.player.position.copy(pos);this.player.rotation.y=rot;this.scene.add(this.player)}
 disposeAvatar(g){g.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 enter(room){this.room=room;this.homeRoom.visible=room==='home';this.cafeRoom.visible=room==='cafe';this.path=[];this.player.position.set(room==='town'?14:100,0,room==='town'?-4:2);if(room==='home'){this.returnPos={x:-15,z:10};this.roomSign.visible=true}else if(room==='cafe')this.returnPos={x:14,z:-4};if(room==='town'&&this.returnPos)this.player.position.set(this.returnPos.x,0,this.returnPos.z);this.yaw=0;this.distance=room==='town'?15:10;this.focus.copy(this.player.position);this.focus.y=1;this.onMove?.(this.position())}
 position(){return{x:this.player.position.x,z:this.player.position.z,room:this.room}}
 restore(pos){if(!pos)return;if(pos.room&&pos.room!=='town'){this.enter(pos.room);return}if(Number.isFinite(pos.x)&&Number.isFinite(pos.z)&&!this.collides(pos.x,pos.z))this.player.position.set(pos.x,0,pos.z)}
 collides(x,z){if(this.room!=='town')return x<94.5||x>105.5||z<-4.5||z>4.5;return Math.abs(x)>29||z<-20||z>26||this.obstacles.some(o=>Math.abs(x-o.x)<o.w&&Math.abs(z-o.z)<o.d)}
 walkTo(x,z,entity=null){const start={x:Math.round(this.player.position.x),z:Math.round(this.player.position.z)},goal={x:Math.round(x),z:Math.round(z)};const open=[{...start,g:0,f:0}],seen=new Map(),closed=new Set(),key=n=>`${n.x},${n.z}`;let end=null;seen.set(key(start),open[0]);for(let count=0;open.length&&count<4500;count++){open.sort((a,b)=>a.f-b.f);const n=open.shift();if(closed.has(key(n)))continue;closed.add(key(n));if(Math.hypot(n.x-goal.x,n.z-goal.z)<(entity?1.7:.8)){end=n;break}for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const next={x:n.x+dx,z:n.z+dz};if(this.collides(next.x,next.z)||this.collides(n.x+dx,n.z)||this.collides(n.x,n.z+dz)||closed.has(key(next)))continue;const g=n.g+Math.hypot(dx,dz),old=seen.get(key(next));if(old&&old.g<=g)continue;Object.assign(next,{g,f:g+Math.hypot(next.x-goal.x,next.z-goal.z),parent:n});seen.set(key(next),next);open.push(next)}}this.path=[];if(end){while(end.parent){this.path.unshift({x:end.x,z:end.z});end=end.parent}this.destination=entity;if(!this.path.length&&entity)this.onInteract?.(entity)}else {this.destination=null;this.onTravelFailed?.()}}
 bind(){this.resizeFn=()=>this.resize();window.addEventListener('resize',this.resizeFn);window.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))return;if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e'].includes(e.key.toLowerCase())){if(this.enabled&&!this.blocked)e.preventDefault();this.keys.add(e.key.toLowerCase())}if(e.key.toLowerCase()==='e'&&!e.repeat&&this.enabled&&!this.blocked&&this.near)this.onInteract?.(this.near)});window.addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{this.keys.clear();this.drag=null});
 this.canvas.addEventListener('pointerdown',e=>{this.drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};this.canvas.setPointerCapture(e.pointerId)});this.canvas.addEventListener('pointermove',e=>{if(!this.drag||this.blocked)return;const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;if(Math.hypot(e.clientX-this.drag.startX,e.clientY-this.drag.startY)>5)this.drag.moved=true;if(this.drag.moved){this.yaw-=dx*.006;this.pitch=T.MathUtils.clamp(this.pitch+dy*.004,.25,1.05)}this.drag.x=e.clientX;this.drag.y=e.clientY});this.canvas.addEventListener('pointerup',e=>{if(this.drag&&!this.drag.moved&&this.enabled&&!this.blocked){const r=this.canvas.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);const p=new T.Vector3();if(this.ray.ray.intersectPlane(this.ground,p)&&!this.collides(p.x,p.z))this.walkTo(p.x,p.z)}this.drag=null});this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.distance=T.MathUtils.clamp(this.distance+e.deltaY*.012,6,24)},{passive:false});this.canvas.addEventListener('contextmenu',e=>e.preventDefault());
 document.querySelectorAll('[data-move]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);this.keys.add(b.dataset.move)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>this.keys.delete(b.dataset.move))});
 }
 resize(){this.renderer.setSize(innerWidth,innerHeight,false);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix()}
 animate(now){const dt=Math.min((now-this.last)/1000,.04);this.last=now;this.time+=dt;let moving=false;const p=this.player.position;
 if(this.enabled&&!this.blocked){let dx=0,dz=0;if(this.keys.has('w')||this.keys.has('arrowup'))dz--;if(this.keys.has('s')||this.keys.has('arrowdown'))dz++;if(this.keys.has('a')||this.keys.has('arrowleft'))dx--;if(this.keys.has('d')||this.keys.has('arrowright'))dx++;if(dx||dz){this.path=[];this.destination=null;const a=dx*Math.cos(this.yaw)+dz*Math.sin(this.yaw),b=-dx*Math.sin(this.yaw)+dz*Math.cos(this.yaw);dx=a;dz=b}else if(this.path.length){dx=this.path[0].x-p.x;dz=this.path[0].z-p.z;if(Math.hypot(dx,dz)<.16){this.path.shift();if(!this.path.length&&this.destination){const e=this.destination;this.destination=null;this.onInteract?.(e)}dx=dz=0}}
 if(dx||dz){const len=Math.hypot(dx,dz),step=4.4*dt;dx=dx/len*step;dz=dz/len*step;if(!this.collides(p.x+dx,p.z))p.x+=dx;if(!this.collides(p.x,p.z+dz))p.z+=dz;this.player.rotation.y=Math.atan2(dx,dz);moving=true;this.onMove?.(this.position())}}
 for(let i=0;i<2;i++){this.player.userData.legs[i].rotation.x=moving?Math.sin(this.time*12+i*Math.PI)*.55:0;this.player.userData.arms[i].rotation.x=moving?Math.sin(this.time*12+(1-i)*Math.PI)*.4:Math.sin(this.time*1.5)*.02}
 for(const e of this.entities){if(e.avatar){e.avatar.position.y=Math.sin(this.time*1.6+e.x)*.018;if(Math.hypot(p.x-e.x,p.z-e.z)<4)e.avatar.rotation.y=Math.atan2(p.x-e.x,p.z-e.z)}}
 for(let i=0;i<this.water.length;i++)this.water[i].position.y=1.4-((this.time*.7+i*.13)%1)*.7;
 const aim=this.enabled?new T.Vector3(p.x,1.1,p.z):new T.Vector3(0,1,0);this.focus.lerp(aim,1-Math.exp(-dt*5));const dist=this.enabled?this.distance:36;const yaw=this.enabled?this.yaw:.27;const pitch=this.enabled?this.pitch:.65;const offset=new T.Vector3(Math.sin(yaw)*Math.cos(pitch)*dist,Math.sin(pitch)*dist,Math.cos(yaw)*Math.cos(pitch)*dist);if(this.enabled&&this.room==='town'){this.ray.set(this.focus,offset.clone().normalize());this.ray.far=offset.length();const hits=this.ray.intersectObjects(this.cameraBlockers,false);if(hits.length)offset.setLength(Math.max(2.5,hits[0].distance-.5));this.ray.far=Infinity}this.camera.position.copy(this.focus).add(offset);this.camera.lookAt(this.focus);
 let near=null,nd=2.5;for(const e of this.entities){const same=((this.room==='town')===(e.x<80))&&(!e.room||e.room===this.room);const d=Math.hypot(p.x-e.x,p.z-e.z);if(same&&d<nd){near=e;nd=d}const v=new T.Vector3(e.x,e.y,e.z).project(this.camera);const visible=this.enabled&&!this.blocked&&same&&v.z<1&&Math.abs(v.x)<.96&&Math.abs(v.y)<.9&&d<20;e.labelEl.hidden=!visible;if(visible){e.labelEl.style.left=`${(v.x*.5+.5)*innerWidth}px`;e.labelEl.style.top=`${(-v.y*.5+.5)*innerHeight}px`}}
 if(near!==this.near){this.near=near;this.onNear?.(near)}this.renderer.render(this.scene,this.camera);this.frame=requestAnimationFrame(t=>this.animate(t));
 }
}
export class AvatarPreview{
 constructor(canvas){this.canvas=canvas;this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(32,1,.1,30);this.camera.position.set(0,1.3,4.6);this.camera.lookAt(0,1,0);this.renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=T.SRGBColorSpace;this.scene.add(new T.HemisphereLight('#fff7df','#89977b',3));const l=new T.DirectionalLight('#fff2dc',3);l.position.set(3,6,4);this.scene.add(l);cyl(this.scene,0,-.12,0,.8,.9,.16,'#b8c0a4',40);this.set({});this.tick=()=>{if(!document.getElementById('creator').hidden){const w=canvas.clientWidth,h=canvas.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.avatar.rotation.y=Math.sin(performance.now()*.0006)*.4;this.renderer.render(this.scene,this.camera)}requestAnimationFrame(this.tick)};this.tick()}
 set(c){if(this.avatar){this.scene.remove(this.avatar);this.avatar.traverse(o=>o.geometry?.dispose())}this.avatar=makeAvatar(c);this.scene.add(this.avatar)}
}
