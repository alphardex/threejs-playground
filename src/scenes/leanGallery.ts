import * as THREE from "three";
import ky from "kyouka";
import NormalizeWheel from "normalize-wheel";
import * as dat from "dat.gui";
import { getScreenFov, Maku, MakuGroup, preloadImages } from "@/utils/dom";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { lerp } from "@/utils/math";
import { Base } from "./base";
// @ts-ignore
import leanGalleryMainVertexShader from "../shaders/leanGallery/main/vertex.glsl";
// @ts-ignore
import leanGalleryMainFragmentShader from "../shaders/leanGallery/main/fragment.glsl";
// @ts-ignore
import leanGalleryPostprocessingVertexShader from "../shaders/leanGallery/postprocessing/vertex.glsl";
// @ts-ignore
import leanGalleryPostprocessingFragmentShader from "../shaders/leanGallery/postprocessing/fragment.glsl";

class LeanGallery extends Base {
  clock!: THREE.Clock;
  images!: HTMLImageElement[];
  makuGroup: MakuGroup;
  leanGalleryMaterial!: THREE.ShaderMaterial;
  customPass!: ShaderPass;
  scroll!: any;
  params!: any;
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
    this.scroll = {
      current: 0,
      target: 0,
      ease: 0.05,
      last: 0,
      delta: 0,
      direction: "",
    };
    this.params = {
      leanAngle: -12,
      scrollSpeedStrength: 0.5,
      RGBShiftSpeed: 0.0005,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.rotateScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    await preloadImages();
    this.createEverything();
    this.addListeners();
    this.setLoop();
  }
  // 旋转场景
  rotateScene() {
    this.scene.rotation.x = ky.deg2rad(this.params.leanAngle);
  }
  // 创建一切
  createEverything() {
    this.createLeanGalleryMaterial();
    this.createMakus();
    this.setImagesPosition();
    this.createPostprocessingEffect();
  }
  // 创建材质
  createLeanGalleryMaterial() {
    const leanGalleryMaterial = new THREE.ShaderMaterial({
      vertexShader: leanGalleryMainVertexShader,
      fragmentShader: leanGalleryMainFragmentShader,
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
    this.leanGalleryMaterial = leanGalleryMaterial;
  }
  // 创建图片DOM物体
  createMakus() {
    const makuGroup = new MakuGroup();
    const { scene, leanGalleryMaterial } = this;
    const images = [...document.querySelectorAll("img")];
    images.map((image) => {
      const maku = new Maku(image, leanGalleryMaterial, scene);
      makuGroup.add(maku);
    });
    makuGroup.setPositions();
    this.makuGroup = makuGroup;
  }
  // 设置图片位置
  setImagesPosition(deltaY = window.scrollY) {
    this.makuGroup.setPositions(deltaY);
  }
  // 监听事件
  addListeners() {
    this.onResize();
    this.onScroll();
  }
  // 监听鼠标滚轮
  onScroll() {
    window.addEventListener("mousewheel", (e) => {
      const normalized = NormalizeWheel(e);
      const speed = normalized.pixelY;
      const scrollY = speed * this.params.scrollSpeedStrength;
      this.scroll.target += scrollY;
    });
  }
  // 监听滚动
  listenForScroll() {
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    this.scroll.delta = this.scroll.current - this.scroll.last;
    this.scroll.direction = this.scroll.delta > 0 ? "down" : "up";
    this.scroll.last = this.scroll.current;
    this.setImagesPosition(this.scroll.current);
  }
  // 创建后期处理特效
  createPostprocessingEffect() {
    const composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);
    const customPass = new ShaderPass({
      vertexShader: leanGalleryPostprocessingVertexShader,
      fragmentShader: leanGalleryPostprocessingFragmentShader,
      uniforms: {
        tDiffuse: {
          value: null,
        },
        uRGBShiftStrength: {
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
    this.listenForScroll();
    if (this.customPass) {
      const RGBShiftStrength = this.scroll.delta * this.params.RGBShiftSpeed;
      this.customPass.uniforms.uRGBShiftStrength.value = RGBShiftStrength;
    }
  }
}

export default LeanGallery;
