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
  params!: any;
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
    this.params = {
      brightness: "#808080",
      contrast: "#808080",
      oscilation: "#d9fcfb",
      phase: "#3c4f82",
      oscilationPower: 1.8,
      bgColor: "#07111d",
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createRayMarchingBallMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.createDebugPanel();
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
        uBrightness: {
          value: new THREE.Color(this.params.brightness),
        },
        uContrast: {
          value: new THREE.Color(this.params.contrast),
        },
        uOscilation: {
          value: new THREE.Color(this.params.oscilation),
        },
        uPhase: {
          value: new THREE.Color(this.params.phase),
        },
        uOscilationPower: {
          value: this.params.oscilationPower,
        },
        uScale: {
          value: 12,
        },
        uScaleUv: {
          value: 1.5,
        },
        uEye: {
          value: 8,
        },
        uVelocity: {
          value: 0.1,
        },
        uBgColor: {
          value: new THREE.Color(this.params.bgColor),
        },
      },
    });
    this.rayMarchingBallMaterial = rayMarchingBallMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
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
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI({ width: 300 });
    const uniforms = this.rayMarchingBallMaterial.uniforms;
    gui.addColor(this.params, "brightness").onFinishChange((value) => {
      uniforms.uBrightness.value.set(value);
    });
    gui.addColor(this.params, "contrast").onFinishChange((value) => {
      uniforms.uContrast.value.set(value);
    });
    gui.addColor(this.params, "oscilation").onFinishChange((value) => {
      uniforms.uOscilation.value.set(value);
    });
    gui.addColor(this.params, "phase").onFinishChange((value) => {
      uniforms.uPhase.value.set(value);
    });
    gui
      .add(uniforms.uOscilationPower, "value")
      .min(0)
      .max(3)
      .step(0.01)
      .name("oscilationPower");
    gui
      .add(uniforms.uScale, "value")
      .min(0)
      .max(20)
      .step(0.1)
      .name("scale");
    gui
      .add(uniforms.uScaleUv, "value")
      .min(0)
      .max(5)
      .step(0.01)
      .name("scaleUv");
    gui
      .add(uniforms.uEye, "value")
      .min(0)
      .max(8)
      .step(0.01)
      .name("eye");
    gui
      .add(uniforms.uVelocity, "value")
      .min(0)
      .max(2)
      .step(0.01)
      .name("velocity");
    gui.addColor(this.params, "bgColor").onFinishChange((value) => {
      uniforms.uBgColor.value.set(value);
    });
  }
}

export default RayMarchingBall;
