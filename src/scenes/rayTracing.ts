import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import rayTracingVertexShader from "../shaders/rayTracing/vertex.glsl";
// @ts-ignore
import rayTracingFragmentShader from "../shaders/rayTracing/fragment.glsl";

class RayTracing extends Base {
  clock!: THREE.Clock;
  rayTracingMaterial!: THREE.ShaderMaterial;
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
    this.createRayTracingMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createRayTracingMaterial() {
    const rayTracingMaterial = new THREE.ShaderMaterial({
      vertexShader: rayTracingVertexShader,
      fragmentShader: rayTracingFragmentShader,
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
    this.rayTracingMaterial = rayTracingMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.rayTracingMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.rayTracingMaterial) {
      this.rayTracingMaterial.uniforms.uTime.value = elapsedTime;
      this.rayTracingMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default RayTracing;
