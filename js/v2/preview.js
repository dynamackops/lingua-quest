// Small rotating preview of the character inside the creator.
import * as T from '../../vendor/three.module.js';
import {cyl,makeAvatar} from './parts.js';
export class AvatarPreview{
 constructor(canvas){this.canvas=canvas;this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(32,1,.1,30);this.camera.position.set(0,1.3,4.6);this.camera.lookAt(0,1,0);this.renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=T.SRGBColorSpace;this.scene.add(new T.HemisphereLight('#fff7df','#89977b',3));const l=new T.DirectionalLight('#fff2dc',3);l.position.set(3,6,4);this.scene.add(l);cyl(this.scene,0,-.12,0,.8,.9,.16,'#b8c0a4',40);this.set({});this.tick=()=>{if(!document.getElementById('creator').hidden){const w=canvas.clientWidth,h=canvas.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.avatar.rotation.y=Math.sin(performance.now()*.0006)*.4;this.renderer.render(this.scene,this.camera)}requestAnimationFrame(this.tick)};this.tick()}
 set(c){if(this.avatar){this.scene.remove(this.avatar);this.avatar.traverse(o=>o.geometry?.dispose())}this.avatar=makeAvatar({...c,player:true});this.scene.add(this.avatar)}
}
