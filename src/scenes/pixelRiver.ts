import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import pixelRiverVertexShader from "../shaders/pixelRiver/vertex.glsl";
// @ts-ignore
import pixelRiverFragmentShader from "../shaders/pixelRiver/fragment.glsl";

class PixelRiver extends Base {
  clock!: THREE.Clock;
  pixelRiverMaterial!: THREE.ShaderMaterial;
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
    this.createPixelRiverMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createPixelRiverMaterial() {
    const pixelRiverMaterial = new THREE.ShaderMaterial({
      vertexShader: pixelRiverVertexShader,
      fragmentShader: pixelRiverFragmentShader,
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
    this.pixelRiverMaterial = pixelRiverMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.pixelRiverMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.pixelRiverMaterial) {
      this.pixelRiverMaterial.uniforms.uTime.value = elapsedTime;
      this.pixelRiverMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default PixelRiver;
