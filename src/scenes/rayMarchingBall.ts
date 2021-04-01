import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import rayMarchingBallVertexShader from "../shaders/rayMarchingBall/vertex.glsl";
// @ts-ignore
import rayMarchingBallFragmentShader from "../shaders/rayMarchingBall/fragment.glsl";

class RayMarchingBall extends Base {
  clock!: THREE.Clock;
  rayMarchingBallMaterial!: THREE.ShaderMaterial;
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
    this.createRayMarchingBallMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createRayMarchingBallMaterial() {
    const rayMarchingBallMaterial = new THREE.ShaderMaterial({
      vertexShader: rayMarchingBallVertexShader,
      fragmentShader: rayMarchingBallFragmentShader,
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
    this.rayMarchingBallMaterial = rayMarchingBallMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.rayMarchingBallMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.rayMarchingBallMaterial) {
      this.rayMarchingBallMaterial.uniforms.uTime.value = elapsedTime;
      this.rayMarchingBallMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default RayMarchingBall;
