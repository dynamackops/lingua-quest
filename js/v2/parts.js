// Shared procedural building blocks for every world: cached materials, primitive helpers, painted signs and the player/neighbour avatar.
import * as T from '../../vendor/three.module.js';
const mats=new Map();
let grainTex=null;
function grain(){
 if(grainTex)return grainTex;
 const cv=document.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d');
 const img=cx.createImageData(128,128),d=img.data;
 for(let i=0;i<d.length;i+=4){const n=228+((i*13)%22)+((i*7>>3)%11);d[i]=d[i+1]=d[i+2]=n;d[i+3]=255}
 cx.putImageData(img,0,0);
 grainTex=new T.CanvasTexture(cv);grainTex.wrapS=grainTex.wrapT=T.RepeatWrapping;grainTex.repeat.set(3,3);grainTex.colorSpace=T.SRGBColorSpace;grainTex.anisotropy=4;grainTex.userData.keep=true;
 return grainTex;
}
export function mat(c){
 if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,map:grain(),roughness:.86,metalness:0}));
 return mats.get(c);
}
export function clearMats(){for(const m of mats.values())m.dispose();mats.clear()}
export function mesh(g,c,x,y,z,parent){const m=new T.Mesh(g,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
export const box=(p,x,y,z,w,h,d,c)=>mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p);
export const ball=(p,x,y,z,r,c,detail=1)=>mesh(new T.IcosahedronGeometry(r,detail),c,x,y,z,p);
export const cyl=(p,x,y,z,r1,r2,h,c,n=16)=>mesh(new T.CylinderGeometry(r1,r2,h,n),c,x,y,z,p);
// Soft-cornered volumes for plaster walls so towns read as handmade, not crate-stacked.
export function roundBox(p,x,y,z,w,h,d,c,radius=.2){
 const hw=w/2,hd=d/2,r=Math.min(radius,hw*.42,hd*.42);
 const s=new T.Shape();
 s.moveTo(-hw+r,-hd);s.lineTo(hw-r,-hd);s.quadraticCurveTo(hw,-hd,hw,-hd+r);
 s.lineTo(hw,hd-r);s.quadraticCurveTo(hw,hd,hw-r,hd);
 s.lineTo(-hw+r,hd);s.quadraticCurveTo(-hw,hd,-hw,hd-r);
 s.lineTo(-hw,-hd+r);s.quadraticCurveTo(-hw,-hd,-hw+r,-hd);
 const geo=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:4});
 geo.rotateX(-Math.PI/2);geo.translate(0,h/2,0);
 return mesh(geo,c,x,y,z,p);
}
const texCache=new Map();
function keep(t){t.userData.keep=true;t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t}
function paint(key,draw){
 if(texCache.has(key))return texCache.get(key);
 const cv=document.createElement('canvas');cv.width=cv.height=512;draw(cv.getContext('2d'));
 const t=keep(new T.CanvasTexture(cv));texCache.set(key,t);return t;
}
export function cobble(){
 return paint('cobble',cx=>{
  cx.fillStyle='#b9a67a';cx.fillRect(0,0,512,512);
  for(let row=0;row<18;row++)for(let col=0;col<18;col++){
   const ox=(row%2)*14,jx=((col*11+row*5)%7)-3,jy=((col*3+row*17)%5)-2;
   const v=168+((col*13+row*9)%32);
   cx.fillStyle=`rgb(${v+36},${v+16},${v-6})`;
   const x=col*28+ox+jx+3,y=row*28+jy+3,rw=24+((col*row)%6),rh=18+((col+row)%5);
   cx.beginPath();cx.moveTo(x+5,y);cx.lineTo(x+rw-5,y);cx.quadraticCurveTo(x+rw,y,x+rw,y+5);
   cx.lineTo(x+rw,y+rh-5);cx.quadraticCurveTo(x+rw,y+rh,x+rw-5,y+rh);
   cx.lineTo(x+5,y+rh);cx.quadraticCurveTo(x,y+rh,x,y+rh-5);cx.lineTo(x,y+5);cx.quadraticCurveTo(x,y,x+5,y);cx.fill();
  }
 });
}
export function gravel(){
 return paint('gravel',cx=>{
  cx.fillStyle='#cfc6ad';cx.fillRect(0,0,512,512);
  for(let i=0;i<2800;i++){const v=175+(i*17%40);cx.fillStyle=`rgb(${v+18},${v+8},${v-12})`;cx.beginPath();cx.arc((i*97)%512,(i*53)%512,2+(i%4),0,7);cx.fill()}
  for(let i=0;i<18;i++){cx.fillStyle='#b7b09a';cx.beginPath();cx.ellipse(40+(i*173)%430,48+(i*211)%430,28,18,i,0,7);cx.fill()}
 });
}
export function grass(){
 return paint('grass',cx=>{
  cx.fillStyle='#7f9a5e';cx.fillRect(0,0,512,512);
  for(let i=0;i<2800;i++){const v=90+(i*29%50);cx.fillStyle=`rgb(${v-10},${v+28},${v-24})`;cx.fillRect((i*73)%512,(i*41)%512,2+(i%3),6+(i%5))}
  for(let i=0;i<120;i++){cx.fillStyle=i%2?'#e8b07a':'#f3e6c4';cx.beginPath();cx.arc((i*97)%512,(i*53)%512,1.8,0,7);cx.fill()}
 });
}
function tiled(kind,w,d){
 const key=`${kind}:${w}x${d}`;
 if(texCache.has(key))return texCache.get(key);
 const base=kind==='grass'?grass():kind==='gravel'?gravel():cobble();
 const t=keep(base.clone());t.repeat.set(Math.max(.9,w/7.4),Math.max(.9,d/7.4));texCache.set(key,t);return t;
}
export function ground(scene){
 const m=new T.Mesh(new T.PlaneGeometry(110,110),new T.MeshStandardMaterial({map:tiled('grass',110,110),roughness:.95,metalness:0}));
 m.rotation.x=-Math.PI/2;m.position.y=-.04;m.receiveShadow=true;m.castShadow=false;scene.add(m);return m;
}
export function paved(scene,x,z,w,d,kind='cobble'){
 const m=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshStandardMaterial({map:tiled(kind,w,d),roughness:.93,metalness:0}));
 m.rotation.x=-Math.PI/2;m.position.set(x,.012,z);m.receiveShadow=true;scene.add(m);return m;
}
export function blooms(p,x,y,z,n=9,spread=.42){
 const colors=['#e59b78','#f0cf7a','#d56d6d','#f6efe2','#9fb86f','#e8c3d0'];
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2+i*.17;ball(p,x+Math.cos(a)*spread,y+(i%3)*.05,z+Math.sin(a)*spread,.055+(i%4)*.02,colors[i%colors.length])}
}
export function vines(p,w,h,d){
 const leaf=['#5f7d4a','#7a9458','#6d8752'];
 for(let i=0;i<10;i++){const side=i%2?-w/2:w/2;ball(p,side*.96,.35+i*.22,d/2*.82,.09+(i%3)*.03,leaf[i%3])}
}
export function bush(p,x,z,scale=1){
 const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);p.add(g);
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ball(g,Math.cos(a)*.28,.28+(i%2)*.08,Math.sin(a)*.28,.28,['#5f7a48','#6f8c54','#7a9458'][i%3])}
 blooms(g,0,.42,0,6,.22);
}
export function glowBox(p,x,y,z,w,h,d){
 const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color:'#f4dfae',emissive:'#e0a24a',emissiveIntensity:.5,roughness:.65}));
 m.position.set(x,y,z);p.add(m);return m;
}
export function glowBall(p,x,y,z,r=.16){
 const m=new T.Mesh(new T.SphereGeometry(r,12,10),new T.MeshStandardMaterial({color:'#f7e4b2',emissive:'#e8b35a',emissiveIntensity:.7,roughness:.35}));
 m.position.set(x,y,z);p.add(m);return m;
}
export function roofTiles(kind='terra'){
 return paint('rooftile-'+kind,cx=>{
  if(kind==='slate'){
   cx.fillStyle='#4d5563';cx.fillRect(0,0,512,512);
   for(let row=0;row<18;row++)for(let col=0;col<14;col++){
    const v=70+(row*5+col*9)%28;cx.fillStyle=`rgb(${v},${v+6},${v+14})`;cx.fillRect(col*38+(row%2)*12,row*30,34,26);
   }
  }else{
   cx.fillStyle='#a24f32';cx.fillRect(0,0,512,512);
   for(let row=0;row<16;row++)for(let col=0;col<14;col++){
    const v=130+(row*11+col*7)%36;cx.fillStyle=`rgb(${v+28},${v-8},${v-36})`;
    cx.beginPath();cx.ellipse(col*38+(row%2)*18,row*34+16,20,14,0,0,7);cx.fill();
   }
  }
 });
}
// Two sloped tile planes and a ridge cap so roofs read as handmade eaves, not a flat pyramid.
export function pitchedRoof(g,w,d,h,kind='terra',rise=1.6){
 const over=.55,half=w/2+over,len=Math.hypot(half,rise),ang=Math.atan2(rise,half);
 const map=roofTiles(kind).clone();map.repeat.set(2,3);map.wrapS=map.wrapT=T.RepeatWrapping;map.userData.keep=true;
 const color=kind==='terra'?'#d08a68':'#8a91a0',fascia=kind==='terra'?'#8d5340':'#3d434d';
 for(const side of [-1,1]){
  const m=new T.Mesh(new T.BoxGeometry(len,.12,d+over*2),new T.MeshStandardMaterial({color,map,roughness:.86,metalness:0}));
  m.position.set(side*half*.5,h+rise/2+.04,0);m.rotation.z=-side*ang;m.castShadow=true;m.receiveShadow=true;g.add(m);
 }
 const ridge=cyl(g,0,h+rise+.08,0,.08,.08,d+over*2.1,fascia,10);ridge.rotation.x=Math.PI/2;
 box(g,0,h+.03,0,w+over*1.5,.1,d+over*1.7,fascia);
 return rise;
}
export function casement(g,x,y,z,shutter='#839786'){
 box(g,x,y,z,1.28,1.5,.14,'#d7c4a0');
 glowBox(g,x,y,z+.05,.78,1.12,.05);
 box(g,x,y,z+.08,.045,1.05,.03,'#efe6d0');box(g,x,y,z+.08,.72,.045,.03,'#efe6d0');
 for(const s of [-1,1])box(g,x+s*.64,y,z+.1,.3,1.32,.1,shutter);
 box(g,x,y-.86,z+.24,1.38,.16,.4,'#b37957');
 blooms(g,x,y-.66,z+.34,6,.26);
}
export function archedDoor(g,z,color='#5f7468'){
 box(g,0,1.02,z,1.12,2.0,.09,color);
 cyl(g,0,2.02,z,.56,.56,.09,color,18);
 box(g,0,2.18,z,1.42,.16,.22,'#d2bf96');
 ball(g,.4,1.02,z+.1,.05,'#d5b675');
 for(let i=-2;i<3;i++)box(g,i*.2,1.02,z+.05,.025,1.9,.02,'#4e6158');
}
export function lampPost(p,x,z){
 cyl(p,x,1.7,z,.05,.08,3.4,'#4a5348',12);
 box(p,x+.3,3.48,z,.62,.07,.07,'#4a5348');
 glowBall(p,x+.52,3.22,z,.17);
 cyl(p,x+.52,3.46,z,.08,.16,.1,'#5f6c58',8);
}
// Sign styles: a painted Spanish shop board, and a Japanese wooden kanban with a font stack that carries kana.
export const signStyles={
 es:{bg:'#f4edda',border:'#cabd99',font:'bold 45px Georgia',color:'#526a55'},
 ja:{bg:'#f3eadb',border:'#5b4a3a',font:'bold 44px "Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo","Noto Sans CJK JP","Noto Sans JP",sans-serif',color:'#3d3733'}
};
export function sign(p,text,x,y,z,w=2.5,color,style=signStyles.es){
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=style.bg;ctx.fillRect(0,0,512,128);ctx.strokeStyle=style.border;ctx.lineWidth=8;ctx.strokeRect(6,6,500,116);ctx.fillStyle=color||style.color;ctx.font=style.font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,67,474);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);p.add(m);return m;
}
// A freestanding painted archway: two posts, a lintel and a sign. Used for the
// hub's doors to each language world, and for the matching gate every world
// builds back to the hub, so both ends of a crossing look like the same place.
export function archway(t,x,z,color,label,style){
 const g=new T.Group();g.position.set(x,0,z);t.scene.add(g);
 for(const side of [-1,1])cyl(g,side*1.5,1.8,0,.22,.26,3.6,color,14);
 roundBox(g,0,3.25,0,3.9,.5,.5,color,.12);
 sign(g,label,0,4.35,0,2.6,'#fff',style||{bg:color,border:'#00000022',font:'bold 46px Georgia',color:'#fff'});
 t.cameraBlockers.push(box(g,0,1.8,-.6,.1,3.6,.1,color));
 t.obstacle(x,z,3,1.2);
 return g;
}
export function makeAvatar(config={}){
 const c={skin:'#c98f68',hair:'#403027',shirt:'#819273',style:'bob',body:'regular',eyes:'#443526',accessory:'none',hat:'none',...config};
 const g=new T.Group(),skin=c.skin,hair=c.hair; const width=c.body==='broad'?1.18:c.body==='slim'?.87:1;
 cyl(g,0,1.08,0,.24*width,.3*width,.72,c.shirt);
 const head=ball(g,0,1.78,.02,.26,skin,2);head.scale.set(.9,1.06,.92);
 cyl(g,0,1.48,0,.09,.09,.14,skin);
 const legs=[],arms=[];
 for(const side of [-1,1]){
 const leg=new T.Group();leg.position.set(side*.13*width,.78,0);g.add(leg);cyl(leg,0,-.28,0,.1,.085,.52,'#4e5a58');cyl(leg,0,-.56,.07,.11,.12,.14,'#5c4a38',10);legs.push(leg);
 const arm=new T.Group();arm.position.set(side*.3*width,1.32,0);g.add(arm);cyl(arm,0,-.14,0,.1,.082,.3,c.shirt);cyl(arm,0,-.38,0,.07,.072,.24,skin);ball(arm,0,-.5,0,.075,skin);arm.rotation.z=side*.1;arms.push(arm);
 ball(g,side*.09,1.82,.22,.032,c.eyes,2);ball(g,side*.096,1.832,.242,.008,'#fff9e7');ball(g,side*.22,1.78,0,.06,skin);
 }
 ball(g,0,1.74,.25,.04,skin);box(g,0,1.655,.23,.07,.014,.018,'#945f50');
 if(c.player){
  roundBox(g,0,.88,-.26,.3*width,.4,.18,'#5c4636',.06);
  for(const s of [-1,1])box(g,s*.1*width,1.18,-.16,.035,.28,.04,'#6b5340');
 }
 if(c.style!=='none'){
 const cap=ball(g,0,1.92,-.03,.27,hair,2);cap.scale.set(1,.68,1);
 if(c.style==='long'){for(const s of [-1,1]){const lock=ball(g,s*.16,1.5,-.12,.14,hair);lock.scale.set(.7,1.7,.6)}}
 if(c.style==='bob'){ball(g,-.2,1.78,-.02,.12,hair);ball(g,.2,1.78,-.02,.12,hair);ball(g,0,1.72,-.16,.16,hair)}
 if(c.style==='bun')ball(g,0,2.14,-.07,.15,hair);
 if(c.style==='curls')for(let i=0;i<10;i++){const a=i/10*Math.PI*2;ball(g,Math.sin(a)*.2,1.96+Math.cos(a*3)*.03,Math.cos(a)*.16,.12,hair)}
 if(c.style==='crop'){const fringe=ball(g,.1,1.96,.12,.14,hair);fringe.scale.y=.55}
 }
 if(c.accessory==='glasses'){for(const side of [-1,1])mesh(new T.TorusGeometry(.07,.011,6,16),'#65543a',side*.09,1.82,.25,g);box(g,0,1.82,.25,.05,.012,.012,'#65543a')}
 if(c.accessory==='scarf'){cyl(g,0,1.48,0,.13,.17,.1,'#c77552');box(g,.12,1.32,.22,.12,.28,.055,'#c77552')}
 if(c.hat==='explorer'||(c.player&&(c.hat==='none'||!c.hat))){cyl(g,0,2.04,0,.4,.44,.045,'#6b5340',20);cyl(g,0,2.16,0,.2,.22,.15,'#7a5d42',16);box(g,0,2.08,.2,.16,.035,.02,'#c4a36a')}
 if(c.hat==='beret'){const beret=cyl(g,.03,2.02,-.03,.29,.28,.09,'#7a2f3d',16);beret.rotation.z=.12;ball(g,.14,2.06,-.05,.04,'#7a2f3d')}
 if(c.hat==='flowercrown'){const petals=['#e8879f','#f4c96b','#eef2df'];for(let i=0;i<10;i++){const a=i/10*Math.PI*2;ball(g,Math.sin(a)*.28,1.96+Math.cos(a*4)*.02,.02+Math.cos(a)*.26,.05,petals[i%petals.length])}}
 if(c.hat==='sombrero'){cyl(g,0,2.08,0,.52,.55,.035,'#d9b26a',20);cyl(g,0,2.16,0,.18,.22,.14,'#d9b26a',16);cyl(g,0,2.23,0,.19,.19,.02,'#a9522f',16)}
 const shadow=new T.Mesh(new T.CircleGeometry(.32,24),new T.MeshBasicMaterial({color:'#3b3b26',transparent:true,opacity:.16,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.06;g.add(shadow);g.userData={legs,arms};return g;
}
