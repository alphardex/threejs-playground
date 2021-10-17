import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import rayMarchingFireVertexShader from "../shaders/rayMarchingFire/vertex.glsl";
// @ts-ignore
import rayMarchingFireFragmentShader from "../shaders/rayMarchingFire/fragment.glsl";

class RayMarchingFire extends Base {
  clock!: THREE.Clock;
  rayMarchingFireMaterial!: THREE.ShaderMaterial;
  params!: any;
  colorParams!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1);
    this.params = {
      velocity: 3,
    };
    this.colorParams = {
      color1: "#ff801a",
      color2: "#ff5718",
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createRayMarchingFireMaterial();
    this.createPlane();
    this.createLight();
    // this.createDebugPanel();
    this.mouseTracker.trackMousePos();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createRayMarchingFireMaterial() {
    const rayMarchingFireMaterial = new THREE.ShaderMaterial({
      vertexShader: rayMarchingFireVertexShader,
      fragmentShader: rayMarchingFireFragmentShader,
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
        uVelocity: {
          value: this.params.velocity,
        },
        uColor1: {
          value: new THREE.Color(this.colorParams.color1),
        },
        uColor2: {
          value: new THREE.Color(this.colorParams.color2),
        },
      },
    });
    this.rayMarchingFireMaterial = rayMarchingFireMaterial;
    this.shaderMaterial = rayMarchingFireMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
    const material = this.rayMarchingFireMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.rayMarchingFireMaterial) {
      this.rayMarchingFireMaterial.uniforms.uTime.value = elapsedTime;
      this.rayMarchingFireMaterial.uniforms.uMouse.value = mousePos;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI({ width: 300 });
    const uniforms = this.rayMarchingFireMaterial.uniforms;
    gui.addColor(this.colorParams, "color1").onFinishChange((value) => {
      uniforms.uColor1.value.set(value);
    });
    gui.addColor(this.colorParams, "color2").onFinishChange((value) => {
      uniforms.uColor2.value.set(value);
    });
  }
}

export default RayMarchingFire;
