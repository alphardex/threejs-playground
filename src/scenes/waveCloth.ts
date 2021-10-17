import * as THREE from "three";
import { Base } from "@/commons/base";
// @ts-ignore
import waveClothVertexShader from "../shaders/waveCloth/vertex.glsl";
// @ts-ignore
import waveClothFragmentShader from "../shaders/waveCloth/fragment.glsl";

class WaveCloth extends Base {
  clock!: THREE.Clock;
  waveClothMaterial!: THREE.ShaderMaterial;
  plane!: THREE.Mesh | null;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createWaveClothMaterial();
    this.createPlane();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createWaveClothMaterial() {
    const waveClothMaterial = new THREE.ShaderMaterial({
      vertexShader: waveClothVertexShader,
      fragmentShader: waveClothFragmentShader,
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
    this.waveClothMaterial = waveClothMaterial;
    this.shaderMaterial = waveClothMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 128, 128);
    const material = this.waveClothMaterial;
    const plane = this.createMesh({
      geometry,
      material,
    });
    this.plane = plane;
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.waveClothMaterial) {
      this.waveClothMaterial.uniforms.uTime.value = elapsedTime;
      this.waveClothMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default WaveCloth;
