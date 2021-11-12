import * as THREE from "three";
import { Maku, getScreenFov } from "maku.js";
import gsap from "gsap";
import * as dat from "dat.gui";
import { Base } from "@/commons/base";
import particleExplodeVertexShader from "../shaders/particleExplode/vertex.glsl";
import particleExplodeFragmentShader from "../shaders/particleExplode/fragment.glsl";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { preloadImages } from "@/utils/dom";

class ParticleExplode extends Base {
  clock!: THREE.Clock;
  particleExplodeMaterial!: THREE.ShaderMaterial;
  params!: any;
  bloomPass!: UnrealBloomPass;
  image!: HTMLImageElement;
  maku!: Maku;
  isOpen!: boolean;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1500);
    const fov = getScreenFov(this.cameraPosition.z);
    this.perspectiveCameraParams = {
      fov,
      near: 0.1,
      far: 5000,
    };
    this.image = document.querySelector("img")!;
    this.params = {
      exposure: 1,
      bloomStrength: 0,
      bloomThreshold: 0,
      bloomRadius: 0,
    };
    this.isOpen = false;
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createParticleExplodeMaterial();
    await preloadImages();
    this.createMaku();
    this.createPostprocessingEffect();
    this.createClickEffect();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    // this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createParticleExplodeMaterial() {
    const particleExplodeMaterial = new THREE.ShaderMaterial({
      vertexShader: particleExplodeVertexShader,
      fragmentShader: particleExplodeFragmentShader,
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
        uProgress: {
          value: 0,
        },
        uTexture: {
          value: null,
        },
      },
    });
    this.particleExplodeMaterial = particleExplodeMaterial;
  }
  // 创建点
  createMaku() {
    const { image, particleExplodeMaterial, scene } = this;
    const maku = new Maku(
      image,
      particleExplodeMaterial,
      scene,
      "points",
      "size",
      {
        width: 128,
        height: 128,
      }
    );
    maku.setPosition();
    this.maku = maku;
  }
  // 创建后期特效
  createPostprocessingEffect() {
    const renderScene = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = this.params.bloomThreshold;
    bloomPass.strength = this.params.bloomStrength;
    bloomPass.radius = this.params.bloomRadius;
    this.bloomPass = bloomPass;
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(bloomPass);
  }
  // 创建点击效果
  createClickEffect() {
    const material = this.maku.mesh.material as any;
    this.maku.el.addEventListener("click", () => {
      if (!this.isOpen) {
        gsap.to(material.uniforms.uProgress, {
          value: 3,
          duration: 1,
        });
        this.isOpen = true;
      } else {
        gsap.to(material.uniforms.uProgress, {
          value: 0,
          duration: 1,
        });
        this.isOpen = false;
      }
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.maku) {
      const material = this.maku.mesh.material as any;
      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uMouse.value = mousePos;
    }
    this.bloomPass.strength = this.params.bloomStrength;
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    const material = this.maku.mesh.material as any;
    const uniforms = material.uniforms;
    const params = this.params;
    gui
      .add(uniforms.uProgress, "value")
      .min(0)
      .max(3)
      .step(0.01)
      .name("progress");
    gui.add(params, "bloomStrength").min(0).max(10).step(0.01);
  }
}

export default ParticleExplode;
