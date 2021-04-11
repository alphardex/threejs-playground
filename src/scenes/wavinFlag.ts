import * as THREE from "three";
import { Base } from "./base";
// @ts-ignore
import wavinFlagVertexShader from "@/shaders/wavinFlag/vertex.glsl";
// @ts-ignore
import wavinFlagFragmentShader from "@/shaders/wavinFlag/fragment.glsl";
import { flagTextureUrl } from "@/consts/wavingFlag";
import * as dat from "dat.gui";

class WavingFlag extends Base {
  clock: THREE.Clock;
  material!: THREE.ShaderMaterial;
  constructor(sel: string, debug = false) {
    super(sel, debug);
    this.cameraPosition = new THREE.Vector3(0, 0, 1);
    this.clock = new THREE.Clock();
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createFlagMaterial();
    this.createFlag();
    this.createLight();
    // this.createDebugPanel();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建旗帜材质
  createFlagMaterial() {
    const loader = new THREE.TextureLoader();
    const flagTexture = loader.load(flagTextureUrl);
    const material = new THREE.ShaderMaterial({
      vertexShader: wavinFlagVertexShader,
      fragmentShader: wavinFlagFragmentShader,
      uniforms: {
        uFrequency: {
          value: new THREE.Vector2(5, 0),
        },
        uTime: {
          value: 0,
        },
        uTexture: {
          value: flagTexture,
        },
      },
    });
    this.material = material;
  }
  // 创建旗帜
  createFlag() {
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    const material = this.material;
    const mesh = this.createMesh({ geometry, material });
    mesh.scale.y = 2 / 3;
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    if (this.material) {
      this.material.uniforms.uTime.value = elapsedTime;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const { material } = this;
    const gui = new dat.GUI();
    gui
      .add(material.uniforms.uFrequency.value, "x")
      .min(0)
      .max(20)
      .step(0.01)
      .name("frequencyX");
    gui
      .add(material.uniforms.uFrequency.value, "y")
      .min(0)
      .max(20)
      .step(0.01)
      .name("frequencyY");
  }
}

export default WavingFlag;
