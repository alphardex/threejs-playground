import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import travellingParticlesVertexShader from "../shaders/travellingParticles/vertex.glsl";
// @ts-ignore
import travellingParticlesFragmentShader from "../shaders/travellingParticles/fragment.glsl";

interface Line {
  points: THREE.Vector3[];
  pointCount: number;
  currentPos: number;
}

interface Params {
  activePointPerLine: number;
  opacityRate: number;
  pointSpeed: number;
  pointColor: string;
}

class TravellingParticles extends Base {
  geometry!: THREE.BufferGeometry;
  material!: THREE.ShaderMaterial;
  points!: THREE.Points | null;
  lines!: Line[];
  pointSize!: number;
  positions!: Float32Array;
  opacitys!: Float32Array;
  activePointCount!: number;
  params!: Params;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.perspectiveCameraParams.near = 100;
    this.perspectiveCameraParams.far = 1000;
    this.cameraPosition = new THREE.Vector3(0, 0, 400);
    this.lines = [];
    this.pointSize = 4;
    this.activePointCount = 0;
    this.params = {
      activePointPerLine: 50,
      opacityRate: 7.5,
      pointSpeed: 1,
      pointColor: "#4ec0e9",
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.getSvgPathsPointLineData();
    this.createPoints();
    this.createLight();
    this.createOrbitControls();
    this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 获取svg路径的点线数据
  getSvgPathsPointLineData() {
    const paths = ([
      ...document.querySelectorAll(".land"),
    ] as unknown) as SVGPathElement[];
    paths.forEach((path) => {
      const pathLength = path.getTotalLength();
      const pointCount = Math.floor(pathLength / this.pointSize);
      const points = [];
      for (let i = 0; i < pointCount; i++) {
        // 获取点距离路径原点的距离，进而获取其坐标
        const distance = (pathLength * i) / pointCount;
        const point = path.getPointAtLength(distance);
        if (point) {
          let { x, y } = point;
          // 使点在屏幕正中央
          x -= 480;
          y -= 270;
          const randX = ky.randomNumberInRange(-2.5, 2.5);
          const randY = ky.randomNumberInRange(-2.5, 2.5);
          x += randX;
          y += randY;
          points.push(new THREE.Vector3(x, y, 0));
        }
      }
      const line = {
        points,
        pointCount,
        currentPos: 0,
      } as Line;
      this.lines.push(line);
    });
  }
  // 创建点
  createPoints() {
    if (this.points) {
      this.scene.remove(this.points);
      this.points = null;
    }
    this.activePointCount = this.lines.length * this.params.activePointPerLine;
    // const geometry = new THREE.PlaneBufferGeometry(1, 1, 10, 10);
    const geometry = new THREE.BufferGeometry();
    const lineCoords = this.lines.map((line) =>
      line.points.map((point) => [point.x, point.y, point.z])
    );
    const pointCoords = lineCoords.flat(1).slice(0, this.activePointCount);
    const positions = new Float32Array(pointCoords.flat(1) as []);
    this.positions = positions;
    const opacitys = new Float32Array(positions.length).map(
      () => Math.random() / this.params.opacityRate
    );
    this.opacitys = opacitys;
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aOpacity", new THREE.BufferAttribute(opacitys, 1));
    this.geometry = geometry;
    const material = new THREE.ShaderMaterial({
      vertexShader: travellingParticlesVertexShader,
      fragmentShader: travellingParticlesFragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: true,
      depthWrite: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: {
          value: new THREE.Color(this.params.pointColor),
        },
      },
    });
    this.material = material;
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.points = points;
  }
  // 动画
  update() {
    if (this.points) {
      let activePoint = 0;
      this.lines.forEach((line) => {
        // 使线的前n个点动起来
        line.currentPos += this.params.pointSpeed;
        line.currentPos = line.currentPos % line.pointCount;
        for (let i = 0; i < this.params.activePointPerLine; i++) {
          const currentIndex = (line.currentPos + i) % line.pointCount;
          const point = line.points[currentIndex];
          if (point) {
            const { x, y, z } = point;
            this.positions.set([x, y, z], activePoint * 3);
            this.opacitys.set(
              [
                i /
                  (this.params.activePointPerLine *
                    this.params.opacityRate *
                    2),
              ],
              activePoint
            );
            activePoint++;
          }
        }
      });
      this.geometry.attributes.position.needsUpdate = true;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    gui
      .add(this.params, "opacityRate")
      .min(5)
      .max(10)
      .step(0.1)
      .onFinishChange(() => {
        this.createPoints();
      });
    gui.addColor(this.params, "pointColor").onChange(() => {
      this.material.uniforms.uColor.value.set(this.params.pointColor);
    });
  }
}

export default TravellingParticles;
