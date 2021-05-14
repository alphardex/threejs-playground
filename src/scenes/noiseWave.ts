import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import noiseWaveVertexShader from "../shaders/noiseWave/vertex.glsl";
// @ts-ignore
import noiseWaveFragmentShader from "../shaders/noiseWave/fragment.glsl";

class NoiseWave extends Base {
  clock!: THREE.Clock;
  noiseWaveMaterial!: THREE.ShaderMaterial;
  params!: any;
  colorParams!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1);
    this.params = {
      velocity: 1,
    };
    this.colorParams = {
      brightness: "#808080",
      contrast: "#7b4923",
      oscilation: "#ffffff",
      phase: "#001932",
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createNoiseWaveMaterial();
    this.createPlane();
    this.createLight();
    // this.createDebugPanel();
    this.trackMousePos();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createNoiseWaveMaterial() {
    const noiseWaveMaterial = new THREE.ShaderMaterial({
      vertexShader: noiseWaveVertexShader,
      fragmentShader: noiseWaveFragmentShader,
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
        uBrightness: {
          value: new THREE.Color(this.colorParams.brightness),
        },
        uContrast: {
          value: new THREE.Color(this.colorParams.contrast),
        },
        uOscilation: {
          value: new THREE.Color(this.colorParams.oscilation),
        },
        uPhase: {
          value: new THREE.Color(this.colorParams.phase),
        },
        uVelocity: {
          value: this.params.velocity,
        },
      },
    });
    this.noiseWaveMaterial = noiseWaveMaterial;
    this.shaderMaterial = noiseWaveMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
    const material = this.noiseWaveMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.noiseWaveMaterial) {
      this.noiseWaveMaterial.uniforms.uTime.value = elapsedTime;
      this.noiseWaveMaterial.uniforms.uMouse.value = mousePos;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    const uniforms = this.noiseWaveMaterial.uniforms;
    gui.addColor(this.colorParams, "brightness").onFinishChange((value) => {
      uniforms.uBrightness.value.set(value);
    });
    gui.addColor(this.colorParams, "contrast").onFinishChange((value) => {
      uniforms.uContrast.value.set(value);
    });
    gui.addColor(this.colorParams, "oscilation").onFinishChange((value) => {
      uniforms.uOscilation.value.set(value);
    });
    gui.addColor(this.colorParams, "phase").onFinishChange((value) => {
      uniforms.uPhase.value.set(value);
    });
  }
}

export default NoiseWave;
