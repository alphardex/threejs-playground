import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import loadFont from "load-bmfont";
import createGeometry from "three-bmfont-text";
import MSDFShader from "three-bmfont-text/shaders/msdf";
import { Base } from "@/commons/base";
import { fontAtlas, fontFile } from "@/consts/kineticText";
import kineticTextTorusKnotVertexShader from "../shaders/kineticText/torusKnot/vertex.glsl";
import kineticTextTorusKnotFragmentShader from "../shaders/kineticText/torusKnot/fragment.glsl";
import kineticTextSphereVertexShader from "../shaders/kineticText/sphere/vertex.glsl";
import kineticTextSphereFragmentShader from "../shaders/kineticText/sphere/fragment.glsl";
import kineticTextPlaneVertexShader from "../shaders/kineticText/plane/vertex.glsl";
import kineticTextPlaneFragmentShader from "../shaders/kineticText/plane/fragment.glsl";
import kineticTextTorusVertexShader from "../shaders/kineticText/torus/vertex.glsl";
import kineticTextTorusFragmentShader from "../shaders/kineticText/torus/fragment.glsl";
import kineticTextCylinderVertexShader from "../shaders/kineticText/cylinder/vertex.glsl";
import kineticTextCylinderFragmentShader from "../shaders/kineticText/cylinder/fragment.glsl";

interface Params {
  meshName: string;
  velocity: number;
  shadow: number;
  color: string;
  frequency: number;
  text: string;
  cameraZ: number;
}

class KineticText extends Base {
  textMesh!: THREE.Mesh;
  rt!: THREE.WebGLRenderTarget;
  rtScene!: THREE.Scene;
  rtCamera!: THREE.PerspectiveCamera;
  clock: THREE.Clock;
  material!: THREE.ShaderMaterial | null;
  params!: Params;
  meshConfig!: any;
  mesh!: THREE.Mesh | null;
  meshNames!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.cameraPosition = new THREE.Vector3(0, 0, 40);
    this.clock = new THREE.Clock();
    this.meshConfig = {
      torusKnot: {
        vertexShader: kineticTextTorusKnotVertexShader,
        fragmentShader: kineticTextTorusKnotFragmentShader,
        geometry: new THREE.TorusKnotGeometry(9, 3, 768, 3, 4, 3),
      },
      sphere: {
        vertexShader: kineticTextSphereVertexShader,
        fragmentShader: kineticTextSphereFragmentShader,
        geometry: new THREE.SphereGeometry(15, 64, 64),
      },
      plane: {
        vertexShader: kineticTextPlaneVertexShader,
        fragmentShader: kineticTextPlaneFragmentShader,
        geometry: new THREE.PlaneGeometry(30, 30, 64, 64),
      },
      torus: {
        vertexShader: kineticTextTorusVertexShader,
        fragmentShader: kineticTextTorusFragmentShader,
        geometry: new THREE.TorusGeometry(12, 4, 20, 45),
      },
      cylinder: {
        vertexShader: kineticTextCylinderVertexShader,
        fragmentShader: kineticTextCylinderFragmentShader,
        geometry: new THREE.CylinderGeometry(12, 12, 21, 64, 64),
      },
    };
    this.meshNames = Object.keys(this.meshConfig);
    this.params = {
      meshName: "torusKnot",
      velocity: 0.5,
      shadow: 5,
      color: "#000000",
      frequency: 0.5,
      text: "ALPHARDEX",
      cameraZ: 2.5,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    await this.createKineticText(this.params.text);
    this.createLight();
    this.createOrbitControls();
    this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建动态文字
  async createKineticText(text: string) {
    await this.createFontText(text);
    this.createRenderTarget();
    this.createTextContainer();
  }
  // 加载字体文本
  loadFontText(text: string): any {
    return new Promise((resolve) => {
      loadFont(fontFile, (err: any, font: any) => {
        const fontGeo = createGeometry({
          font,
          text,
        });
        const loader = new THREE.TextureLoader();
        loader.load(fontAtlas, (texture) => {
          const fontMat = new THREE.RawShaderMaterial(
            MSDFShader({
              map: texture,
              side: THREE.DoubleSide,
              transparent: true,
              negate: false,
              color: 0xffffff,
            })
          );
          resolve({ fontGeo, fontMat });
        });
      });
    });
  }
  // 创建字体文本
  async createFontText(text: string) {
    const { fontGeo, fontMat } = await this.loadFontText(text);
    const textMesh = this.createMesh({
      geometry: fontGeo,
      material: fontMat,
    });
    textMesh.position.set(-0.965, -0.525, 0);
    textMesh.rotation.set(ky.deg2rad(180), 0, 0);
    textMesh.scale.set(0.008, 0.025, 1);
    this.textMesh = textMesh;
  }
  // 创建渲染目标
  createRenderTarget() {
    const rt = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    this.rt = rt;
    const rtCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    rtCamera.position.z = this.params.cameraZ;
    this.rtCamera = rtCamera;
    const rtScene = new THREE.Scene();
    rtScene.add(this.textMesh);
    this.rtScene = rtScene;
  }
  // 创建字体的容器
  createTextContainer() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh = null;
      this.material!.dispose();
      this.material = null;
    }
    this.rtScene.background = new THREE.Color(this.params.color);
    const meshConfig = this.meshConfig[this.params.meshName];
    const geometry = meshConfig.geometry;
    const material = new THREE.ShaderMaterial({
      vertexShader: meshConfig.vertexShader,
      fragmentShader: meshConfig.fragmentShader,
      uniforms: {
        uTime: {
          value: 0,
        },
        uVelocity: {
          value: this.params.velocity,
        },
        uTexture: {
          value: this.rt.texture,
        },
        uShadow: {
          value: this.params.shadow,
        },
        uFrequency: {
          value: this.params.frequency,
        },
      },
    });
    this.material = material;
    const mesh = this.createMesh({
      geometry,
      material,
    });
    this.mesh = mesh;
  }
  // 动画
  update() {
    if (this.rtScene) {
      this.renderer.setRenderTarget(this.rt);
      this.renderer.render(this.rtScene, this.rtCamera);
      this.renderer.setRenderTarget(null);
    }
    const elapsedTime = this.clock.getElapsedTime();
    if (this.material) {
      this.material.uniforms.uTime.value = elapsedTime;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    gui
      .add(this.params, "velocity")
      .min(0)
      .max(5)
      .step(0.01)
      .onFinishChange(() => {
        this.createTextContainer();
      });
    gui
      .add(this.params, "cameraZ")
      .min(0)
      .max(5)
      .step(0.01)
      .onFinishChange(async () => {
        await this.createKineticText(this.params.text);
      });
    gui.add(this.params, "meshName", this.meshNames).onFinishChange(() => {
      this.createTextContainer();
    });
    gui.add(this.params, "text").onFinishChange(async () => {
      await this.createKineticText(this.params.text);
    });
    gui.addColor(this.params, "color").onFinishChange(() => {
      this.createTextContainer();
    });
  }
}

export default KineticText;
