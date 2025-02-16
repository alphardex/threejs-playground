import * as THREE from "three";
import { Base } from "@/commons/base";
import vertexShader from "../shaders/template/vertex.glsl";
import fragmentShader from "../shaders/template/fragment.glsl";

class Template extends Base {
  clock: THREE.Clock;
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
    this.createShaderMaterial();
    this.createPlane();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createShaderMaterial() {
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
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
    this.shaderMaterial = shaderMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.shaderMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.shaderMaterial) {
      this.shaderMaterial.uniforms.uTime.value = elapsedTime;
      this.shaderMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default Template;
