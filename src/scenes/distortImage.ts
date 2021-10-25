import * as THREE from "three";
import * as dat from "dat.gui";
import ky from "kyouka";
import { Maku, MakuGroup, getScreenFov } from "maku.js";
import { Base } from "@/commons/base";
// @ts-ignore
import distortImageDefaultVertexShader from "../shaders/distortImage/postprocessing/default/vertex.glsl";
// @ts-ignore
import distortImageDefaultFragmentShader from "../shaders/distortImage/postprocessing/default/fragment.glsl";
// @ts-ignore
import distortImageMouseWaveVertexShader from "../shaders/distortImage/main/mousewave/vertex.glsl";
// @ts-ignore
import distortImageMouseWaveFragmentShader from "../shaders/distortImage/main/mousewave/fragment.glsl";
// @ts-ignore
import distortImageScrollVertexShader from "../shaders/distortImage/postprocessing/scroll/vertex.glsl";
// @ts-ignore
import distortImageScrollFragmentShader from "../shaders/distortImage/postprocessing/scroll/fragment.glsl";
// @ts-ignore
import distortImageHoverWaveVertexShader from "../shaders/distortImage/main/hoverwave/vertex.glsl";
// @ts-ignore
import distortImageHoverWaveFragmentShader from "../shaders/distortImage/main/hoverwave/fragment.glsl";
// @ts-ignore
import distortImageNoiseVertexShader from "../shaders/distortImage/postprocessing/noise/vertex.glsl";
// @ts-ignore
import distortImageNoiseFragmentShader from "../shaders/distortImage/postprocessing/noise/fragment.glsl";
// @ts-ignore
import distortImageTwistVertexShader from "../shaders/distortImage/main/twist/vertex.glsl";
// @ts-ignore
import distortImageTwistFragmentShader from "../shaders/distortImage/main/twist/fragment.glsl";
import { preloadImages } from "@/utils/dom";
// @ts-ignore
import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RaycastSelector } from "@/utils/raycast";

