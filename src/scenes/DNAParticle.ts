import * as THREE from "three";
import { Base } from "@/commons/base";
import vertexShader from "../shaders/DNAParticle/vertex.glsl";
import fragmentShader from "../shaders/DNAParticle/fragment.glsl";
import { flatModel, loadModel, printModel } from "@/utils/loader";
import { DNAModelUrl } from "@/consts/DNAParticle";

class DNAParticle extends Base {
  clock: THREE.Clock;
  modelParts: THREE.Object3D[];
  points: THREE.Points;
  params: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 5);
    this.perspectiveCameraParams = {
      fov: 60,
      near: 0.1,
      far: 100,
    };
    this.params = {
      color1: "#612574",
      color2: "#293583",
      color3: "#1954ec",
      size: 15,
      gradMaskTop: 0.41,
      gradMaskBottom: 0.72,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createShaderMaterial();
    await this.createDNA();
    this.createPoints();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createShaderMaterial() {
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
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
        uColor1: {
          value: new THREE.Color(this.params.color1),
        },
        uColor2: {
          value: new THREE.Color(this.params.color2),
        },
        uColor3: {
          value: new THREE.Color(this.params.color3),
        },
        uSize: {
          value: this.params.size,
        },
        uGradMaskTop: {
          value: this.params.gradMaskTop,
        },
        uGradMaskBottom: {
          value: this.params.gradMaskBottom,
        },
      },
    });
    this.shaderMaterial = shaderMaterial;
  }
  // 创建DNA
  async createDNA() {
    const model = await loadModel(DNAModelUrl);
    const modelParts = flatModel(model);
    printModel(modelParts);
    this.modelParts = modelParts;
  }
  // 创建点阵
  createPoints() {
    const { modelParts } = this;
    const twist1_1 = modelParts[1] as THREE.Mesh;
    const geometry = twist1_1.geometry;
    geometry.center();
    // const geometry = new THREE.SphereBufferGeometry(1, 64, 64);
    const material = this.shaderMaterial;
    const points = new THREE.Points(geometry, material);
    points.position.y = -3;
    this.points = points;
    this.scene.add(points);
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.shaderMaterial) {
      this.shaderMaterial.uniforms.uTime.value = elapsedTime;
      this.shaderMaterial.uniforms.uMouse.value = mousePos;
    }
    if (this.points) {
      this.points.rotation.y = elapsedTime * 0.1;
    }
  }
}

export default DNAParticle;
