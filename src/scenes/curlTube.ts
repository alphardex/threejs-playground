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
  mousePosOnPlane!: THREE.Vector3;
  mouseSpot!: THREE.Mesh;
  colorParams!: any;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1.2);
    this.colorParams = {
      // palette: https://colorhunt.co/palette/167893
      planeColor: "#1b262c",
      tubeColor: "#3282b8",
      spotLightColor: "#3282b8",
      spotShapeColor: "#ffffff",
    };
    this.params = {
      tubeCount: 300,
      tubePointCount: 600,
      tubePointScale: 1,
      scatterDivider: 150,
      scatterPow: 0.6,
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
    this.createScatterMaterial();
    this.createTubeMaterial();
    this.createTubeGroup({});
    this.createPlaneScene();
    this.createPlaneMaterial();
    this.createPlane();
    this.createRaycaster();
    this.trackMouseOnPlane();
    // this.createSpot();
    // this.createOrbitControls();
    // this.createDebugPanel();
    this.createLight();
    this.addListeners();
    this.setLoop();
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
        uScatterPow: {
          value: this.params.scatterPow,
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
  // 创建曲线
  createCurve({
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
    return curve;
  }
  // 创建管道
  createTube(
    curveConfig = {
      startPoint: new THREE.Vector3(0, 0, 0),
      pointCount: 600,
      pointScale: 1,
    }
  ) {
    const curve = this.createCurve(curveConfig);
    const geometry = new THREE.TubeBufferGeometry(curve, 600, 0.005, 8);
    const material = this.tubeMaterial;
    const mesh = this.createMesh({
      geometry,
      material,
    });
    return mesh;
  }
  // 创建管道群
  createTubeGroup({ tubeCount = this.params.tubeCount }) {
    const tubeGroup = new THREE.Group();
    for (let i = 0; i < tubeCount; i++) {
      const mesh = this.createTube({
        startPoint: new THREE.Vector3(
          ky.randomNumberInRange(-0.5, 0.5),
          ky.randomNumberInRange(-0.5, 0.5),
          ky.randomNumberInRange(-0.5, 0.5)
        ),
        pointCount: this.params.tubePointCount,
        pointScale: this.params.tubePointScale,
      });
      tubeGroup.add(mesh);
    }
    this.scene.add(tubeGroup);
  }
  // 创建平面场景，作为底层的渲染
  createPlaneScene() {
    this.renderer.autoClear = false;
    const planeScene = new THREE.Scene();
    this.planeScene = planeScene;
  }
  // 创建平面材质
  createPlaneMaterial() {
    const planeMaterial = this.scatterMaterial.clone();
    planeMaterial.uniforms.uScatterDivider.value = this.params.planeScatterDivider;
    planeMaterial.uniforms.uIsPlane.value = 1;
    this.planeMaterial = planeMaterial;
  }
  // 创建平面
  createPlane() {
    const planeGeometry = new THREE.PlaneBufferGeometry(100, 100);
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
  // 追踪鼠标在平面上的位置
  trackMouseOnPlane() {
    window.addEventListener("mousemove", (e) => {
      const target = this.onChooseIntersect(this.plane, this.planeScene);
      if (target) {
        this.mousePosOnPlane = target.point;
      }
    });
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
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    if (this.tubeMaterial) {
      this.tubeMaterial.uniforms.uTime.value = elapsedTime;
    }
    if (this.tubeMaterial && this.planeMaterial && this.mousePosOnPlane) {
      this.tubeMaterial.uniforms.uSpotLight.value = this.mousePosOnPlane;
      this.planeMaterial.uniforms.uSpotLight.value = this.mousePosOnPlane;
    }
    if (this.mouseSpot && this.mousePosOnPlane) {
      this.mouseSpot.position.copy(this.mousePosOnPlane);
    }
    if (this.mousePosOnPlane) {
      this.scene.rotation.x = this.mousePosOnPlane.y / 4;
      this.scene.rotation.y = this.mousePosOnPlane.x / 4;
    }
    this.renderPlaneScene();
  }
  // 先渲染平面层，再渲染主层，使两者叠加
  renderPlaneScene() {
    if (this.planeScene) {
      this.renderer.clear();
      this.renderer.render(this.planeScene, this.camera);
      this.renderer.clearDepth();
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI({ width: 300 });
    const tubeUniforms = this.tubeMaterial.uniforms;
    const planeUniforms = this.planeMaterial.uniforms;
    gui.addColor(this.colorParams, "planeColor").onFinishChange((value) => {
      planeUniforms.uPlaneColor.value.set(value);
    });
    gui.addColor(this.colorParams, "tubeColor").onFinishChange((value) => {
      tubeUniforms.uTubeColor.value.set(value);
    });
    gui.addColor(this.colorParams, "spotLightColor").onFinishChange((value) => {
      planeUniforms.uSpotColor.value.set(value);
    });
  }
}

export default CurlTube;
