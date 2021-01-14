import { Cube } from "@/types";
import { calcAspect } from "@/utils/math";
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  Color,
  DirectionalLight,
  Fog,
  FogExp2,
  FontLoader,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshToonMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  Scene,
  TextGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import ky from "kyouka";
import "pannellum";
import { menuFontUrl } from "@/consts";

class Base {
  debug: boolean;
  container: HTMLElement | null;
  scene!: Scene;
  camera!: PerspectiveCamera | OrthographicCamera;
  perspectiveCameraParams!: Record<string, any>;
  orthographicCameraParams!: Record<string, any>;
  cameraPosition!: Vector3;
  lookAtPosition!: Vector3;
  renderer!: WebGLRenderer;
  box!: Mesh;
  light!: PointLight | DirectionalLight;
  controls!: OrbitControls;
  constructor(sel: string, debug = false) {
    this.debug = debug;
    this.container = document.querySelector(sel);
    this.perspectiveCameraParams = {
      fov: 75,
      near: 0.1,
      far: 100,
    };
    this.cameraPosition = new Vector3(0, 3, 10);
    this.lookAtPosition = new Vector3(0, 0, 0);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createBox({});
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
  createPerspectiveCamera() {
    const { perspectiveCameraParams, cameraPosition } = this;
    const { fov, near, far } = perspectiveCameraParams;
    const aspect = calcAspect(this.container!);
    const camera = new PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    this.camera = camera;
  }
  // 创建正交相机
  createOrthographicCamera() {
    const { orthographicCameraParams, cameraPosition, lookAtPosition } = this;
    const { left, right, top, bottom, near, far } = orthographicCameraParams;
    const camera = new OrthographicCamera(left, right, top, bottom, near, far);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
    this.camera = camera;
  }
  // 更新正交相机参数
  updateOrthographicCameraParams(zoom = 2, near = -100, far = 1000) {
    const { container } = this;
    const aspect = calcAspect(container!);
    this.orthographicCameraParams = {
      left: -zoom * aspect,
      right: zoom * aspect,
      top: zoom,
      bottom: -zoom,
      near,
      far,
    };
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
  createBox(cube: Cube, container: Scene | Mesh = this.scene) {
    const {
      width = 1,
      height = 1,
      depth = 1,
      color = new Color("#d9dfc8"),
      x = 0,
      y = 0,
      z = 0,
      material = MeshBasicMaterial,
    } = cube;
    const geo = new BoxGeometry(width, height, depth);
    const mat = new material({ color, flatShading: true });
    const box = new Mesh(geo, mat);
    box.position.x = x;
    box.position.y = y;
    box.position.z = z;
    container.add(box);
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
  // 创建轨道控制
  createOrbitControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update();
    this.controls = controls;
  }
  // 监听事件
  addListeners() {
    this.onResize();
  }
  // 监听画面缩放
  onResize() {
    window.addEventListener("resize", (e) => {
      if (this.camera instanceof PerspectiveCamera) {
        const aspect = calcAspect(this.container!);
        const camera = this.camera as PerspectiveCamera;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        this.renderer.setSize(
          this.container!.clientWidth,
          this.container!.clientHeight
        );
      } else if (this.camera instanceof OrthographicCamera) {
        this.renderer.setSize(
          this.container!.clientWidth,
          this.container!.clientHeight
        );
        this.updateOrthographicCameraParams();
        const camera = this.camera as OrthographicCamera;
        const {
          left,
          right,
          top,
          bottom,
          near,
          far,
        } = this.orthographicCameraParams;
        camera.left = left;
        camera.right = right;
        camera.top = top;
        camera.bottom = bottom;
        camera.near = near;
        camera.far = far;
        camera.updateProjectionMatrix();
      }
    });
  }
  // 动画
  update() {
    console.log("animation");
  }
  // 渲染
  setLoop() {
    this.renderer.setAnimationLoop(() => {
      this.update();
      if (this.controls) {
        this.controls.update();
      }
      this.renderer.render(this.scene, this.camera);
    });
  }
}

class Stack extends Base {
  colorOffset: number; // 颜色偏移量
  boxParams: Record<string, any>; // 方块属性参数
  level: number; // 关卡
  moveLimit: number; // 移动上限
  moveAxis: "x" | "z"; // 移动所沿的轴
  moveEdge: "width" | "depth"; // 移动的边
  currentY: number; // 当前的y轴高度
  state: string; // 状态：paused - 静止；running - 运动
  speed: number; // 移动速度
  speedInc: number; // 速度增量
  speedLimit: number; // 速度上限
  gamestart: boolean; // 游戏开始
  gameover: boolean; // 游戏结束
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.colorOffset = ky.randomIntegerInRange(0, 255);
    this.boxParams = {
      width: 1,
      height: 0.2,
      depth: 1,
      x: 0,
      y: 0,
      z: 0,
      color: new Color("#d9dfc8"),
      material: MeshToonMaterial,
    };
    this.cameraPosition = new Vector3(2, 2, 2);
    this.updateOrthographicCameraParams();
    this.level = 0;
    this.moveLimit = 1.2;
    this.moveAxis = "x";
    this.moveEdge = "width";
    this.currentY = 0;
    this.state = "paused";
    this.speed = 0.02;
    this.speedInc = 0.0005;
    this.speedLimit = 0.05;
    this.gamestart = false;
    this.gameover = false;
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.updateColor();
    this.createBase();
    this.createLight();
    this.addListeners();
    this.setLoop();
  }
  // 创建底座
  createBase() {
    const baseParams = { ...this.boxParams };
    const baseHeight = 2.5;
    baseParams.height = baseHeight;
    baseParams.y -= (baseHeight - this.boxParams.height) / 2;
    const base = this.createBox(baseParams);
    this.box = base;
  }
  // 更新颜色
  updateColor() {
    const { level, colorOffset } = this;
    const colorValue = (level + colorOffset) * 0.25;
    const r = (Math.sin(colorValue) * 55 + 200) / 255;
    const g = (Math.sin(colorValue + 2) * 55 + 200) / 255;
    const b = (Math.sin(colorValue + 4) * 55 + 200) / 255;
    this.boxParams.color = new Color(r, g, b);
  }
  // 开始游戏
  start() {
    this.gamestart = true;
    this.startNextLevel();
  }
  // 开始下一关
  startNextLevel() {
    this.level += 1;
    // 确定移动轴和移动边：奇数x；偶数z
    this.moveAxis = ky.isOdd(this.level) ? "x" : "z";
    this.moveEdge = ky.isOdd(this.level) ? "width" : "depth";
    // 增加方块生成的高度
    this.currentY += this.boxParams.height;
    // 增加方块的速度
    if (this.speed <= this.speedLimit) {
      this.speed += this.speedInc;
    }
    this.updateColor();
    const boxParams = { ...this.boxParams };
    boxParams.y = this.currentY;
    const box = this.createBox(boxParams);
    this.box = box;
    // 确定初始移动位置
    this.box.position[this.moveAxis] = this.moveLimit * -1;
    this.state = "running";
    if (this.level > 1) {
      this.updateCameraHeight();
    }
  }
  // 更新相机高度
  updateCameraHeight() {
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
  // 事件监听
  addListeners() {
    this.onResize();
    if (this.debug) {
      this.onKeyDown();
    } else {
      this.onClick();
    }
  }
  // 监听点击
  onClick() {
    this.renderer.domElement.addEventListener("click", () => {
      if (this.level === 0) {
        this.start();
      } else {
        this.detectOverlap();
      }
    });
  }
  // 监听键盘（调试时使用：空格下一关；P键暂停；上下键控制移动）
  onKeyDown() {
    document.addEventListener("keydown", (e) => {
      const code = e.code;
      if (code === "KeyP") {
        this.state = this.state === "running" ? "paused" : "running";
      } else if (code === "Space") {
        if (this.level === 0) {
          this.start();
        } else {
          // this.detectOverlap();
        }
      } else if (code === "ArrowUp") {
        this.box.position[this.moveAxis] += this.speed / 2;
      } else if (code === "ArrowDown") {
        this.box.position[this.moveAxis] -= this.speed / 2;
      }
    });
  }
  // 检测重叠部分
  // 难点：1. 重叠距离计算 2. 重叠方块位置计算 3. 切掉方块位置计算
  async detectOverlap() {
    const that = this;
    const { boxParams, moveEdge, box, moveAxis, currentY, camera } = this;
    const currentPosition = box.position[moveAxis];
    const prevPosition = boxParams[moveAxis];
    const direction = Math.sign(currentPosition - prevPosition);
    const edge = boxParams![moveEdge];
    // 重叠距离 = 上一个方块的边长 + 方向 * (上一个方块位置 - 当前方块位置)
    const overlap = edge + direction * (prevPosition - currentPosition);
    if (overlap <= 0) {
      this.state = "paused";
      this.dropBox(box);
      gsap.to(camera, {
        zoom: 0.6,
        duration: 1,
        ease: "Power1.easeOut",
        onUpdate() {
          camera.updateProjectionMatrix();
        },
        onComplete() {
          const score = that.level - 1;
          const prevHighScore = Number(localStorage.getItem("high-score")) || 0;
          if (score > prevHighScore) {
            localStorage.setItem("high-score", `${score}`);
          }
          that.gameover = true;
        },
      });
    } else {
      // 创建重叠部分的方块
      const overlapBoxParams = { ...boxParams };
      const overlapBoxPosition = currentPosition / 2 + prevPosition / 2;
      overlapBoxParams.y = currentY;
      overlapBoxParams[moveEdge] = overlap;
      overlapBoxParams[moveAxis] = overlapBoxPosition;
      this.createBox(overlapBoxParams);
      // 创建切掉部分的方块
      const slicedBoxParams = { ...boxParams };
      const slicedBoxEdge = edge - overlap;
      const slicedBoxPosition =
        direction *
        ((edge - overlap) / 2 + edge / 2 + direction * prevPosition);
      slicedBoxParams.y = currentY;
      slicedBoxParams[moveEdge] = slicedBoxEdge;
      slicedBoxParams[moveAxis] = slicedBoxPosition;
      const slicedBox = this.createBox(slicedBoxParams);
      this.dropBox(slicedBox);
      this.boxParams = overlapBoxParams;
      this.scene.remove(box);
      this.startNextLevel();
    }
  }
  // 使方块旋转下落
  dropBox(box: Mesh) {
    const { moveAxis } = this;
    const that = this;
    gsap.to(box.position, {
      y: "-=3.2",
      ease: "power1.easeIn",
      duration: 1.5,
      onComplete() {
        that.scene.remove(box);
      },
    });
    gsap.to(box.rotation, {
      delay: 0.1,
      x: moveAxis === "z" ? ky.randomNumberInRange(4, 5) : 0.1,
      y: 0.1,
      z: moveAxis === "x" ? ky.randomNumberInRange(4, 5) : 0.1,
      duration: 1.5,
    });
  }
  // 状态
  get status() {
    const { level, gamestart, gameover } = this;
    return {
      level,
      gamestart,
      gameover,
    };
  }
}

class Panorama {
  config: Record<string, any>;
  viewer: any;
  constructor(config: Record<string, any>) {
    this.config = config;
    this.viewer = null;
  }
  init() {
    const { config } = this;
    // @ts-ignore
    const viewer = pannellum.viewer(config.id, config.data);
    this.viewer = viewer;
  }
}

class Buildings extends Base {
  ground!: Mesh;
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createOrbitControls();
    this.createGround();
    this.createBuildingGroup();
    this.createLight();
    this.createFog();
    this.addListeners();
    this.setLoop();
  }
  // 创建地面
  createGround() {
    const ground = this.createBox({
      color: new Color("#1a3d4d"),
      width: 20,
      height: 0.1,
      depth: 20,
      material: MeshLambertMaterial,
    });
    this.ground = ground;
  }
  // 创建楼层
  createBuilding(cube: Cube) {
    const { height, x, z } = cube;
    this.createBox(
      {
        color: new Color("#26c6da"),
        width: 0.25,
        depth: 0.25,
        y: 0,
        material: MeshLambertMaterial,
        height,
        x,
        z,
      },
      this.ground
    );
  }
  // 创建楼层群
  createBuildingGroup(count = 1000) {
    for (let i = 0; i < count; i++) {
      const height = ky.randomNumberInRange(0.25, 5);
      const x = Number(ky.randomNumberInRange(-10, 10).toFixed(2));
      const z = Number(ky.randomNumberInRange(-10, 10).toFixed(2));
      this.createBuilding({ height, x, z });
    }
  }
  // 创建光源
  createLight() {
    const light1 = new DirectionalLight(new Color("#ffffff"), 1);
    light1.position.set(1.5, 2, 1);
    this.scene.add(light1);
    const light2 = new DirectionalLight(new Color("#ffffff"), 0.5);
    light2.position.set(-1.5, 2, 1);
    this.scene.add(light2);
    this.light = light1;
  }
  // 创建雾
  createFog() {
    const fog = new FogExp2("#ffffff", 0.1);
    this.scene.fog = fog;
  }
  // 动画
  update() {
    const x = 1 - this.ground.rotation.y;
    const y = 1 - this.camera.position.z;
    const d = ky.distance({ x, y }, { x: 0, y: 0 });
    if (d > 0) {
      this.ground.rotation.y += x * 0.001;
      this.camera.position.z += y * 0.001;
    }
  }
}

class Menu extends Base {
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.cameraPosition = new Vector3(-10, 10, 10);
    this.updateOrthographicCameraParams(15, -1, 100);
  }
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createLight();
    this.createMenu();
    this.createFog();
    this.addListeners();
    this.setLoop();
  }
  // 创建雾
  createFog() {
    const fog = new Fog(0x202533, -1, 100);
    this.scene.fog = fog;
  }
  // 创建光
  createLight() {
    const ambientLight = new AmbientLight(0xcccccc);
    this.scene.add(ambientLight);
    const foreLight = new DirectionalLight(0xffffff, 0.5);
    foreLight.position.set(5, 5, 20);
    this.scene.add(foreLight);
    const backLight = new DirectionalLight(0xffffff, 1);
    backLight.position.set(-5, -5, -10);
    this.scene.add(backLight)
  }
  // 创建菜单
  createMenu() {
    const menuItems = document.querySelectorAll(".menu-list-item a");
    const loader = new FontLoader();
    loader.load(menuFontUrl, (font) => {
      menuItems.forEach((item, i) => {
        const word = new Group();
        const { textContent } = item;
        const words = [];
        Array.from(textContent!).forEach((letter) => {
          const mat = new MeshPhongMaterial({ color: 0x97df5e });
          const geo = new TextGeometry(letter, {
            font,
            size: 3,
            height: 0.4,
            curveSegments: 24,
            bevelEnabled: true,
            bevelThickness: 0.9,
            bevelSize: 0.3,
            bevelSegments: 10
          })
          const mesh = new Mesh(geo, mat);
          word.add(mesh);
        })
        words.push(word);
        this.scene.add(word);
      });
    });
  }
}

export { Base, Stack, Panorama, Buildings, Menu };
