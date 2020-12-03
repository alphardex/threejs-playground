import { Cube } from "@/types";
import { calcAspect } from "@/utils/math";
import {
  AmbientLight,
  AxesHelper,
  BoxBufferGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector,
  Vector3,
  WebGLRenderer,
} from "three";
import Tweakpane from "tweakpane";
import gsap from "gsap";

class Starter {
  debug: boolean;
  container: HTMLElement | null;
  scene!: Scene;
  camera!: PerspectiveCamera | OrthographicCamera;
  renderer!: WebGLRenderer;
  plane!: Mesh;
  box!: Mesh;
  light!: PointLight | DirectionalLight;
  pane!: Tweakpane;
  constructor(sel: string, debug = false) {
    this.debug = debug;
    this.container = document.querySelector(sel);
  }
  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createBox({});
    this.createLight();
    this.addListeners();
    this.createDebugPanel();
    this.setLoop();
  }
  createScene() {
    const scene = new Scene();
    if (this.debug) {
      scene.add(new AxesHelper());
    }
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
    this.container?.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.renderer.setClearColor(0x000000, 0);
  }
  createBox(cube: Cube) {
    const { width = 1, height = 1, depth = 1, color = new Color("#d9dfc8"), x = 0, y = 0, z = 0 } = cube;
    const geo = new BoxBufferGeometry(width, height, depth);
    const material = new MeshStandardMaterial({ color });
    const box = new Mesh(geo, material);
    box.position.x = x;
    box.position.y = y;
    box.position.z = z;
    this.box = box;
    this.scene.add(box);
  }
  createLight() {
    const directionalLight = new DirectionalLight(new Color("#ffffff"), 1);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);
    const ambientLight = new AmbientLight(new Color("#ffffff"), 0.4);
    this.scene.add(ambientLight);
    this.light = directionalLight;
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
    const lightParams = { color: { r: 255, g: 255, b: 255 }, intensity: 1.5 };
    lightFolder.addInput(lightParams, "color", { label: "Color" }).on("change", (value: any) => {
      this.light.color = new Color(`rgb(${parseInt(value.r)}, ${parseInt(value.g)}, ${parseInt(value.b)})`);
    });
    lightFolder.addInput(lightParams, "intensity", { label: "Intensity", min: 0, max: 1000 }).on("change", (value: any) => {
      this.light.intensity = value;
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
  level: number; // 关卡
  moveLimit: number; // 移动上限
  moveAxis: "x" | "y" | "z"; // 移动所沿的轴
  speed: number; // 移动速度
  state: string; // 状态：paused - 静止；running - 运动
  currentY: number; // 当前的y轴高度
  baseHeight: number; // 基座高度
  blockHeight: number; // 移动方块高度
  cameraPosition: Vector3; // 相机位置
  lookAtPosition: Vector3; // 视点
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.level = 0;
    this.moveLimit = 1.2;
    this.moveAxis = "x";
    this.speed = 0.01;
    this.state = "paused";
    this.baseHeight = 0.1;
    this.currentY = this.baseHeight;
    this.blockHeight = 0.1;
    this.cameraPosition = new Vector3(2, 2, 2);
    this.lookAtPosition = new Vector3(0, 0, 0);
  }
  // 初始化
  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createBox({ height: this.baseHeight, y: 0 });
    this.createLight();
    this.addListeners();
    this.setLoop();
  }
  // 创建正交相机
  createCamera() {
    const { container, cameraPosition, lookAtPosition } = this;
    const aspect = calcAspect(container!);
    const d = 2;
    const camera = new OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
    this.camera = camera;
  }
  // 动画
  update() {
    if (this.state === "running") {
      const { moveAxis } = this;
      this.box.position[moveAxis] += this.speed;
      const currentPosition = this.box.position[moveAxis];
      if (Math.abs(currentPosition) > this.moveLimit) {
        this.speed = this.speed * -1;
      }
    }
  }
  // 事件监听
  addListeners() {
    document.addEventListener("click", () => {
      this.startNextLevel();
    });
  }
  // 渲染
  setLoop() {
    this.renderer.setAnimationLoop(() => {
      this.update();
      this.renderer.render(this.scene, this.camera);
    });
  }
  // 开始下一关
  startNextLevel() {
    this.level += 1;
    this.state = "static";
    this.createBox({ height: this.blockHeight, y: this.currentY });
    this.moveAxis = this.level % 2 ? "x" : "z";
    this.state = "running";
    this.currentY += this.blockHeight;
    this.updateCamera();
  }
  // 更新相机
  updateCamera() {
    this.cameraPosition.y += this.blockHeight;
    this.lookAtPosition.y += this.blockHeight;
    gsap.to(this.camera.position, {
      y: this.cameraPosition.y,
      duration: 0.4,
    });
    gsap.to(this.camera.lookAt, {
      y: this.lookAtPosition.y,
      duration: 0.4,
    });
  }
  // 开始游戏
  start() {
    this.startNextLevel();
  }
}

export { Starter, Stack };
