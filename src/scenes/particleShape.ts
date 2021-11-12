import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "@/commons/base";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import particleShapeVertexShader from "../shaders/particleShape/vertex.glsl";
import particleShapeFragmentShader from "../shaders/particleShape/fragment.glsl";

class ParticleShape extends Base {
  clock!: THREE.Clock;
  particleShapeMaterial!: THREE.ShaderMaterial;
  params!: any;
  bloomPass!: UnrealBloomPass;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
    this.params = {
      uPointSize: 3,
      uColor1: "#1177d2",
      uColor2: "#344cd2",
      uXVelocity: 0.6,
      uYVelocity: -0.6,
      bloomPass: {
        strength: 1,
        threshold: 0.2,
        radius: 0.4,
      },
      uVelocity: 0.16,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createParticleShapeMaterial();
    await this.createShape();
    this.createPostprocessingEffect();
    this.createLight();
    this.mouseTracker.trackMousePos();
    // this.createDebugPanel();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createParticleShapeMaterial() {
    const particleShapeMaterial = new THREE.ShaderMaterial({
      vertexShader: particleShapeVertexShader,
      fragmentShader: particleShapeFragmentShader,
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
        uPointSize: {
          value: this.params.uPointSize,
        },
        uColor1: {
          value: new THREE.Color(this.params.uColor1),
        },
        uColor2: {
          value: new THREE.Color(this.params.uColor2),
        },
        uXVelocity: {
          value: this.params.uXVelocity,
        },
        uYVelocity: {
          value: this.params.uYVelocity,
        },
        uVelocity: {
          value: this.params.uVelocity,
        },
      },
    });
    this.particleShapeMaterial = particleShapeMaterial;
  }
  // 创建图形
  async createShape() {
    const geometry = new THREE.SphereBufferGeometry(1, 64, 64);
    const material = this.particleShapeMaterial;
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
  }
  // 创建后期特效
  createPostprocessingEffect() {
    const renderScene = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.params.bloomPass.strength,
      this.params.bloomPass.radius,
      this.params.bloomPass.threshold
    );
    this.bloomPass = bloomPass;
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(bloomPass);
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.particleShapeMaterial) {
      this.particleShapeMaterial.uniforms.uTime.value = elapsedTime;
      this.particleShapeMaterial.uniforms.uMouse.value = mousePos;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI({ width: 300 });
    const uniforms = this.particleShapeMaterial.uniforms;
    gui.addColor(this.params, "uColor1").onFinishChange((value) => {
      uniforms.uColor1.value.set(value);
    });
    gui.addColor(this.params, "uColor2").onFinishChange((value) => {
      uniforms.uColor2.value.set(value);
    });
  }
}

export default ParticleShape;
