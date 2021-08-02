import * as THREE from "three";
import { Base } from "./base";
// @ts-ignore
import waveLinesVertexShader from "../shaders/waveLines/vertex.glsl";
// @ts-ignore
import waveLinesFragmentShader from "../shaders/waveLines/fragment.glsl";

class WaveLines extends Base {
  clock!: THREE.Clock;
  waveLinesMaterial!: THREE.ShaderMaterial;
  plane!: THREE.Mesh | null;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createWaveLinesMaterial();
    this.createPlane();
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
      transparent: true,
      depthTest: false,
    });
    this.waveLinesMaterial = waveLinesMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 128, 128);
    const material = this.waveLinesMaterial;
    const plane = this.createMesh({
      geometry,
      material,
    });
    this.plane = plane;
  }
  // 缩放平面
  scalePlane() {
    this.plane.scale.set((this.camera as any).aspect * 1.55, 0.75, 1);
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
