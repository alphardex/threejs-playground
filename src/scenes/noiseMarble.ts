import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import noiseMarbleColorFragmentShader from "../shaders/noiseMarble/color/fragment.glsl";
// @ts-ignore
import noiseMarbleColorVertexTopShader from "../shaders/noiseMarble/color/vertexTop.glsl";
// @ts-ignore
import noiseMarbleColorVertexMainShader from "../shaders/noiseMarble/color/vertexMain.glsl";
// @ts-ignore
import noiseMarbleColorFragmentTopShader from "../shaders/noiseMarble/color/fragmentTop.glsl";
// @ts-ignore
import noiseMarbleColorFragmentMainShader from "../shaders/noiseMarble/color/fragmentMain.glsl";
// @ts-ignore
import noiseMarbleColorFragmentColorShader from "../shaders/noiseMarble/color/fragmentColor.glsl";
import { hdrUrl, heightmapUrl } from "@/consts/noiseMarble";

class NoiseMarble extends Base {
  clock!: THREE.Clock;
  noiseMarbleMaterial!: THREE.MeshStandardMaterial;
  uniforms!: any;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
    this.params = {
      color1: "navy",
      color2: "#66ccff",
    };
    this.uniforms = {
      uHeightmap: {
        value: this.getHeightmap(),
      },
      uColor1: {
        value: new THREE.Color(this.params.color1),
      },
      uColor2: {
        value: new THREE.Color(this.params.color2),
      },
    };
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
    this.autoRotateOrbitControl();
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
      shader.uniforms = { ...shader.uniforms, ...this.uniforms };
      // vertex
      shader.vertexShader = `
        ${noiseMarbleColorVertexTopShader}
        ${shader.vertexShader}
        `;
      shader.vertexShader = shader.vertexShader.replace(
        /void main\(\) {/,
        (match) =>
          `
        ${match}
        ${noiseMarbleColorVertexMainShader}
        `
      );

      // fragment
      shader.fragmentShader = `
      ${noiseMarbleColorFragmentTopShader}
      ${shader.fragmentShader}
      `;
      shader.fragmentShader = shader.fragmentShader.replace(
        /void main\(\) {/,
        (match) =>
          `
          ${noiseMarbleColorFragmentMainShader}
          ${match}
          `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        /vec4 diffuseColor.*;/,
        noiseMarbleColorFragmentColorShader
      );
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
  // 获取高度贴图
  getHeightmap() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(heightmapUrl);
    return texture;
  }
  // 自动旋转场景
  autoRotateOrbitControl() {
    this.controls.autoRotate = true;
  }
}

export default NoiseMarble;
