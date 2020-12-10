import { Cube } from "@/types";
import { calcAspect } from "@/utils/math";
import {
  AmbientLight,
  AxesHelper,
  BoxBufferGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshToonMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import gsap from "gsap";
import ky from "kyouka";

class Starter {
  debug: boolean;
  container: HTMLElement | null;
  scene!: Scene;
  camera!: PerspectiveCamera | OrthographicCamera;
  renderer!: WebGLRenderer;
  box!: Mesh;
  light!: PointLight | DirectionalLight;
  constructor(sel: string, debug = false) {
    this.debug = debug;
    this.container = document.querySelector(sel);
  }
  // 初始化
  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    const box = this.createBox({});
    this.box = box;
    this.createLight();
    this.addListeners();
    this.setLoop();
  }
  // 创建场景
  createScene() {
    const scene = new Scene();
    if (this.debug) {
      scene.add(new AxesHelper());
    }
    this.scene = scene;
  }
  // 创建透视相机
  createCamera() {
    const aspect = calcAspect(this.container!);
    const camera = new PerspectiveCamera(75, aspect, 0.1, 100);
    camera.position.set(0, 1, 10);
    this.camera = camera;
  }
  // 创建渲染
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
  // 创建方块
  createBox(cube: Cube) {
    const { width = 1, height = 1, depth = 1, color = new Color("#d9dfc8"), x = 0, y = 0, z = 0 } = cube;
    const geo = new BoxBufferGeometry(width, height, depth);
    const material = new MeshToonMaterial({ color, flatShading: true });
    const box = new Mesh(geo, material);
    box.position.x = x;
    box.position.y = y;
    box.position.z = z;
    this.scene.add(box);
    return box;
  }
  // 创建光源
  createLight() {
    const light = new DirectionalLight(new Color("#ffffff"), 0.5);
    light.position.set(0, 50, 0);
    this.scene.add(light);
    const ambientLight = new AmbientLight(new Color("#ffffff"), 0.4);
    this.scene.add(ambientLight);
    this.light = light;
  }
  // 监听事件
  addListeners() {
    this.onResize();
  }
  // 监听画面缩放
  onResize() {
    window.addEventListener("resize", (e) => {
      const aspect = calcAspect(this.container!);
      const camera = this.camera as PerspectiveCamera;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      this.renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
    });
  }
  // 动画
  update() {
    this.box.rotation.y += 0.01;
    this.box.rotation.z += 0.006;
  }
  // 渲染
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
  moveAxis: "x" | "z"; // 移动所沿的轴
  moveEdge: "width" | "depth"; // 移动的边
  speed: number; // 移动速度
  speedInc: number; // 速度增量
  speedLimit: number; // 速度上限
  state: string; // 状态：paused - 静止；running - 运动
  currentY: number; // 当前的y轴高度
  boxParams: Record<string, any>; // 方块属性参数
  colorOffset: number; // 颜色偏移量
  cameraPosition: Vector3; // 相机位置
  lookAtPosition: Vector3; // 视点
  cameraParams: Record<string, any>; // 相机参数
  gameover: boolean; // 游戏结束
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.level = 0;
    this.moveLimit = 1.2;
    this.moveAxis = "x";
    this.moveEdge = "width";
    this.speed = 0.01;
    this.speedInc = 0.0005;
    this.speedLimit = 0.05;
    this.state = "paused";
    this.currentY = 0;
    this.cameraPosition = new Vector3(2, 2, 2);
    this.lookAtPosition = new Vector3(0, 0, 0);
    this.colorOffset = ky.randomIntegerInRange(0, 255);
    this.cameraParams = {};
    this.boxParams = { width: 1, height: 0.1, depth: 1, x: 0, y: 0, z: 0, color: new Color("#d9dfc8") };
    this.updateCameraParams();
    this.gameover = false;
  }
  // 更新相机参数
  updateCameraParams() {
    const { container } = this;
    const aspect = calcAspect(container!);
    const zoom = 2;
    this.cameraParams = { left: -zoom * aspect, right: zoom * aspect, top: zoom, bottom: -zoom, near: -100, far: 1000 };
  }
  // 初始化
  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.updateColor();
    const baseParams = { ...this.boxParams };
    baseParams.height = 0.1;
    const base = this.createBox(baseParams);
    this.box = base;
    this.createLight();
    this.addListeners();
    this.setLoop();
  }
  // 创建正交相机
  createCamera() {
    const { cameraParams, cameraPosition, lookAtPosition } = this;
    const { left, right, top, bottom, near, far } = cameraParams;
    const camera = new OrthographicCamera(left, right, top, bottom, near, far);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
    this.camera = camera;
  }
  // 更新颜色
  updateColor() {
    const { level, colorOffset } = this;
    const colorValue = level + colorOffset;
    const r = (Math.sin(0.25 * colorValue) * 55 + 200) / 255;
    const g = (Math.sin(0.25 * colorValue + 2) * 55 + 200) / 255;
    const b = (Math.sin(0.25 * colorValue + 4) * 55 + 200) / 255;
    this.boxParams.color = new Color(r, g, b);
  }
  // 事件监听
  addListeners() {
    this.onResize();
    if (this.debug) {
      this.onKeyDown();
    } else {
      this.onClick();
    }
  }
  // 监听画面缩放
  onResize() {
    window.addEventListener("resize", (e) => {
      this.renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
      this.updateCameraParams();
      const camera = this.camera as OrthographicCamera;
      const { left, right, top, bottom, near, far } = this.cameraParams;
      camera.left = left;
      camera.right = right;
      camera.top = top;
      camera.bottom = bottom;
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();
    });
  }
  // 监听点击
  onClick() {
    this.renderer.domElement.addEventListener("click", () => {
      this.detectOverlap();
    });
  }
  // 监听键盘（调试时使用：空格下一关；P键暂停；上下键控制移动）
  onKeyDown() {
    document.addEventListener("keydown", (e) => {
      const code = e.code;
      if (code === "KeyP") {
        this.state = this.state === "running" ? "paused" : "running";
      } else if (code === "Space") {
        this.detectOverlap();
      } else if (code === "ArrowUp") {
        this.box.position[this.moveAxis] += this.speed / 2;
      } else if (code === "ArrowDown") {
        this.box.position[this.moveAxis] -= this.speed / 2;
      }
    });
  }
  // 检测重叠部分
  // 难点：1. 重叠距离计算 2. 重叠方块位置计算 3. 切掉方块位置计算
  detectOverlap() {
    const { boxParams, moveEdge, box, moveAxis } = this;
    const currentPosition = box.position[moveAxis];
    const prevPosition = boxParams[moveAxis];
    const direction = Math.sign(currentPosition - prevPosition);
    const edge = boxParams![moveEdge];
    // 重叠距离 = 上一个方块的边长 + 方向 * (上一个方块位置 - 当前方块位置)
    const overlap = edge + direction * (prevPosition - currentPosition);
    if (overlap <= 0) {
      alert("gameover");
      this.gameover = true;
      return;
    }
    // 创建重叠部分的方块
    const overlapBoxParams = { ...boxParams };
    overlapBoxParams.y = box.position.y;
    overlapBoxParams[moveEdge] = overlap;
    const overlapPosition = currentPosition / 2 + prevPosition / 2;
    overlapBoxParams[moveAxis] = overlapPosition;
    this.createBox(overlapBoxParams);
    // 创建切掉部分的方块
    const slicedBoxParams = { ...boxParams };
    slicedBoxParams.y = box.position.y;
    slicedBoxParams[moveEdge] = boxParams[moveEdge] - overlap;
    slicedBoxParams[moveAxis] = direction * ((edge - overlap) / 2 + edge / 2 - prevPosition);
    const slicedBox = this.createBox(slicedBoxParams);
    gsap.to(slicedBox.position, {
      y: -4,
      duration: 1,
      ease: "power1.easeIn",
    });
    this.boxParams = overlapBoxParams;
    this.scene.remove(box);
    if (!this.gameover) {
      this.startNextLevel();
    }
  }
  // 开始下一关
  startNextLevel() {
    this.level += 1;
    // 关卡数越大，速度越快
    if (this.speed <= this.speedLimit) {
      this.speed += this.speedInc;
    }
    // 确定移动轴和移动边：奇数x；偶数z
    this.moveAxis = this.level % 2 ? "x" : "z";
    this.moveEdge = this.level % 2 ? "width" : "depth";
    // 增加方块生成的高度
    this.currentY += this.boxParams.height;
    this.updateColor();
    const boxParams = { ...this.boxParams };
    boxParams.y = this.currentY;
    const box = this.createBox(boxParams);
    this.box = box;
    // 确定初始移动位置
    this.box.position[this.moveAxis] = this.moveLimit * -1;
    this.state = "running";
    if (this.level > 1) {
      this.updateCamera();
    }
  }
  // 更新相机
  updateCamera() {
    this.cameraPosition.y += this.boxParams.height;
    this.lookAtPosition.y += this.boxParams.height;
    gsap.to(this.camera.position, {
      y: this.cameraPosition.y,
      duration: 0.4,
    });
    gsap.to(this.camera.lookAt, {
      y: this.lookAtPosition.y,
      duration: 0.4,
    });
  }
  // 动画
  update() {
    if (this.state === "running") {
      const { moveAxis } = this;
      this.box.position[moveAxis] += this.speed;
      // 移到末端就反转方向
      if (Math.abs(this.box.position[moveAxis]) > this.moveLimit) {
        this.speed = this.speed * -1;
      }
    }
  }
  // 开始游戏
  start() {
    this.startNextLevel();
  }
}

export { Starter, Stack };
