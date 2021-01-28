import * as THREE from "three";
import ky from "kyouka";
import { Base } from "./base";
import * as dat from "dat.gui";

class GridWave extends Base {
  params: any;
  dimension: number;
  clock: THREE.Clock;
  points: THREE.Points | null;
  geo: THREE.BufferGeometry | null;
  mat: THREE.PointsMaterial | null;
  positions: any[];
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.dimension = 3;
    this.clock = new THREE.Clock();
    this.points = null;
    this.geo = null;
    this.mat = null;
    this.positions = [];
    this.perspectiveCameraParams.fov = 30;
    this.perspectiveCameraParams.near = 1;
    this.perspectiveCameraParams.far = 1500;
    this.cameraPosition = new THREE.Vector3(0, 15, 33);
    this.params = {
      row: 128,
      col: 128,
      size: 0.1,
      speed: 2,
      rate: 6,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createGrid();
    this.createLight();
    this.createOrbitControls();
    this.createDebug();
    this.addListeners();
    this.setLoop();
  }
  // 创建网格数组
  createGridArray(row: number, col: number) {
    const gridArray = ky.initialize2DArray(row, col);
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        gridArray[i][j] = [i, 0, j];
      }
    }
    return gridArray;
  }
  // 创建网格
  createGrid() {
    const { params, dimension } = this;
    const { row, col, size } = params;
    const geo = new THREE.BufferGeometry();
    const rawPositions = this.createGridArray(row, col);
    this.positions = rawPositions;
    const positions = new Float32Array(rawPositions.flat(2));
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, dimension)
    );
    this.geo = geo;
    const mat = new THREE.PointsMaterial({
      size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.mat = mat;
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    points.position.set(-(row - 1) / 2, 0, -(col - 1) / 2);
    this.points = points;
  }
  // 动画
  update() {
    if (this.points) {
      const { params, positions, clock, geo } = this;
      const { row, col, speed, rate } = params;
      const elapsedTime = clock.getElapsedTime();
      for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
          const pos = positions[i][j];
          const xValue = pos[0];
          const zValue = pos[2];
          pos[1] = Math.sin(elapsedTime * speed + (xValue + zValue) / rate);
        }
      }
      // @ts-ignore
      geo!.attributes.position.array = new Float32Array(positions.flat(2));
      geo!.attributes.position.needsUpdate = true;
    }
  }
  // 创建调试
  createDebug() {
    const gui = new dat.GUI();
    gui
      .add(this.params, "row")
      .min(2)
      .max(256)
      .step(1)
      .onFinishChange(() => {
        this.regenerateGrid();
      });
    gui
      .add(this.params, "col")
      .min(2)
      .max(256)
      .step(1)
      .onFinishChange(() => {
        this.regenerateGrid();
      });
    gui
      .add(this.params, "size")
      .min(0.001)
      .max(1)
      .step(0.001)
      .onFinishChange(() => {
        this.regenerateGrid();
      });
    gui
      .add(this.params, "speed")
      .min(1)
      .max(10)
      .step(0.1)
      .onFinishChange(() => {
        this.regenerateGrid();
      });
    gui
      .add(this.params, "rate")
      .min(1)
      .max(10)
      .step(0.1)
      .onFinishChange(() => {
        this.regenerateGrid();
      });
  }
  // 重新生成网格
  regenerateGrid() {
    this.geo!.dispose();
    this.mat!.dispose();
    this.scene.remove(this.points!);
    this.createGrid();
  }
}

export default GridWave;
