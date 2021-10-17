import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "@/commons/base";
// @ts-ignore
import rayMarchingPlaygroundVertexShader from "../shaders/rayMarchingPlayground/vertex.glsl";
// @ts-ignore
import rayMarchingPlaygroundFragmentShader from "../shaders/rayMarchingPlayground/fragment.glsl";

class RayMarchingPlayground extends Base {
  clock!: THREE.Clock;
  rayMarchingPlaygroundMaterial!: THREE.ShaderMaterial;
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
    this.createRayMarchingPlaygroundMaterial();
    this.createPlane();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createRayMarchingPlaygroundMaterial() {
    const rayMarchingPlaygroundMaterial = new THREE.ShaderMaterial({
      vertexShader: rayMarchingPlaygroundVertexShader,
      fragmentShader: rayMarchingPlaygroundFragmentShader,
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
    this.rayMarchingPlaygroundMaterial = rayMarchingPlaygroundMaterial;
    this.shaderMaterial = rayMarchingPlaygroundMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
    const material = this.rayMarchingPlaygroundMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.rayMarchingPlaygroundMaterial) {
      this.rayMarchingPlaygroundMaterial.uniforms.uTime.value = elapsedTime;
      this.rayMarchingPlaygroundMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default RayMarchingPlayground;
