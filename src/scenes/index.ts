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
  Vector3,
  WebGLRenderer,
} from "three";
import Tweakpane from "tweakpane";
import gsap from "gsap";
import ky from "kyouka";

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
    renderer.shadowMap.enabled = true;
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
    box.receiveShadow = true;
    box.castShadow = true;
    this.box = box;
    this.scene.add(box);
  }
  createLight() {
    const light = new DirectionalLight(new Color("#ffffff"), 0.5);
    light.position.set(5, 10, 7.5);
    this.scene.add(light);
    const ambientLight = new AmbientLight(new Color("#ffffff"), 0.4);
    this.scene.add(ambientLight);
    this.light = light;
  }
  addListeners() {
    this.onResize();
  }
  onResize() {
    window.addEventListener("resize", (e) => {
      const aspect = calcAspect(this.container!);
      (this.camera as any).aspect = aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
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
  speedInc: number; // 速度增量
  speedLimit: number; // 速度上限
  state: string; // 状态：paused - 静止；running - 运动
  currentY: number; // 当前的y轴高度
  baseHeight: number; // 基座高度
  blockHeight: number; // 移动方块高度
  cameraPosition: Vector3; // 相机位置
  lookAtPosition: Vector3; // 视点
  color: Color; // 方块颜色
  colorOffset: number; // 颜色偏移量
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.level = 0;
    this.moveLimit = 1.2;
    this.moveAxis = "x";
    this.speed = 0.01;
    this.speedInc = 0.0005;
    this.speedLimit = 0.05;
    this.state = "paused";
    this.baseHeight = 0.1;
    this.currentY = this.baseHeight;
    this.blockHeight = 0.1;
    this.cameraPosition = new Vector3(2, 2, 2);
    this.lookAtPosition = new Vector3(0, 0, 0);
    this.color = new Color("#d9dfc8");
    this.colorOffset = ky.randomIntegerInRange(0, 255);
  }
  // 初始化
  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.updateColor();
    this.createBox({ height: this.baseHeight, y: 0, color: this.color });
    this.box.scale.y = 20;
    this.box.position.y = -1 + 1 / 20;
    this.createLight();
    this.addListeners();
    this.setLoop();
  }
  // 创建正交相机
  createCamera() {
    const { container, cameraPosition, lookAtPosition } = this;
    const aspect = calcAspect(container!);
    const d = 2;
    const camera = new OrthographicCamera(-d * aspect, d * aspect, d, -d, -100, 1000);
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
    this.onResize();
    this.onClick();
  }
  // 监听点击
  onClick() {
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
    if (this.speed <= this.speedLimit) {
      this.speed += this.speedInc;
    }
    this.state = "static";
    this.updateColor();
    this.moveAxis = this.level % 2 ? "x" : "z";
    const boxParams = { height: this.blockHeight, x: 0, y: this.currentY, z: 0, color: this.color };
    boxParams[this.moveAxis] = this.moveLimit * -1;
    this.createBox(boxParams);
    this.speed = Math.abs(this.speed);
    this.state = "running";
    this.currentY += this.blockHeight;
    if (this.level > 1) {
      this.updateCamera();
    }
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
  // 更新颜色
  updateColor() {
    const { level, colorOffset } = this;
    const colorValue = level + colorOffset;
    const r = (Math.sin(0.25 * colorValue) * 55 + 200) / 255;
    const g = (Math.sin(0.25 * colorValue + 2) * 55 + 200) / 255;
    const b = (Math.sin(0.25 * colorValue + 4) * 55 + 200) / 255;
    this.color = new Color(r, g, b);
  }
  // 开始游戏
  start() {
    this.startNextLevel();
  }
}

export { Starter, Stack };
