import { Cube } from "@/types";
import { calcAspect } from "@/utils/math";
import {
  BoxBufferGeometry,
  Color,
  GammaEncoding,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from "three";
import Tweakpane from "tweakpane";

class Starter {
  container: HTMLElement | null;
  scene!: Scene;
  camera!: PerspectiveCamera | OrthographicCamera;
  renderer!: WebGLRenderer;
  box!: Mesh;
  pointLight!: PointLight;
  pane!: Tweakpane;
  constructor(sel: string) {
    this.container = document.querySelector(sel);
  }
  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createBox();
    this.createLight();
    this.addListeners();
    this.createDebugPanel();
    this.setLoop();
  }
  createScene() {
    const scene = new Scene();
    this.scene = scene;
  }
  createCamera() {
    const aspect = calcAspect(this.container!);
    const camera = new PerspectiveCamera(75, aspect, 0.1, 100);
    camera.position.set(0, 1, 10);
    this.camera = camera;
  }
  createRenderer() {
    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = GammaEncoding;
    this.container?.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.renderer.setClearColor(0x121212);
  }
  createBox(cube: Cube = { width: 1, height: 1, depth: 1, color: new Color("#ffffff") }) {
    const { width, height, depth, color } = cube;
    const geo = new BoxBufferGeometry(width, height, depth);
    const material = new MeshStandardMaterial({ color });
    const box = new Mesh(geo, material);
    this.box = box;
    this.scene.add(box);
  }
  createLight() {
    const pointLight = new PointLight(0xff0055, 500, 100, 2);
    pointLight.position.set(8, 10, 3);
    this.scene.add(pointLight);
    this.pointLight = pointLight;
  }
  addListeners() {
    window.addEventListener("resize", (e) => {
      const aspect = calcAspect(this.container!);
      (this.camera as any).aspect = aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
    });
  }
  createDebugPanel() {
    const pane = new Tweakpane();
    const sceneFolder = pane.addFolder({ title: "Scene" });
    const bgParams = { background: { r: 18, g: 18, b: 18, a: 1 } };
    sceneFolder.addInput(bgParams, "background", { label: "Background Color" }).on("change", (value: any) => {
      this.renderer.setClearColor(`rgb(${parseInt(value.r)},${parseInt(value.g)},${parseInt(value.b)})`, value.a);
    });
    const boxFolder = pane.addFolder({ title: "Box" });
    const boxParams = { width: 1, height: 1, depth: 1, metalness: 0.5, roughness: 0.5 };
    boxFolder.addInput(boxParams, "width", { label: "Width", min: 1, max: 10 }).on("change", (value: any) => {
      this.box.scale.x = value;
    });
    boxFolder.addInput(boxParams, "height", { label: "Height", min: 1, max: 10 }).on("change", (value: any) => {
      this.box.scale.y = value;
    });
    boxFolder.addInput(boxParams, "depth", { label: "Depth", min: 1, max: 10 }).on("change", (value: any) => {
      this.box.scale.z = value;
    });
    boxFolder.addInput(boxParams, "metalness", { label: "Metalness", min: 0, max: 1 }).on("change", (value: any) => {
      (this.box.material as any).metalness = value;
    });
    boxFolder.addInput(boxParams, "roughness", { label: "Roughness", min: 0, max: 1 }).on("change", (value: any) => {
      (this.box.material as any).roughness = value;
    });
    const lightFolder = pane.addFolder({ title: "Light" });
    const lightParams = { color: { r: 255, g: 0, b: 85 }, intensity: 500 };
    lightFolder.addInput(lightParams, "color", { label: "Color" }).on("change", (value: any) => {
      this.pointLight.color = new Color(`rgb(${parseInt(value.r)}, ${parseInt(value.g)}, ${parseInt(value.b)})`);
    });
    lightFolder.addInput(lightParams, "intensity", { label: "Intensity", min: 0, max: 1000 }).on("change", (value: any) => {
      this.pointLight.intensity = value;
    });
  }
  update() {
    this.box.rotation.y += 0.01;
    this.box.rotation.z += 0.006;
  }
  setLoop() {
    this.renderer.setAnimationLoop(() => {
      this.update();
      this.renderer.render(this.scene, this.camera);
    });
  }
}

class Stack extends Starter {
  constructor(sel: string) {
    super(sel);
  }
  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createBox({ width: 1, height: 0.5, depth: 1, color: new Color("#ffffff") });
    this.createLight();
    this.addListeners();
    this.setLoop();
  }
  createCamera() {
    const aspect = calcAspect(this.container!);
    const d = 2;
    const camera = new OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(2, 2, 2);
    camera.lookAt(0, 0, 0);
    this.camera = camera;
  }
  setLoop() {
    this.renderer.setAnimationLoop(() => {
      this.renderer.render(this.scene, this.camera);
    });
  }
}

export { Starter, Stack };
