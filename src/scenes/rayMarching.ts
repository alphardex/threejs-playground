import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import rayMarchingVertexShader from "../shaders/rayMarching/vertex.glsl";
// @ts-ignore
import rayMarchingFragmentShader from "../shaders/rayMarching/fragment.glsl";

class RayMarching extends Base {
  clock!: THREE.Clock;
  rayMarchingMaterial!: THREE.ShaderMaterial;
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
    this.createRayMarchingMaterial();
    this.createPlane();
    this.createLight();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建光线追踪材质
  createRayMarchingMaterial() {
    const rayMarchingMaterial = new THREE.ShaderMaterial({
      vertexShader: rayMarchingVertexShader,
      fragmentShader: rayMarchingFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {
          value: 0,
        },
      },
    });
    this.rayMarchingMaterial = rayMarchingMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.rayMarchingMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    if (this.rayMarchingMaterial) {
      this.rayMarchingMaterial.uniforms.uTime.value = elapsedTime;
    }
  }
}

export default RayMarching;
