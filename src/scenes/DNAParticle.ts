import * as THREE from "three";
import * as dat from "dat.gui";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { Base } from "@/commons/base";
import mainVertexShader from "../shaders/DNAParticle/main/vertex.glsl";
import mainFragmentShader from "../shaders/DNAParticle/main/fragment.glsl";
import caVertexShader from "../shaders/DNAParticle/ca/vertex.glsl";
import caFragmentShader from "../shaders/DNAParticle/ca/fragment.glsl";
import { flatModel, loadModel, printModel } from "@/utils/loader";
import { DNAModelUrl } from "@/consts/DNAParticle";
import { hyperbolicHelicoidFunction, sphubeFunction } from "@/utils/parametric";

class DNAParticle extends Base {
  clock: THREE.Clock;
  DNAMaterial: THREE.ShaderMaterial;
  modelParts: THREE.Object3D[];
  points: THREE.Points;
  bloomPass!: UnrealBloomPass;
  caPass!: ShaderPass;
  params: any;
  bloomParams: any;
  caParams: any;
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
      // gradMaskTop: 0.41,
      // gradMaskBottom: 0.72,
      gradMaskTop: 0,
      gradMaskBottom: 0,
    };
    this.bloomParams = {
      bloomStrength: 1.4,
      bloomRadius: 0.87,
      bloomThreshold: 0.23,
    };
    this.caParams = {
      CAMaxDistortion: 0.25,
      CASize: 0.58,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createDNAMaterial();
    // this.createSphere();
    // this.createSpiral();
    // this.createSphube();
    await this.loadDNAModel();
    this.createDNA();
    this.createLight();
    this.createPostprocessingEffect();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createDNAMaterial() {
    const DNAMaterial = new THREE.ShaderMaterial({
      vertexShader: mainVertexShader,
      fragmentShader: mainFragmentShader,
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
    this.DNAMaterial = DNAMaterial;
  }
  // 创建球体
  createSphere() {
    const geometry = new THREE.SphereBufferGeometry(2, 64, 64);
    const material = this.DNAMaterial;
    const points = new THREE.Points(geometry, material);
    this.points = points;
    this.scene.add(points);
  }
  // 创建螺旋体
  createSpiral() {
    const geometry = new ParametricGeometry(hyperbolicHelicoidFunction, 64, 64);
    const material = this.DNAMaterial;
    const points = new THREE.Points(geometry, material);
    this.points = points;
    this.scene.add(points);
  }
  // 创建Sphube
  createSphube() {
    const geometry = new ParametricGeometry(sphubeFunction, 64, 64);
    const material = this.DNAMaterial;
    const points = new THREE.Points(geometry, material);
    this.points = points;
    this.scene.add(points);
  }
  // 加载DNA模型
  async loadDNAModel() {
    const model = await loadModel(DNAModelUrl);
    const modelParts = flatModel(model);
    printModel(modelParts);
    this.modelParts = modelParts;
  }
  // 创建DNA
  createDNA() {
    const { modelParts } = this;
    const twist1_1 = modelParts[1] as THREE.Mesh;
    const geometry = twist1_1.geometry;
    geometry.center();
    const material = this.DNAMaterial;
    const points = new THREE.Points(geometry, material);
    points.position.y = -3;
    this.points = points;
    this.scene.add(points);
  }
  // 创建后期特效
  createPostprocessingEffect() {
    const composer = new EffectComposer(this.renderer);
    this.composer = composer;

    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    // unreal bloom
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.4,
      0.87,
      0.23
    );
    bloomPass.strength = this.bloomParams.bloomStrength;
    bloomPass.radius = this.bloomParams.bloomRadius;
    bloomPass.threshold = this.bloomParams.bloomThreshold;
    composer.addPass(bloomPass);
    this.bloomPass = bloomPass;

    // CA
    const caPass = new ShaderPass({
      vertexShader: caVertexShader,
      fragmentShader: caFragmentShader,
      uniforms: {
        tDiffuse: {
          value: null,
        },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uCAMaxDistortion: {
          value: this.caParams.CAMaxDistortion,
        },
        uCASize: {
          value: this.caParams.CASize,
        },
      },
    });
    caPass.renderToScreen = true;
    composer.addPass(caPass);
    this.caPass = caPass;
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.DNAMaterial) {
      this.DNAMaterial.uniforms.uTime.value = elapsedTime;
      this.DNAMaterial.uniforms.uMouse.value = mousePos;
    }
    if (this.points) {
      this.points.rotation.y = elapsedTime * 0.1;
    }
    if (this.bloomPass) {
      this.bloomPass.strength = this.bloomParams.bloomStrength;
      this.bloomPass.radius = this.bloomParams.bloomRadius;
      this.bloomPass.threshold = this.bloomParams.bloomThreshold;
    }
    if (this.caPass) {
      this.caPass.uniforms.uCAMaxDistortion.value =
        this.caParams.CAMaxDistortion;
      this.caPass.uniforms.uCASize.value = this.caParams.CASize;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI({ width: 300 });
    const { params, bloomParams, caParams } = this;
    const uniforms = this.DNAMaterial.uniforms;
    gui.addColor(params, "color1").onFinishChange((value) => {
      uniforms.uColor1.value.set(value);
    });
    gui.addColor(params, "color2").onFinishChange((value) => {
      uniforms.uColor2.value.set(value);
    });
    gui.addColor(params, "color3").onFinishChange((value) => {
      uniforms.uColor3.value.set(value);
    });
    gui.add(uniforms.uSize, "value").min(0).max(50).step(0.01).name("size");
    gui
      .add(uniforms.uGradMaskTop, "value")
      .min(0)
      .max(1)
      .step(0.01)
      .name("gradMaskTop");
    gui
      .add(uniforms.uGradMaskBottom, "value")
      .min(0)
      .max(1)
      .step(0.01)
      .name("gradMaskBottom");
    gui.add(bloomParams, "bloomStrength").min(0).max(10).step(0.01);
    gui.add(bloomParams, "bloomRadius").min(0).max(10).step(0.01);
    gui.add(bloomParams, "bloomThreshold").min(0).max(10).step(0.01);
    gui.add(caParams, "CAMaxDistortion").min(0).max(10).step(0.01);
    gui.add(caParams, "CASize").min(0).max(10).step(0.01);
  }
}

export default DNAParticle;
