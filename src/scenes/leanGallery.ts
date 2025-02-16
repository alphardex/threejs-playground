import * as THREE from "three";
import { MakuGroup, Scroller, Maku, getScreenFov } from "maku.js";
import ky from "kyouka";
import { preloadImages } from "@/utils/dom";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { Base } from "@/commons/base";
import leanGalleryMainVertexShader from "../shaders/leanGallery/main/vertex.glsl";
import leanGalleryMainFragmentShader from "../shaders/leanGallery/main/fragment.glsl";
import leanGalleryPostprocessingVertexShader from "../shaders/leanGallery/postprocessing/vertex.glsl";
import leanGalleryPostprocessingFragmentShader from "../shaders/leanGallery/postprocessing/fragment.glsl";

class LeanGallery extends Base {
  clock!: THREE.Clock;
  images!: HTMLImageElement[];
  makuGroup: MakuGroup;
  leanGalleryMaterial!: THREE.ShaderMaterial;
  customPass!: ShaderPass;
  scroller: Scroller;
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
    this.scroller = new Scroller();
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
    this.makuGroup.clear();
    const { images, scene, leanGalleryMaterial } = this;
    const makus = images.map(
      (image) => new Maku(image, leanGalleryMaterial, scene)
    );
    this.makuGroup.addMultiple(makus);
  }
  // 监听事件
  addListeners() {
    this.onResize();
    this.onScroll();
  }
  // 监听滚动
  onScroll() {
    this.scroller.listenForScroll();
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
    this.syncScroll();
    this.updatePass();
  }
  // 同步滚动
  syncScroll() {
    this.scroller.syncScroll();
    const currentScrollY = this.scroller.scroll.current;
    this.makuGroup.setPositions(currentScrollY);
  }
  // 更新pass
  updatePass() {
    if (this.customPass) {
      const RGBShiftStrength =
        this.scroller.scroll.delta * this.params.RGBShiftSpeed;
      this.customPass.uniforms.uRGBShiftStrength.value = RGBShiftStrength;
    }
  }
}

export default LeanGallery;
