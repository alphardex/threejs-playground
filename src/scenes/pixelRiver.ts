import * as THREE from "three";
import ky from "kyouka";
import gsap from "gsap";
import * as dat from "dat.gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { preloadImages, ImageDOMMeshObjGroup, Scroller } from "@/utils/dom";
import { Base } from "./base";
// @ts-ignore
import pixelRiverMainVertexShader from "../shaders/pixelRiver/main/vertex.glsl";
// @ts-ignore
import pixelRiverMainFragmentShader from "../shaders/pixelRiver/main/fragment.glsl";
// @ts-ignore
import pixelRiverPostprocessingVertexShader from "../shaders/pixelRiver/postprocessing/vertex.glsl";
// @ts-ignore
import pixelRiverPostprocessingFragmentShader from "../shaders/pixelRiver/postprocessing/fragment.glsl";

class PixelRiver extends Base {
  clock!: THREE.Clock;
  images!: HTMLImageElement[];
  pixelRiverMaterial!: THREE.ShaderMaterial;
  imageDOMMeshObjGroup: ImageDOMMeshObjGroup;
  Scroller!: Scroller;
  customPass!: ShaderPass;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 600);
    const fov = this.getScreenFov();
    this.perspectiveCameraParams = {
      fov,
      near: 100,
      far: 2000,
    };
    this.images = [...document.querySelectorAll("img")];
    this.Scroller = new Scroller();
    this.params = {
      scrollSpeedStrength: 1,
      progress: 0,
      // progress: 0.7,
      waveScale: 1.6,
      distA: 0.64,
      distB: 2.5,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    await preloadImages();
    this.createEverything();
    this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建一切
  createEverything() {
    this.createPixelRiverMaterial();
    this.createImageDOMMeshObjGroup();
    this.createPostprocessingEffect();
  }
  // 创建材质
  createPixelRiverMaterial() {
    const pixelRiverMaterial = new THREE.ShaderMaterial({
      vertexShader: pixelRiverMainVertexShader,
      fragmentShader: pixelRiverMainFragmentShader,
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
        uTexture: {
          value: null,
        },
      },
    });
    this.pixelRiverMaterial = pixelRiverMaterial;
  }
  // 创建图片DOM物体组
  createImageDOMMeshObjGroup() {
    const { images, scene, pixelRiverMaterial } = this;
    const imageDOMMeshObjGroup = new ImageDOMMeshObjGroup();
    images.map((image) => {
      imageDOMMeshObjGroup.addObject(image, scene, pixelRiverMaterial);
    });
    this.imageDOMMeshObjGroup = imageDOMMeshObjGroup;
  }
  // 监听事件
  addListeners() {
    this.onResize();
    this.onScroll();
  }
  // 监听滚动
  onScroll() {
    this.Scroller.listenForScroll();
  }
  // 同步滚动
  syncScroll() {
    this.Scroller.syncScroll();
    const currentScrollY = this.Scroller.scroll.current;
    this.imageDOMMeshObjGroup.setObjsPosition(currentScrollY);
  }
  // 创建后期处理特效
  createPostprocessingEffect() {
    const composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    const customPass = new ShaderPass({
      vertexShader: pixelRiverPostprocessingVertexShader,
      fragmentShader: pixelRiverPostprocessingFragmentShader,
      uniforms: {
        tDiffuse: {
          value: null,
        },
        uTime: {
          value: 0,
        },
        uProgress: {
          value: this.params.progress, // 扭曲进度
        },
        uWaveScale: {
          value: this.params.waveScale, // 扭曲波浪大小
        },
        uDistA: {
          value: this.params.distA,
        },
        uDistB: {
          value: this.params.distB,
        },
      },
    });
    customPass.renderToScreen = true;
    this.customPass = customPass;
    composer.addPass(customPass);

    this.composer = composer;
  }
  // 更新Pass的变量
  updatePassVariables() {
    const uniforms = this.customPass.uniforms;
    const elapsedTime = this.clock.getElapsedTime();
    uniforms.uTime.value = elapsedTime;

    const params = this.params;
    uniforms.uProgress.value = params.progress;
    uniforms.uWaveScale.value = params.waveScale;
    uniforms.uDistA.value = params.distA;
    uniforms.uDistB.value = params.distB;
  }
  // 更新图片状态
  updateMeshState() {
    this.imageDOMMeshObjGroup.imageDOMMeshObjs.forEach((obj) => {
      const progress = this.params.progress;
      obj.mesh.rotation.z = ky.deg2rad(90) * progress;
    });
  }
  // 处理滚动时状态
  handleScroll() {
    const currentScrollY = this.Scroller.scroll.target;
    const params = this.params;
    console.log(currentScrollY);
    if (currentScrollY > 0) {
      gsap.to(params, {
        progress: 0,
        ease: "power3.inout",
      });
    } else if (currentScrollY <= 0) {
      gsap.to(params, {
        progress: 0.7,
        ease: "power3.inout",
      });
    }
  }
  // 动画
  update() {
    this.syncScroll();
    this.updatePassVariables();
    this.updateMeshState();
    this.handleScroll();
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    const params = this.params;
    gui
      .add(params, "progress")
      .min(0)
      .max(1)
      .step(0.01);
    gui
      .add(params, "waveScale")
      .min(0)
      .max(10)
      .step(0.01);
    gui
      .add(params, "distA")
      .min(0)
      .max(1)
      .step(0.01);
    gui
      .add(params, "distB")
      .min(0)
      .max(20)
      .step(0.01);
  }
}

export default PixelRiver;
