import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import timeTravelVertexShader from "../shaders/timeTravel/vertex.glsl";
// @ts-ignore
import timeTravelFragmentShader from "../shaders/timeTravel/fragment.glsl";

class TimeTravel extends Base {
  clock!: THREE.Clock;
  timeTravelMaterial!: THREE.ShaderMaterial;
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
    this.createTimeTravelMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createTimeTravelMaterial() {
    const timeTravelMaterial = new THREE.ShaderMaterial({
      vertexShader: timeTravelVertexShader,
      fragmentShader: timeTravelFragmentShader,
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
    this.timeTravelMaterial = timeTravelMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.timeTravelMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.timeTravelMaterial) {
      this.timeTravelMaterial.uniforms.uTime.value = elapsedTime;
      this.timeTravelMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default TimeTravel;