class DistortImage extends Base {
  clock!: THREE.Clock;
  images!: HTMLImageElement[];
  makuGroup!: MakuGroup;
  distortImageMaterial!: THREE.ShaderMaterial;
  scroll!: any;
  shaderConfig!: any;
  shaderNames!: string[];
  postprocessingShaderConfig!: any;
  postprocessingShaderNames!: string[];
  params!: any;
  customPass!: ShaderPass;
  scrollSpeed!: number;
  scrollSpeedTarget!: number;
  raycastSelector: RaycastSelector;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 600);
    const fov = getScreenFov(this.cameraPosition.z);
    this.perspectiveCameraParams = {
      fov,
      near: 100,
      far: 2000,
    };
    this.images = [...document.querySelectorAll("img")];
    this.makuGroup = new MakuGroup();
    this.shaderConfig = {
      mousewave: {
        vertexShader: distortImageMouseWaveVertexShader,
        fragmentShader: distortImageMouseWaveFragmentShader,
      },
      hoverwave: {
        vertexShader: distortImageHoverWaveVertexShader,
        fragmentShader: distortImageHoverWaveFragmentShader,
      },
      twist: {
        vertexShader: distortImageTwistVertexShader,
        fragmentShader: distortImageTwistFragmentShader,
      },
    };
    this.shaderNames = Object.keys(this.shaderConfig);
    this.postprocessingShaderConfig = {
      default: {
        vertexShader: distortImageDefaultVertexShader,
        fragmentShader: distortImageDefaultFragmentShader,
      },
      scroll: {
        vertexShader: distortImageScrollVertexShader,
        fragmentShader: distortImageScrollFragmentShader,
      },
      noise: {
        vertexShader: distortImageNoiseVertexShader,
        fragmentShader: distortImageNoiseFragmentShader,
      },
    };
    this.postprocessingShaderNames = Object.keys(
      this.postprocessingShaderConfig
    );
    this.params = {
      shaderName: "mousewave",
      postprocessing: "default",
    };
    this.scrollSpeed = 0;
    this.scrollSpeedTarget = 0;
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.raycastSelector = new RaycastSelector(this.scene, this.camera);
    this.createRenderer();
    await preloadImages();
    this.createEverything();
    this.listenScroll();
    this.createLight();
    this.createOrbitControls();
    this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建一切
  createEverything() {
    this.createDistortImageMaterial();
    this.createMakus();
    this.setImagesPosition();
    this.createMainEffect();
    this.createPostprocessingEffect();
  }
  // 创建材质
  createDistortImageMaterial() {
    const shaderConfig = this.shaderConfig[this.params.shaderName];
    const distortImageMaterial = new THREE.ShaderMaterial({
      vertexShader: shaderConfig.vertexShader,
      fragmentShader: shaderConfig.fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {
          value: 0,
        },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTexture: {
          value: null,
        },
        uHoverUv: {
          value: new THREE.Vector2(0.5, 0.5),
        },
        uHoverState: {
          value: 0,
        },
        uScrollSpeed: {
          value: 0,
        },
      },
    });
    this.distortImageMaterial = distortImageMaterial;
  }
  // 创建图片DOM物体
  createMakus() {
    this.makuGroup.clear();
    const { images, scene, distortImageMaterial } = this;
    const makus = images.map(
      (image) => new Maku(image, distortImageMaterial, scene)
    );
    this.makuGroup.addMultiple(makus);
  }
  // 设置图片位置
  setImagesPosition() {
    this.makuGroup.setPositions();
  }
  // 设置滚动速度
  setScrollSpeed() {
    const scrollSpeed = this.scroll.scroll.instance.speed || 0;
    gsap.to(this, {
      scrollSpeed,
      duration: 0.6,
    });
    if (scrollSpeed) {
      const scrollSpeedDelta = (scrollSpeed - this.scrollSpeedTarget) * 0.2;
      this.scrollSpeedTarget += scrollSpeedDelta;
    }
  }
  // 监听滚动
  listenScroll() {
    const scroll = new LocomotiveScroll({
      getSpeed: true,
    });
    scroll.on("scroll", () => {
      this.setImagesPosition();
    });
    this.scroll = scroll;
  }
  // 创建主要特效
  createMainEffect() {
    this.makuGroup.makus.forEach((obj) => {
      const { el, mesh } = obj;
      const material = mesh.material as THREE.ShaderMaterial;
      el.addEventListener("mouseenter", () => {
        gsap.to(material.uniforms.uHoverState, {
          value: 1,
          duration: 1,
        });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(material.uniforms.uHoverState, {
          value: 0,
          duration: 1,
        });
      });
    });
    window.addEventListener("mousemove", () => {
      const intersect = this.raycastSelector.getFirstIntersect();
      if (intersect) {
        const obj = intersect.object as any;
        if (obj.material.uniforms) {
          obj.material.uniforms.uHoverUv.value = intersect.uv;
        }
      }
    });
  }
  // 创建后期处理特效
  createPostprocessingEffect() {
    const composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);
    const shaderConfig =
      this.postprocessingShaderConfig[this.params.postprocessing];
    const customPass = new ShaderPass({
      vertexShader: shaderConfig.vertexShader,
      fragmentShader: shaderConfig.fragmentShader,
      uniforms: {
        tDiffuse: {
          value: null,
        },
        uTime: {
          value: 0,
        },
        uScrollSpeedTarget: {
          value: 0,
        },
      },
    });
    customPass.renderToScreen = true;
    composer.addPass(customPass);
    this.composer = composer;
    this.customPass = customPass;
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    this.setScrollSpeed();
    const { scrollSpeedTarget, scrollSpeed } = this;
    if (!ky.isEmpty(this.makuGroup.makus)) {
      this.makuGroup.makus.forEach((maku) => {
        const material = maku.mesh.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = elapsedTime;
        material.uniforms.uScrollSpeed.value = scrollSpeed;
      });
    }
    if (this.customPass) {
      this.customPass.uniforms.uScrollSpeedTarget.value = scrollSpeedTarget;
      this.customPass.uniforms.uTime.value = elapsedTime;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    gui.add(this.params, "shaderName", this.shaderNames).onFinishChange(() => {
      this.createEverything();
    });
    gui
      .add(this.params, "postprocessing", this.postprocessingShaderNames)
      .onFinishChange(() => {
        this.createEverything();
      });
  }
}

export default DistortImage;
