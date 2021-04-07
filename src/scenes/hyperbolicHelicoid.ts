import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import hyperbolicHelicoidColorFragmentShader from "../shaders/hyperbolicHelicoid/color/fragment.glsl";
// @ts-ignore
import hyperbolicHelicoidFunctionFragmentShader from "../shaders/hyperbolicHelicoid/function/fragment.glsl";
import { helicoid } from "@/utils/math";

class HyperbolicHelicoid extends Base {
  clock!: THREE.Clock;
  hyperbolicHelicoidMaterial!: THREE.MeshPhysicalMaterial;
  hyperbolicHelicoid!: THREE.Mesh;
  params!: any;
  uniforms!: any;
  ball1!: THREE.Mesh;
  ball2!: THREE.Mesh;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
    this.params = {
      brightness: "#808080",
      contrast: "#808080",
      oscilation: "#ffffff",
      phase: "#001932",
      ballRadius: 0.2,
      ballRotateRadius: 0.6,
      speed: 0.5,
    };
    this.uniforms = {
      uTime: {
        value: 0,
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
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.enableShadow();
    this.usePCFSoftShadowMap();
    this.createHyperbolicHelicoidMaterial();
    this.createHyperbolicHelicoid();
    this.createTwoBalls();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 使用PCFSoft阴影
  usePCFSoftShadowMap() {
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  // 创建材质
  createHyperbolicHelicoidMaterial() {
    const hyperbolicHelicoidMaterial = new THREE.MeshPhysicalMaterial({
      roughness: 0,
      metalness: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0.4,
      side: THREE.DoubleSide,
    });
    hyperbolicHelicoidMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.uniforms.uTime;
      shader.uniforms.uBrightness = this.uniforms.uBrightness;
      shader.uniforms.uContrast = this.uniforms.uContrast;
      shader.uniforms.uOscilation = this.uniforms.uOscilation;
      shader.uniforms.uPhase = this.uniforms.uPhase;
      const CLIPPING_SHADER = "#include <clipping_planes_pars_fragment>";
      const MODIFIED_CLIPPING_SHADER = `
${CLIPPING_SHADER}
${hyperbolicHelicoidFunctionFragmentShader}`;
      const LOGDEPTHBUF_SHADER = "#include <logdepthbuf_fragment>";
      const MODIFIED_LOGDEPTHBUF_SHADER = `
${LOGDEPTHBUF_SHADER}
${hyperbolicHelicoidColorFragmentShader}`;
      shader.fragmentShader = shader.fragmentShader
        .replace(CLIPPING_SHADER, MODIFIED_CLIPPING_SHADER)
        .replace(LOGDEPTHBUF_SHADER, MODIFIED_LOGDEPTHBUF_SHADER);
    };
    this.hyperbolicHelicoidMaterial = hyperbolicHelicoidMaterial;
  }
  // 创建双曲螺旋体
  createHyperbolicHelicoid() {
    const geometry = new THREE.ParametricGeometry(helicoid, 128, 128);
    const material = this.hyperbolicHelicoidMaterial;
    const hyperbolicHelicoid = this.createMesh({
      geometry,
      material,
    });
    hyperbolicHelicoid.castShadow = true;
    hyperbolicHelicoid.receiveShadow = true;
    this.hyperbolicHelicoid = hyperbolicHelicoid;
  }
  // 创建双珠
  createTwoBalls() {
    const r = this.params.ballRadius;
    const geometry = new THREE.IcosahedronBufferGeometry(r, 5);
    const material = this.hyperbolicHelicoidMaterial;
    const ball1 = this.createMesh({
      geometry,
      material,
    });
    ball1.receiveShadow = true;
    ball1.castShadow = true;
    const ball2 = ball1.clone();
    this.scene.add(ball2);
    this.ball1 = ball1;
    this.ball2 = ball2;
  }
  // 创建光源
  createLight() {
    const dirLight = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 3);
    dirLight.position.set(1, 1, 1);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    this.scene.add(dirLight);
    const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 1);
    this.scene.add(ambiLight);
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const speed = this.params.speed;
    const displacement = elapsedTime * speed;
    this.uniforms.uTime.value = elapsedTime;
    if (this.hyperbolicHelicoid) {
      this.hyperbolicHelicoid.rotation.y = ky.deg2rad(360) * displacement;
    }
    if (this.ball1 && this.ball2) {
      const r = this.params.ballRotateRadius;
      const theta1 = ky.deg2rad(360) * displacement;
      const theta2 = ky.deg2rad(360) * displacement + ky.deg2rad(180);
      this.ball1.position.x = r * Math.sin(theta1);
      this.ball1.position.z = r * Math.cos(theta1);
      this.ball2.position.x = r * Math.sin(theta2);
      this.ball2.position.z = r * Math.cos(theta2);
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI({ width: 300 });
    const uniforms = this.uniforms;
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
      .add(this.params, "ballRotateRadius")
      .min(0)
      .max(1)
      .step(0.01);
    gui
      .add(this.params, "speed")
      .min(0)
      .max(1)
      .step(0.01);
  }
}

export default HyperbolicHelicoid;
