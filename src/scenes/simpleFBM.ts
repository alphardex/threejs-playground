import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import simpleFBMVertexShader from "../shaders/simpleFBM/vertex.glsl";
// @ts-ignore
import simpleFBMFragmentShader from "../shaders/simpleFBM/fragment.glsl";

class SimpleFBM extends Base {
  clock!: THREE.Clock;
  simpleFBMMaterial!: THREE.ShaderMaterial;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1);
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createSimpleFBMMaterial();
    this.createPlane();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createSimpleFBMMaterial() {
    const simpleFBMMaterial = new THREE.ShaderMaterial({
      vertexShader: simpleFBMVertexShader,
      fragmentShader: simpleFBMFragmentShader,
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
    this.simpleFBMMaterial = simpleFBMMaterial;
    this.shaderMaterial = simpleFBMMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
    const material = this.simpleFBMMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.simpleFBMMaterial) {
      this.simpleFBMMaterial.uniforms.uTime.value = elapsedTime;
      this.simpleFBMMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default SimpleFBM;
