import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import noiseMarbleColorFragmentShader from "../shaders/noiseMarble/color/fragment.glsl";
import { hdrUrl } from "@/consts/noiseMarble";

class NoiseMarble extends Base {
  clock!: THREE.Clock;
  noiseMarbleMaterial!: THREE.MeshStandardMaterial;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.changeRendererParams();
    await this.loadEnvmap();
    this.createNoiseMarbleMaterial();
    this.createSphere();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 更改渲染器参数
  changeRendererParams() {
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  }
  // 加载envmap
  async loadEnvmap() {
    const envmap = await this.loadHDR(hdrUrl);
    this.scene.environment = envmap;
  }
  // 创建材质
  async createNoiseMarbleMaterial() {
    const noiseMarbleMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.1,
    });
    noiseMarbleMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        /vec4 diffuseColor.*;/,
        noiseMarbleColorFragmentShader
      );
      console.log(shader.fragmentShader);
    };
    this.noiseMarbleMaterial = noiseMarbleMaterial;
  }
  // 创建球体
  createSphere() {
    const geometry = new THREE.SphereBufferGeometry(1, 128, 128);
    const material = this.noiseMarbleMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
}

export default NoiseMarble;
