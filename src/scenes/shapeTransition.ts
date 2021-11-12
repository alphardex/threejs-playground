import * as THREE from "three";
import { Base } from "@/commons/base";
import shapeTransitionVertexShader from "../shaders/shapeTransition/vertex.glsl";
import shapeTransitionFragmentShader from "../shaders/shapeTransition/fragment.glsl";
import { array2Point, TAU } from "@/utils/math";

class ShapeTransition extends Base {
  clock!: THREE.Clock;
  shapeTransitionGeometry!: THREE.BufferGeometry;
  shapeTransitionMaterial!: THREE.ShaderMaterial;
  materials!: THREE.ShaderMaterial[];
  params!: any;
  configs!: any;
  angles!: any;
  jitter!: any;
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
      circleCount2: 5,
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
    const pointCount = this.params.pointCount;
    const angles = Array.from(
      { length: pointCount },
      () => TAU * Math.random()
    );
    this.angles = angles;
    const jitter = Array.from({ length: pointCount }, () => Math.random());
    this.jitter = jitter;
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
    this.mouseTracker.trackMousePos();
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
      return [{ x: 0, y: 0 }];
    }
    let centers = [];
    for (let i = 0; i < N; i++) {
      const angle = (i * TAU) / N;
      const x = radius * Math.sin(angle);
      const y = radius * Math.cos(angle);
      const center = { x, y };
      centers.push(center);
    }
    return centers;
  }
  // 创建点数组
  createPoints(centers, radius, multiplier) {
    const pointCount = this.params.pointCount;
    let points = [];
    for (let i = 0; i < pointCount; i++) {
      const angle = this.angles[i];
      const offsetX = radius * Math.sin(multiplier * angle);
      const offsetY = radius * Math.cos(multiplier * angle);
      const center = centers[i % centers.length];
      const x = center.x + offsetX;
      const y = center.y + offsetY;
      points.push(x, y, 0);
    }
    return points;
  }
  // 创建几何体
  createShapeTransitionGeometry() {
    const geometry = new THREE.BufferGeometry();

    const params = this.params;

    // shape1
    const centers1 = this.circleCenters(params.radius1, params.circleCount1);
    const points1 = this.createPoints(
      centers1,
      params.radius1,
      params.multiplier1
    );
    const shape1Position = new Float32Array(points1);
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(shape1Position, 3)
    );

    // shape2
    const centers2 = this.circleCenters(params.radius2, params.circleCount2);
    const points2 = this.createPoints(
      centers2,
      params.radius2,
      params.multiplier2
    );
    const shape2Position = new Float32Array(points2);
    geometry.setAttribute(
      "aPositionShape2",
      new THREE.BufferAttribute(shape2Position, 3)
    );

    // jitter
    const jitterPosition = new Float32Array(this.jitter);
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
    const mousePos = this.mouseTracker.mousePos;
    this.materials.forEach((material) => {
      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uMouse.value = mousePos;
    });
  }
}

export default ShapeTransition;
