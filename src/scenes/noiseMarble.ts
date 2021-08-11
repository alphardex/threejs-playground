import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import noiseMarbleVertexTopShader from "../shaders/noiseMarble/vertexTop.glsl";
// @ts-ignore
import noiseMarbleVertexMainShader from "../shaders/noiseMarble/vertexMain.glsl";
// @ts-ignore
import noiseMarbleFragmentTopShader from "../shaders/noiseMarble/fragmentTop.glsl";
// @ts-ignore
import noiseMarbleFragmentMainShader from "../shaders/noiseMarble/fragmentMain.glsl";
// @ts-ignore
import noiseMarbleFragmentColorShader from "../shaders/noiseMarble/fragmentColor.glsl";
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
      roughness: 0.1,
      color1: "#000000",
      color2: "#66ccff",
      depth: 0.6,
      smooth: 0.2,
      speed: 0.05,
      strength: 0.2,
      slice: 1,
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
      uDepth: {
        value: this.params.depth,
      },
      uSmooth: {
        value: this.params.smooth,
      },
      uTime: {
        value: 0,
      },
      uDisplacementMap: {
        value: displacementMap,
      },
      uSpeed: {
        value: this.params.speed,
      },
      uStrength: {
        value: this.params.strength,
      },
      uSlice: {
        value: this.params.slice,
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
    this.createOrbitControls();
    this.autoRotateOrbitControl();
    this.createDebugPanel();
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
      roughness: this.params.roughness,
    });
    noiseMarbleMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = { ...shader.uniforms, ...this.uniforms };
      // vertex
      shader.vertexShader = `
        ${noiseMarbleVertexTopShader}
        ${shader.vertexShader}
        `;
      shader.vertexShader = shader.vertexShader.replace(
        /void main\(\) {/,
        (match) =>
          `
        ${match}
        ${noiseMarbleVertexMainShader}
        `
      );

      // fragment
      shader.fragmentShader = `
      ${noiseMarbleFragmentTopShader}
      ${shader.fragmentShader}
      `;
      shader.fragmentShader = shader.fragmentShader.replace(
        /void main\(\) {/,
        (match) =>
          `
          ${noiseMarbleFragmentMainShader}
          ${match}
          `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        /vec4 diffuseColor.*;/,
        noiseMarbleFragmentColorShader
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
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    const material = this.noiseMarbleMaterial;
    const uniforms = this.uniforms;
    gui.add(this.params, "roughness", 0, 1, 0.01).onChange((value) => {
      material.roughness = value;
    });
    gui.add(this.params, "depth", 0, 1, 0.01).onChange((value) => {
      uniforms.uDepth.value = value;
    });
    gui.add(this.params, "smooth", 0, 1, 0.01).onChange((value) => {
      uniforms.uSmooth.value = value;
    });
    gui.add(this.params, "speed", 0, 1, 0.01).onChange((value) => {
      uniforms.uSpeed.value = value;
    });
    gui.add(this.params, "strength", 0, 1, 0.01).onChange((value) => {
      uniforms.uStrength.value = value;
    });
    gui.add(this.params, "slice", 0, 5, 0.01).onChange((value) => {
      uniforms.uSlice.value = value;
    });
    gui.addColor(this.params, "color1").onChange((value) => {
      uniforms.uColor1.value = new THREE.Color(value);
    });
    gui.addColor(this.params, "color2").onChange((value) => {
      uniforms.uColor2.value = new THREE.Color(value);
    });
  }
}

export default NoiseMarble;
