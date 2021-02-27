import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import rayMarchingVertexShader from "../shaders/rayMarching/vertex.glsl";
// @ts-ignore
import rayMarchingFragmentShader from "../shaders/rayMarching/fragment.glsl";
import { matcapTextureUrl } from "@/consts/rayMarching";

class RayMarching extends Base {
  clock!: THREE.Clock;
  rayMarchingMaterial!: THREE.ShaderMaterial;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 0);
    this.orthographicCameraParams = {
      left: -1,
      right: 1,
      top: 1,
      bottom: -1,
      near: 0,
      far: 1,
      zoom: 1,
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createRayMarchingMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createDebugPanel();
    this.setLoop();
  }
  // 创建光线追踪材质
  createRayMarchingMaterial() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(matcapTextureUrl);
    const rayMarchingMaterial = new THREE.ShaderMaterial({
      vertexShader: rayMarchingVertexShader,
      fragmentShader: rayMarchingFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {
          value: 0,
        },
        uTexture: {
          value: texture,
        },
        uMouse: {
          value: new THREE.Vector2(0, 0),
        },
        uProgress: {
          value: 1,
        },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uVelocity: {
          value: 0.25,
        },
      },
    });
    this.rayMarchingMaterial = rayMarchingMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
    const material = this.rayMarchingMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.rayMarchingMaterial) {
      this.rayMarchingMaterial.uniforms.uTime.value = elapsedTime;
      this.rayMarchingMaterial.uniforms.uMouse.value = mousePos;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const { rayMarchingMaterial } = this;
    const gui = new dat.GUI();
    gui
      .add(rayMarchingMaterial.uniforms.uProgress, "value")
      .min(0)
      .max(1)
      .step(0.01)
      .name("progress");
  }
}

export default RayMarching;
