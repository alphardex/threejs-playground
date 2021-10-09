import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import {
  preloadImages,
  ImageDOMMeshObjGroup,
  MouseWheelScroller,
} from "@/utils/dom";
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
  mouseWheelScroller!: MouseWheelScroller;
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
    this.mouseWheelScroller = new MouseWheelScroller();
    this.params = {
      scrollSpeedStrength: 0.5,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    await preloadImages();
    this.createEverything();
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
    this.onWheel();
  }
  // 监听鼠标滚轮滚动
  onWheel() {
    this.mouseWheelScroller.listenForWheel(this.params.scrollSpeedStrength);
  }
  // 同步滚动
  syncScroll() {
    const currentScrollY = this.mouseWheelScroller.scroll.current;
    this.mouseWheelScroller.syncScroll();
    this.imageDOMMeshObjGroup.setObjsPosition(currentScrollY);
  }
  // 动画
  update() {
    this.syncScroll();
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
      },
    });
    customPass.renderToScreen = true;
    composer.addPass(customPass);
    this.composer = composer;
    this.customPass = customPass;
  }
}

export default PixelRiver;
