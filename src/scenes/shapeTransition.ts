import * as THREE from "three";
import { Base } from "./base";
// @ts-ignore
import shapeTransitionVertexShader from "../shaders/shapeTransition/vertex.glsl";
// @ts-ignore
import shapeTransitionFragmentShader from "../shaders/shapeTransition/fragment.glsl";
import { array2Point, TAU } from "@/utils/math";

class ShapeTransition extends Base {
  clock!: THREE.Clock;
  shapeTransitionGeometry!: THREE.BufferGeometry;
  shapeTransitionMaterial!: THREE.ShaderMaterial;
  materials!: THREE.ShaderMaterial[];
  params!: any;
  configs!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1.2);
    this.materials = [];
    this.params = {
      pointCount: 100000,
      radius1: 0.9,
      radius2: 0.4,
      circleCount1: 1,
      multiplier1: 1,
      circleCount2: 6,
      multiplier2: 4,
      chromaticBlur: 0.1,
    };
    const chromaticBlur = this.params.chromaticBlur * 0.1;
    this.configs = [
      { color: [0.0, 0.1, 0.9], chromaticBlur: 0 },
      { color: [0.0, 0.3, 0.5], chromaticBlur: chromaticBlur },
      { color: [0.1, 0.7, 0.1], chromaticBlur: 2 * chromaticBlur },
      { color: [0.5, 0.3, 0.0], chromaticBlur: 3 * chromaticBlur },
      { color: [0.9, 0.1, 0.0], chromaticBlur: 4 * chromaticBlur },
    ];
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createShapeTransitionGeometry();
    this.createShapeTransitionMaterial();
    this.createShapes();
    this.createLight();
    this.createOrbitControls();
    this.trackMousePos();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createShapeTransitionMaterial() {
    const shapeTransitionMaterial = new THREE.ShaderMaterial({
      vertexShader: shapeTransitionVertexShader,
      fragmentShader: shapeTransitionFragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      uniforms: {
        uTime: {
          value: 0,
        },
        uMouse: {
          value: new THREE.Vector2(0, 0),
        },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uColor: {
          value: new THREE.Color("#ffffff"),
        },
        uChromaticBlur: {
          value: 0,
        },
      },
    });
    this.shapeTransitionMaterial = shapeTransitionMaterial;
  }
  // 创建圆心
  circleCenters(radius, N) {
    if (N === 1) {
      return [[0, 0]];
    }
    let centers = [];
    for (let i = 0; i < N; i++) {
      let angle = ((i % N) * TAU) / N;
      centers.push([radius * Math.sin(angle), radius * Math.cos(angle)]);
    }
    return centers;
  }
  // 创建点数组
  createPoints(centers, radius, multiplier) {
    const pointCount = this.params.pointCount;
    const angles = Array.from(
      { length: pointCount },
      () => TAU * Math.random()
    );
    let points = [];
    for (let i = 0; i < pointCount; i++) {
      let angle = angles[i];
      let center = centers[i % centers.length];
      points.push(
        center[0] + radius * Math.sin(multiplier * angle),
        center[1] + radius * Math.cos(multiplier * angle),
        0
      );
    }
    return points;
  }
  // 创建几何体
  createShapeTransitionGeometry() {
    const geometry = new THREE.BufferGeometry();

    const params = this.params;
    let r1 = params.circleCount1 === 1 ? params.radius1 : params.radius2;
    let r2 = params.circleCount2 === 1 ? params.radius1 : params.radius2;

    // shape1
    const points1 = this.createPoints(
      this.circleCenters(r1, params.circleCount1),
      r1,
      params.multiplier1
    );
    const shape1Position = new Float32Array(points1);
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(shape1Position, 3)
    );

    // shape2
    const points2 = this.createPoints(
      this.circleCenters(r2, params.circleCount2),
      r2,
      params.multiplier2
    );
    const shape2Position = new Float32Array(points2);
    geometry.setAttribute(
      "aPositionShape2",
      new THREE.BufferAttribute(shape2Position, 3)
    );

    // jitter
    const jitter = Array.from({ length: params.pointCount }, () =>
      Math.random()
    );
    const jitterPosition = new Float32Array(jitter);
    geometry.setAttribute(
      "aJitter",
      new THREE.BufferAttribute(jitterPosition, 3)
    );

    this.shapeTransitionGeometry = geometry;
  }
  // 创建形状
  createShape({ color = [0.0, 0.1, 0.9], chromaticBlur = 0 }) {
    const geometry = this.shapeTransitionGeometry;
    const material = this.shapeTransitionMaterial;
    const materialClone = material.clone();
    materialClone.uniforms.uColor.value = array2Point(color);
    materialClone.uniforms.uChromaticBlur.value = chromaticBlur;
    this.materials.push(materialClone);
    const shape = new THREE.Points(geometry, materialClone);
    this.scene.add(shape);
  }
  // 创建多个形状
  createShapes() {
    const configs = this.configs;
    configs.forEach((config) => {
      this.createShape(config);
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    this.materials.forEach((material) => {
      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uMouse.value = mousePos;
    });
  }
}

export default ShapeTransition;
