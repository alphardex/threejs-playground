import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import dominosEffectVertexShader from "../shaders/dominosEffect/vertex.glsl";
// @ts-ignore
import dominosEffectFragmentShader from "../shaders/dominosEffect/fragment.glsl";

class DominosEffect extends Base {
  clock!: THREE.Clock;
  dominosEffectMaterial!: THREE.ShaderMaterial;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createDominosEffectMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createDominosEffectMaterial() {
    const dominosEffectMaterial = new THREE.ShaderMaterial({
      vertexShader: dominosEffectVertexShader,
      fragmentShader: dominosEffectFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {
          value: 0,
        },
        uMouse: {
          value: new THREE.Vector2(0, 0),
        },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
    });
    this.dominosEffectMaterial = dominosEffectMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.dominosEffectMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.dominosEffectMaterial) {
      this.dominosEffectMaterial.uniforms.uTime.value = elapsedTime;
      this.dominosEffectMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default DominosEffect;
