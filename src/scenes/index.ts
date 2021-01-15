import { Cube } from "@/types";
import { calcAspect } from "@/utils/math";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import ky from "kyouka";
import "pannellum";
import { menuFontConfig, menuFontUrl } from "@/consts";
import C from "cannon";
import { MeshPhysicsObject } from "@/utils/physics";
import { Vector3 } from "three";

class Base {
  debug: boolean;
  container: HTMLElement | null;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  perspectiveCameraParams!: Record<string, any>;
  orthographicCameraParams!: Record<string, any>;
  cameraPosition!: THREE.Vector3;
  lookAtPosition!: THREE.Vector3;
  renderer!: THREE.WebGLRenderer;
  box!: THREE.Mesh;
  light!: THREE.PointLight | THREE.DirectionalLight;
  controls!: OrbitControls;
  constructor(sel: string, debug = false) {
    this.debug = debug;
    this.container = document.querySelector(sel);
    this.perspectiveCameraParams = {
      fov: 75,
      near: 0.1,
      far: 100,
    };
    this.orthographicCameraParams = {
      zoom: 2,
      near: -100,
      far: 1000,
    };
    this.cameraPosition = new THREE.Vector3(0, 3, 10);
    this.lookAtPosition = new THREE.Vector3(0, 0, 0);
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
    const scene = new THREE.Scene();
    if (this.debug) {
      scene.add(new THREE.AxesHelper());
    }
    this.scene = scene;
  }
  // 创建透视相机
  createPerspectiveCamera() {
    const { perspectiveCameraParams, cameraPosition } = this;
    const { fov, near, far } = perspectiveCameraParams;
    const aspect = calcAspect(this.container!);
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    this.camera = camera;
  }
  // 创建正交相机
  createOrthographicCamera() {
    const { orthographicCameraParams, cameraPosition, lookAtPosition } = this;
    const { left, right, top, bottom, near, far } = orthographicCameraParams;
    const camera = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      near,
      far
    );
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
    this.camera = camera;
  }
  // 更新正交相机参数
  updateOrthographicCameraParams() {
    const { container } = this;
    const { zoom, near, far } = this.orthographicCameraParams;
    const aspect = calcAspect(container!);
    this.orthographicCameraParams = {
      left: -zoom * aspect,
      right: zoom * aspect,
      top: zoom,
      bottom: -zoom,
      near,
      far,
      zoom
    };
  }
  // 创建渲染
  createRenderer() {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
    this.container?.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.renderer.setClearColor(0x000000, 0);
  }
  // 创建方块
  createBox(cube: Cube, container: THREE.Scene | THREE.Mesh = this.scene) {
    const {
      width = 1,
      height = 1,
      depth = 1,
      color = new THREE.Color("#d9dfc8"),
      x = 0,
      y = 0,
      z = 0,
      material = THREE.MeshBasicMaterial,
    } = cube;
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new material({ color, flatShading: true });
    const box = new THREE.Mesh(geo, mat);
    box.position.x = x;
    box.position.y = y;
    box.position.z = z;
    container.add(box);
    return box;
  }
  // 创建光源
  createLight() {
    const light = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 0.5);
    light.position.set(0, 50, 0);
    this.scene.add(light);
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color("#ffffff"),
      0.4
    );
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
      if (this.camera instanceof THREE.PerspectiveCamera) {
        const aspect = calcAspect(this.container!);
        const camera = this.camera as THREE.PerspectiveCamera;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        this.renderer.setSize(
          this.container!.clientWidth,
          this.container!.clientHeight
        );
      } else if (this.camera instanceof THREE.OrthographicCamera) {
        this.updateOrthographicCameraParams();
        const camera = this.camera as THREE.OrthographicCamera;
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
        this.renderer.setSize(
          this.container!.clientWidth,
          this.container!.clientHeight
        );
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
      color: new THREE.Color("#d9dfc8"),
      material: THREE.MeshToonMaterial,
    };
    this.cameraPosition = new THREE.Vector3(2, 2, 2);
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
    this.boxParams.color = new THREE.Color(r, g, b);
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
  dropBox(box: THREE.Mesh) {
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
  ground!: THREE.Mesh;
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
      color: new THREE.Color("#1a3d4d"),
      width: 20,
      height: 0.1,
      depth: 20,
      material: THREE.MeshLambertMaterial,
    });
    this.ground = ground;
  }
  // 创建楼层
  createBuilding(cube: Cube) {
    const { height, x, z } = cube;
    this.createBox(
      {
        color: new THREE.Color("#26c6da"),
        width: 0.25,
        depth: 0.25,
        y: 0,
        material: THREE.MeshLambertMaterial,
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
    const light1 = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 1);
    light1.position.set(1.5, 2, 1);
    this.scene.add(light1);
    const light2 = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 0.5);
    light2.position.set(-1.5, 2, 1);
    this.scene.add(light2);
    this.light = light1;
  }
  // 创建雾
  createFog() {
    const fog = new THREE.FogExp2("#ffffff", 0.1);
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

class LetterObject extends MeshPhysicsObject {
  xOffset!: number;
  size!: Vector3;
  constructor(body: C.Body, mesh: THREE.Mesh, xOffset: number, size: Vector3) {
    super(body, mesh);
    this.xOffset = xOffset;
    this.size = size;
  }
}

class Menu extends Base {
  menuItems!: NodeListOf<Element>;
  world!: C.World;
  margin!: number;
  offset!: number;
  letterObjs!: LetterObject[];
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.cameraPosition = new THREE.Vector3(-10, 10, 10);
    this.orthographicCameraParams = {
      zoom: 15,
      near: -1,
      far: 100,
    };
    this.updateOrthographicCameraParams();
    this.margin = 6;
    const menuItems = document.querySelectorAll(".menu-list-item a");
    this.menuItems = menuItems;
    this.offset = menuItems.length * this.margin * 0.5;
    this.letterObjs = [];
  }
  init() {
    this.createPhysicsWorld();
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
    const fog = new THREE.Fog(0x202533, -1, 200);
    this.scene.fog = fog;
  }
  // 创建光
  createLight() {
    const ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);
    const foreLight = new THREE.DirectionalLight(0xffffff, 0.5);
    foreLight.position.set(5, 5, 20);
    this.scene.add(foreLight);
    const backLight = new THREE.DirectionalLight(0xffffff, 1);
    backLight.position.set(-5, -5, -10);
    this.scene.add(backLight);
  }
  // 创建物理盒子
  createPhysicsBox(
    halfExtents: C.Vec3,
    bodyOptions: C.IBodyOptions,
    bodyOffset: C.Vec3 = new C.Vec3(0, 0, 0)
  ) {
    const shape = new C.Box(halfExtents);
    const body = new C.Body(bodyOptions);
    body.addShape(shape, bodyOffset);
    this.world.addBody(body);
    return body;
  }
  // 创建文本
  createText(
    text = "",
    config: THREE.TextGeometryParameters,
    material: any,
    color = 0x97df5e
  ) {
    const mat = new material({ color });
    const geo = new THREE.TextGeometry(text, config);
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    const size = geo.boundingBox!.getSize(new THREE.Vector3());
    const mesh = new THREE.Mesh(geo, mat);
    return { mesh, size };
  }
  // 创建菜单
  createMenu() {
    const loader = new THREE.FontLoader();
    loader.load(menuFontUrl, (font) => {
      Array.from(this.menuItems)
        .reverse()
        .forEach((item, i) => {
          this.createGround(i);
          const word = new THREE.Group();
          const { textContent } = item;
          let letterXOffset = 0;
          Array.from(textContent!).forEach((letter) => {
            const config = {
              font,
              ...menuFontConfig,
            };
            const { mesh, size } = this.createText(
              letter,
              config,
              THREE.MeshPhongMaterial
            );
            letterXOffset += size.x;
            const letterYOffset =
              (this.menuItems.length - i - 1) * this.margin - this.offset;
            const halfExtents = new C.Vec3().copy(size as any).scale(0.5);
            const mass = 1 / textContent!.length;
            const position = new C.Vec3(letterXOffset, letterYOffset, 0);
            const bodyOptions = { mass, position };
            const bodyOffset = mesh.geometry.boundingSphere!.center as any;
            const body = this.createPhysicsBox(
              halfExtents,
              bodyOptions,
              bodyOffset
            );
            const letterObj = new LetterObject(body, mesh, letterXOffset, size);
            this.letterObjs.push(letterObj);
            (mesh as any).body = body;
            (mesh as any).size = size;
            word.add(mesh);
          });
          word.children.forEach((letter: any) => {
            letter.body.position.x -= letter.size.x + letterXOffset * 0.5;
          })
          this.scene.add(word);
        });
    });
  }
  // 创建地面
  createGround(i: number) {
    const halfExtents = new C.Vec3(50, 0.1, 50);
    const mass = 0;
    const position = new C.Vec3(0, i * this.margin - this.offset, 0);
    const bodyOptions = { mass, position };
    this.createPhysicsBox(halfExtents, bodyOptions);
  }
  // 创建物理世界
  createPhysicsWorld() {
    const world = new C.World();
    world.gravity.set(0, -150, 0);
    this.world = world;
  }
  // 动画
  update() {
    this.updatePhysics();
    this.world.step(1 / 60);
  }
  // 更新物理
  updatePhysics() {
    this.letterObjs.forEach((letterObj) => {
      const { mesh, body } = letterObj;
      mesh.position.copy(body.position as any);
      mesh.quaternion.copy(body.quaternion as any);
    });
  }
}

export { Base, Stack, Panorama, Buildings, Menu };
