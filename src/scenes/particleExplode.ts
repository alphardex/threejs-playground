import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import particleExplodeVertexShader from "../shaders/particleExplode/vertex.glsl";
// @ts-ignore
import particleExplodeFragmentShader from "../shaders/particleExplode/fragment.glsl";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { DOMMeshObject, preloadImages } from "@/utils/dom";
import gsap from "gsap";

class ParticleExplode extends Base {
  clock!: THREE.Clock;
  particleExplodeMaterial!: THREE.ShaderMaterial;
  params!: any;
  bloomPass!: UnrealBloomPass;
  imageDOMMeshObj!: DOMMeshObject;
  image!: Element;
  isOpen!: boolean;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1500);
    const fov = this.getScreenFov();
    this.perspectiveCameraParams = {
      fov,
      near: 0.1,
      far: 5000,
    };
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
    this.createPoints();
    this.createPostprocessingEffect();
    this.createClickEffect();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 获取跟屏幕同像素的fov角度
  getScreenFov() {
    return ky.rad2deg(
      2 * Math.atan(window.innerHeight / 2 / this.cameraPosition.z)
    );
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
  createPoints() {
    const image = document.querySelector("img")!;
    this.image = image;
    const texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    const material = this.particleExplodeMaterial.clone();
    material.uniforms.uTexture.value = texture;
    const imageDOMMeshObj = new DOMMeshObject(
      image,
      this.scene,
      material,
      true
    );
    imageDOMMeshObj.setPosition();
    this.imageDOMMeshObj = imageDOMMeshObj;
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
    const material = this.imageDOMMeshObj.mesh.material as any;
    const image = this.image;
    image.addEventListener("click", () => {
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
    const mousePos = this.mousePos;
    if (this.imageDOMMeshObj) {
      const material = this.imageDOMMeshObj.mesh.material as any;
      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uMouse.value = mousePos;
    }
    this.bloomPass.strength = this.params.bloomStrength;
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    const material = this.imageDOMMeshObj.mesh.material as any;
    const uniforms = material.uniforms;
    const params = this.params;
    gui
      .add(uniforms.uProgress, "value")
      .min(0)
      .max(3)
      .step(0.01)
      .name("progress");
    gui
      .add(params, "bloomStrength")
      .min(0)
      .max(10)
      .step(0.01);
  }
}

export default ParticleExplode;
