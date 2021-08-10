import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import noiseMarbleVertexShader from "../shaders/noiseMarble/vertex.glsl";
// @ts-ignore
import noiseMarbleFragmentShader from "../shaders/noiseMarble/fragment.glsl";

class NoiseMarble extends Base {
  clock!: THREE.Clock;
  noiseMarbleMaterial!: THREE.ShaderMaterial;
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
    this.createNoiseMarbleMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createNoiseMarbleMaterial() {
    const noiseMarbleMaterial = new THREE.ShaderMaterial({
      vertexShader: noiseMarbleVertexShader,
      fragmentShader: noiseMarbleFragmentShader,
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
    this.noiseMarbleMaterial = noiseMarbleMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.noiseMarbleMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.noiseMarbleMaterial) {
      this.noiseMarbleMaterial.uniforms.uTime.value = elapsedTime;
      this.noiseMarbleMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default NoiseMarble;
