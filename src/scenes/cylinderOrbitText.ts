import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
// @ts-ignore
import loadFont from "load-bmfont";
// @ts-ignore
import createGeometry from "three-bmfont-text";
// @ts-ignore
import MSDFShader from "three-bmfont-text/shaders/msdf";
import { fontAtlas, fontFile } from "@/consts/cylinderOrbitText";
import { Base } from "./base";
// @ts-ignore
import cylinderOrbitTextVertexShader from "../shaders/cylinderOrbitText/vertex.glsl";
// @ts-ignore
import cylinderOrbitTextFragmentShader from "../shaders/cylinderOrbitText/fragment.glsl";

class CylinderOrbitText extends Base {
  clock!: THREE.Clock;
  cylinderOrbitTextMaterial!: THREE.ShaderMaterial;
  textMesh!: THREE.Mesh;
  mesh!: THREE.Mesh | null;
  rt!: THREE.WebGLRenderTarget;
  rtScene!: THREE.Scene;
  rtCamera!: THREE.PerspectiveCamera;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 3);
    this.params = {
      velocity: 0.3,
      textColor: "#ffffff",
      textContainerColor: "#000000",
      text: "ALPHARDEX",
      cameraZ: 3,
      fov: 37,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    await this.createKineticText(this.params.text);
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createCylinderOrbitTextMaterial() {
    const cylinderOrbitTextMaterial = new THREE.ShaderMaterial({
      vertexShader: cylinderOrbitTextVertexShader,
      fragmentShader: cylinderOrbitTextFragmentShader,
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
        uTexture: {
          value: this.rt.texture,
        },
        uVelocity: {
          value: this.params.velocity,
        },
        uCylinderOpacity: {
          value: 0,
        },
      },
    });
    this.cylinderOrbitTextMaterial = cylinderOrbitTextMaterial;
  }
  // 创建动态文字
  async createKineticText(text: string) {
    await this.createFontText(text);
    this.createRenderTarget();
    this.createCylinderOrbitTextMaterial();
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
              color: this.params.textColor,
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
    const rtCamera = new THREE.PerspectiveCamera(this.params.fov, 1, 0.1, 1000);
    rtCamera.position.z = this.params.cameraZ;
    this.rtCamera = rtCamera;
    const rtScene = new THREE.Scene();
    rtScene.background = new THREE.Color(this.params.textContainerColor);
    rtScene.add(this.textMesh);
    this.rtScene = rtScene;
  }
  // 创建字体的容器
  createTextContainer() {
    const heightRatio = (0.5 / (this.params.text.length / 10)) * 2;
    const geometry = new THREE.CylinderGeometry(1, 1, heightRatio, 50, 1, true);
    const material = this.cylinderOrbitTextMaterial;
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
    const mousePos = this.mouseTracker.mousePos;
    if (this.cylinderOrbitTextMaterial) {
      this.cylinderOrbitTextMaterial.uniforms.uTime.value = elapsedTime;
      this.cylinderOrbitTextMaterial.uniforms.uMouse.value = mousePos;
    }
    if (this.mesh) {
      this.mesh.rotation.z = this.mouseTracker.mousePos.x;
    }
  }
}

export default CylinderOrbitText;
