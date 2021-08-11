import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
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
import { displacementMapUrl, hdrUrl, heightMapUrl } from "@/consts/noiseMarble";

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
    const loader = new THREE.TextureLoader();
    const heightMap = loader.load(heightMapUrl);
    const displacementMap = loader.load(displacementMapUrl);
    displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping;
    this.uniforms = {
      uHeightMap: {
        value: heightMap,
      },
      uColor1: {
        value: new THREE.Color(this.params.color1),
      },
      uColor2: {
        value: new THREE.Color(this.params.color2),
      },
      uTime: {
        value: 0,
      },
      uDisplacementMap: {
        value: displacementMap,
      },
      uSpeed: {
        value: 0.05,
      },
      uStrength: {
        value: 0.2,
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
  // 自动旋转场景
  autoRotateOrbitControl() {
    this.controls.autoRotate = true;
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    this.uniforms.uTime.value = elapsedTime;
  }
}

export default NoiseMarble;
