import * as THREE from "three";
import gsap from "gsap";
import ky from "kyouka";
import { Base } from "./base";

class Stack extends Base {
  box!: THREE.Mesh;
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
  // 创建盒子
  createBox(boxParams: Record<string, any>) {
    const { width, height, depth, x, y, z, color } = boxParams;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshToonMaterial({
      color,
      flatShading: true,
    });
    const position = new THREE.Vector3(x, y, z);
    const box = this.createMesh({
      geometry,
      material,
      position,
    });
    return box;
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
          this.detectOverlap();
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

export default Stack;
