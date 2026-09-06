// Shared procedural building blocks for every world: cached materials, primitive helpers, painted signs and the player/neighbour avatar.
import * as T from '../../vendor/three.module.js';
const mats=new Map();
export function mat(c){if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.92}));return mats.get(c)}
export function mesh(g,c,x,y,z,parent){const m=new T.Mesh(g,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
export const box=(p,x,y,z,w,h,d,c)=>mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p);
export const ball=(p,x,y,z,r,c,detail=1)=>mesh(new T.IcosahedronGeometry(r,detail),c,x,y,z,p);
export const cyl=(p,x,y,z,r1,r2,h,c,n=12)=>mesh(new T.CylinderGeometry(r1,r2,h,n),c,x,y,z,p);
// Sign styles: a painted Spanish shop board, and a Japanese wooden kanban with a font stack that carries kana.
export const signStyles={
 es:{bg:'#f4edda',border:'#cabd99',font:'bold 45px Georgia',color:'#526a55'},
 ja:{bg:'#f3eadb',border:'#5b4a3a',font:'bold 44px "Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo","Noto Sans CJK JP","Noto Sans JP",sans-serif',color:'#3d3733'}
};
export function sign(p,text,x,y,z,w=2.5,color,style=signStyles.es){
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=style.bg;ctx.fillRect(0,0,512,128);ctx.strokeStyle=style.border;ctx.lineWidth=8;ctx.strokeRect(6,6,500,116);ctx.fillStyle=color||style.color;ctx.font=style.font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,67,474);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);p.add(m);return m;
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
