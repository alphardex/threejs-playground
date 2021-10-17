import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import vueLogoVertexShader from "../shaders/vueLogo/vertex.glsl";
// @ts-ignore
import vueLogoFragmentShader from "../shaders/vueLogo/fragment.glsl";

class VueLogo extends Base {
  clock!: THREE.Clock;
  vueLogoMaterial!: THREE.ShaderMaterial;
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
    this.createVueLogoMaterial();
    this.createPlane();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createVueLogoMaterial() {
    const vueLogoMaterial = new THREE.ShaderMaterial({
      vertexShader: vueLogoVertexShader,
      fragmentShader: vueLogoFragmentShader,
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
    this.vueLogoMaterial = vueLogoMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.vueLogoMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.vueLogoMaterial) {
      this.vueLogoMaterial.uniforms.uTime.value = elapsedTime;
      this.vueLogoMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default VueLogo;
