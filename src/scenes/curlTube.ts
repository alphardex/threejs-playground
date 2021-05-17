import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import curlTubeVertexShader from "../shaders/curlTube/vertex.glsl";
// @ts-ignore
import curlTubeFragmentShader from "../shaders/curlTube/fragment.glsl";
import { computeCurl } from "@/utils/math";

class CurlTube extends Base {
  clock!: THREE.Clock;
  planeScene!: THREE.Scene;
  scatterMaterial!: THREE.ShaderMaterial;
  tubeMaterial!: THREE.ShaderMaterial;
  planeMaterial!: THREE.ShaderMaterial;
  plane!: THREE.Mesh;
  mouseSpot!: THREE.Mesh;
  colorParams!: any;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 3);
    this.colorParams = {
      planeColor: "#250E2F",
      tubeColor: "#ff0000",
      spotShapeColor: "#ffffff",
      spotLightColor: "#ff0000",
    };
    this.params = {
      tubeCount: 240,
      tubePointCount: 600,
      tubePointScale: 1,
      scatterDivider: 150,
      planeScatterDivider: 150,
      tubeScatterDivider: 15,
      velocity: 0.5,
      tubeThreshold: 0.3,
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createPlaneScene();
    this.createScatterMaterial();
    this.createTubeMaterial();
    this.createPlaneMaterial();
    this.createTubes({});
    this.createRaycaster();
    this.createRaycastPlane();
    this.createSpot();
    this.trackMouseOnPlane();
    this.createLight();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建平面场景，作为底层的渲染
  createPlaneScene() {
    this.renderer.autoClear = false;
    const planeScene = new THREE.Scene();
    this.planeScene = planeScene;
  }
  // 创建散射材质
  createScatterMaterial() {
    const scatterMaterial = new THREE.ShaderMaterial({
      vertexShader: curlTubeVertexShader,
      fragmentShader: curlTubeFragmentShader,
      side: THREE.DoubleSide,
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
        uSpotLight: {
          value: new THREE.Vector3(0, 0, 0),
        },
        uScatterDivider: {
          value: this.params.scatterDivider,
        },
        uIsTube: {
          value: 0,
        },
        uIsPlane: {
          value: 0,
        },
        uPlaneColor: {
          value: new THREE.Color(this.colorParams.planeColor),
        },
        uTubeColor: {
          value: new THREE.Color(this.colorParams.tubeColor),
        },
        uSpotColor: {
          value: new THREE.Color(this.colorParams.spotLightColor),
        },
        uVelocity: {
          value: this.params.velocity,
        },
        uTubeThreshold: {
          value: this.params.tubeThreshold,
        },
      },
    });
    this.scatterMaterial = scatterMaterial;
  }
  // 创建管道材质
  createTubeMaterial() {
    const tubeMaterial = this.scatterMaterial.clone();
    tubeMaterial.uniforms.uScatterDivider.value = this.params.tubeScatterDivider;
    tubeMaterial.uniforms.uIsTube.value = 1;
    this.tubeMaterial = tubeMaterial;
  }
  // 创建平面材质
  createPlaneMaterial() {
    const planeMaterial = this.scatterMaterial.clone();
    planeMaterial.uniforms.uScatterDivider.value = this.params.planeScatterDivider;
    planeMaterial.uniforms.uIsPlane.value = 1;
    this.planeMaterial = planeMaterial;
  }
  // 创建管道
  createTube({
    startPoint = new THREE.Vector3(0, 0, 0),
    pointCount = 600,
    pointScale = 1,
  }) {
    const currentPoint = startPoint.clone();
    const points = [...ky.range(0, pointCount)].map((item) => {
      const noise = computeCurl(
        currentPoint.x * pointScale,
        currentPoint.y * pointScale,
        currentPoint.z * pointScale
      );
      currentPoint.addScaledVector(noise, 0.001);
      return currentPoint.clone();
    });
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeBufferGeometry(curve, 600, 0.005, 8);
    const material = this.tubeMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 创建管道群
  createTubes({
    tubeCount = this.params.tubeCount,
    tubePointCount = this.params.tubePointCount,
    tubePointScale = this.params.tubePointScale,
  }) {
    for (let i = 0; i < tubeCount; i++) {
      this.createTube({
        startPoint: new THREE.Vector3(
          ky.randomNumberInRange(-0.5, 0.5),
          ky.randomNumberInRange(-0.5, 0.5),
          ky.randomNumberInRange(-0.5, 0.5)
        ),
        pointCount: tubePointCount,
        pointScale: tubePointScale,
      });
    }
  }
  // 创建追踪平面
  createRaycastPlane() {
    const planeGeometry = new THREE.PlaneBufferGeometry(20, 20);
    const planeMaterial = this.planeMaterial;
    const plane = this.createMesh(
      {
        geometry: planeGeometry,
        material: planeMaterial,
      },
      this.planeScene
    );
    this.plane = plane;
  }
  // 创建追踪光点
  createSpot() {
    const spotGeometry = new THREE.SphereBufferGeometry(0.02, 24, 24);
    const spotMaterial = new THREE.MeshBasicMaterial({
      color: this.colorParams.spotShapeColor,
    });
    const spot = this.createMesh({
      geometry: spotGeometry,
      material: spotMaterial,
    });
    this.mouseSpot = spot;
  }
  // 追踪鼠标在平面上的位置
  trackMouseOnPlane() {
    window.addEventListener("mousemove", () => {
      const target = this.onChooseIntersect(this.plane, this.planeScene);
      if (target) {
        const targetPos = target.point;
        this.mouseSpot.position.copy(targetPos);
      }
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    if (this.scatterMaterial) {
      this.tubeMaterial.uniforms.uTime.value = elapsedTime;
      this.tubeMaterial.uniforms.uSpotLight.value = this.mouseSpot.position;
      this.planeMaterial.uniforms.uSpotLight.value = this.mouseSpot.position;
    }
    this.renderPlaneScene();
  }
  // 先渲染平面层，再渲染主层，使两者叠加
  renderPlaneScene() {
    this.renderer.clear();
    this.renderer.render(this.planeScene, this.camera);
    this.renderer.clearDepth();
  }
}

export default CurlTube;
