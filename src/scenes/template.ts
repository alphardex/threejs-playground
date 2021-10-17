import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import templateVertexShader from "../shaders/template/vertex.glsl";
// @ts-ignore
import templateFragmentShader from "../shaders/template/fragment.glsl";

class Template extends Base {
  clock!: THREE.Clock;
  templateMaterial!: THREE.ShaderMaterial;
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
    this.createTemplateMaterial();
    this.createPlane();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createTemplateMaterial() {
    const templateMaterial = new THREE.ShaderMaterial({
      vertexShader: templateVertexShader,
      fragmentShader: templateFragmentShader,
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
    this.templateMaterial = templateMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.templateMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.templateMaterial) {
      this.templateMaterial.uniforms.uTime.value = elapsedTime;
      this.templateMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default Template;
