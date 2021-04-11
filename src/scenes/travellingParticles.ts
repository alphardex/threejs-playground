import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import travellingParticlesVertexShader from "../shaders/travellingParticles/vertex.glsl";
// @ts-ignore
import travellingParticlesFragmentShader from "../shaders/travellingParticles/fragment.glsl";
import { getPointsInPath } from "@/utils/dom";

interface Line {
  points: THREE.Vector3[];
  pointCount: number;
  currentPos: number;
}

interface Params {
  mapOffsetX: number;
  mapOffsetY: number;
  activePointPerLine: number;
  opacityRate: number;
  pointSize: number;
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
  map!: THREE.Mesh;
  params!: Params;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.perspectiveCameraParams.near = 100;
    this.perspectiveCameraParams.far = 1000;
    this.cameraPosition = new THREE.Vector3(0, 0, 600);
    this.lines = [];
    this.pointSize = 4;
    this.activePointCount = 0;
    this.params = {
      mapOffsetX: -80,
      mapOffsetY: 160,
      activePointPerLine: 100,
      opacityRate: 15,
      pointSize: 30000,
      pointSpeed: 1,
      pointColor: "#4ec0e9",
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createEverything();
    this.createLight();
    this.createOrbitControls();
    // this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建一切
  createEverything() {
    if (this.map) {
      this.scene.remove(this.map);
    }
    this.lines = [];
    if (this.points) {
      this.scene.remove(this.points);
      this.points = null;
    }
    this.getSvgPathsPointLineData();
    this.createPoints();
  }
  // 获取svg路径的点线数据
  getSvgPathsPointLineData() {
    const paths = ([
      ...document.querySelectorAll(".svg-particles path"),
    ] as unknown) as SVGPathElement[];
    paths.forEach((path) => {
      const points: THREE.Vector3[] = [];
      const pathPoints = getPointsInPath(path, this.pointSize);
      pathPoints.forEach((point) => {
        let { x, y } = point;
        // 使点在屏幕正中央
        x -= this.params.mapOffsetX;
        y -= this.params.mapOffsetY;
        // 加点随机性
        const randX = ky.randomNumberInRange(-1.5, 1.5);
        const randY = ky.randomNumberInRange(-1.5, 1.5);
        x += randX;
        y += randY;
        points.push(new THREE.Vector3(x, y, 0));
      });
      const line = {
        points,
        pointCount: points.length,
        currentPos: 0,
      } as Line;
      this.lines.push(line);
    });
  }
  // 创建点
  createPoints() {
    this.activePointCount = this.lines.length * this.params.activePointPerLine;
    const geometry = new THREE.BufferGeometry();
    const pointCoords = this.lines
      .map((line) => line.points.map((point) => [point.x, point.y, point.z]))
      .flat(1)
      .slice(0, this.activePointCount)
      .flat(1);
    const positions = new Float32Array(pointCoords);
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
        uSize: {
          value: this.params.pointSize,
        },
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
        for (let i = 0; i < this.params.activePointPerLine; i++) {
          const currentIndex = (line.currentPos + i) % line.pointCount;
          // 将数据同步到着色器上
          const point = line.points[currentIndex];
          if (point) {
            const { x, y, z } = point;
            this.positions.set([x, y, z], activePoint * 3);
            this.opacitys.set(
              [i / (this.params.activePointPerLine * this.params.opacityRate)],
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
      .min(10)
      .max(20)
      .step(0.1)
      .onFinishChange(() => {
        this.createEverything();
      });
    gui
      .add(this.material.uniforms.uSize, "value")
      .min(0)
      .max(100000)
      .step(1)
      .name("pointSize");
    gui.addColor(this.params, "pointColor").onChange(() => {
      this.material.uniforms.uColor.value.set(this.params.pointColor);
    });
  }
}

export default TravellingParticles;
