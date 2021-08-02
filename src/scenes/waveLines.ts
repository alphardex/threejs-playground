import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import waveLinesVertexShader from "../shaders/waveLines/vertex.glsl";
// @ts-ignore
import waveLinesFragmentShader from "../shaders/waveLines/fragment.glsl";

class WaveLines extends Base {
  clock!: THREE.Clock;
  waveLinesMaterial!: THREE.ShaderMaterial;
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
    this.createWaveLinesMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createWaveLinesMaterial() {
    const waveLinesMaterial = new THREE.ShaderMaterial({
      vertexShader: waveLinesVertexShader,
      fragmentShader: waveLinesFragmentShader,
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
    this.waveLinesMaterial = waveLinesMaterial;
    this.shaderMaterial = waveLinesMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
    const material = this.waveLinesMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.waveLinesMaterial) {
      this.waveLinesMaterial.uniforms.uTime.value = elapsedTime;
      this.waveLinesMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default WaveLines;
