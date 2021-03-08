import * as THREE from "three";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import twistedColorfulSphereVertexShader from "../shaders/twistedColorfulSphere/vertex.glsl";
// @ts-ignore
import twistedColorfulSphereFragmentShader from "../shaders/twistedColorfulSphere/fragment.glsl";

class TwistedColorfulSphere extends Base {
  clock!: THREE.Clock;
  twistedColorfulSphereMaterial!: THREE.ShaderMaterial;
  colorParams!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1.5);
    this.colorParams = {
      brightness: "#808080",
      contrast: "#808080",
      oscilation: "#ffffff",
      phase: "#4c3333",
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createTwistedColorfulSphereMaterial();
    this.createSphere();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createTwistedColorfulSphereMaterial() {
    const twistedColorfulSphereMaterial = new THREE.ShaderMaterial({
      vertexShader: twistedColorfulSphereVertexShader,
      fragmentShader: twistedColorfulSphereFragmentShader,
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
        uSpeed: {
          value: 0.2,
        },
        uNoiseStrength: {
          value: 0.2,
        },
        uNoiseDensity: {
          value: 1.5,
        },
        uFrequency: {
          value: 3,
        },
        uAmplitude: {
          value: 6,
        },
        uIntensity: {
          value: 7,
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
      },
    });
    this.twistedColorfulSphereMaterial = twistedColorfulSphereMaterial;
  }
  // 创建球体
  createSphere() {
    const geometry = new THREE.SphereBufferGeometry(0.5, 64, 64);
    const material = this.twistedColorfulSphereMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.twistedColorfulSphereMaterial) {
      this.twistedColorfulSphereMaterial.uniforms.uTime.value = elapsedTime;
      this.twistedColorfulSphereMaterial.uniforms.uMouse.value = mousePos;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    const uniforms = this.twistedColorfulSphereMaterial.uniforms;
    gui
      .add(uniforms.uSpeed, "value")
      .min(0)
      .max(5)
      .step(0.01)
      .name("speed");
    gui
      .add(uniforms.uNoiseDensity, "value")
      .min(0)
      .max(5)
      .step(0.01)
      .name("noiseDensity");
    gui
      .add(uniforms.uNoiseStrength, "value")
      .min(0)
      .max(5)
      .step(0.01)
      .name("noiseStrength");
    gui
      .add(uniforms.uAmplitude, "value")
      .min(0)
      .max(10)
      .step(0.01)
      .name("amplitude");
    gui
      .add(uniforms.uFrequency, "value")
      .min(0)
      .max(10)
      .step(0.01)
      .name("frequency");
    gui
      .add(uniforms.uIntensity, "value")
      .min(0)
      .max(10)
      .step(0.01)
      .name("intensity");
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

export default TwistedColorfulSphere;
