import * as THREE from "three";
import ky from "kyouka";
// @ts-ignore
import loadFont from "load-bmfont";
// @ts-ignore
import createGeometry from "three-bmfont-text";
// @ts-ignore
import MSDFShader from "three-bmfont-text/shaders/msdf";
import { Base } from "./base";
import { fontAtlas, fontFile } from "@/consts/kineticText";
// @ts-ignore
import kineticTextVertexShader from "../shaders/kineticText/vertex.glsl";
// @ts-ignore
import kineticTextFragmentShader from "../shaders/kineticText/fragment.glsl";

class KineticText extends Base {
  textMesh!: THREE.Mesh;
  rt!: THREE.WebGLRenderTarget;
  rtScene!: THREE.Scene;
  rtCamera!: THREE.PerspectiveCamera;
  clock: THREE.Clock;
  material!: THREE.ShaderMaterial;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.cameraPosition = new THREE.Vector3(0, 0, 40);
    this.clock = new THREE.Clock();
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer(true);
    await this.createKineticText("ALPHARDEX");
    this.createLight();
    this.createOrbitControls();
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
    rtCamera.position.z = 2.5;
    this.rtCamera = rtCamera;
    const rtScene = new THREE.Scene();
    rtScene.add(this.textMesh);
    this.rtScene = rtScene;
  }
  // 创建字体的容器
  createTextContainer() {
    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    const geometry = new THREE.TorusKnotGeometry(9, 3, 768, 3, 4, 3);
    const material = new THREE.ShaderMaterial({
      vertexShader: kineticTextVertexShader,
      fragmentShader: kineticTextFragmentShader,
      uniforms: {
        uTime: {
          value: 0,
        },
        uVelocity: {
          value: 0.5,
        },
        uTexture: {
          value: this.rt.texture,
        },
        uShadow: {
          value: 5,
        },
      },
    });
    this.material = material;
    this.createMesh({
      geometry,
      material,
    });
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
}

export default KineticText;
