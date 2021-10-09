import * as THREE from "three";
import {
  preloadImages,
  ImageDOMMeshObjGroup,
  MouseWheelScroller,
} from "@/utils/dom";
import { Base } from "./base";
// @ts-ignore
import pixelRiverVertexShader from "../shaders/pixelRiver/vertex.glsl";
// @ts-ignore
import pixelRiverFragmentShader from "../shaders/pixelRiver/fragment.glsl";

class PixelRiver extends Base {
  clock!: THREE.Clock;
  images!: HTMLImageElement[];
  pixelRiverMaterial!: THREE.ShaderMaterial;
  imageDOMMeshObjGroup: ImageDOMMeshObjGroup;
  mouseWheelScroller!: MouseWheelScroller;
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
    this.updateScrollPosition();
  }
  // 创建材质
  createPixelRiverMaterial() {
    const pixelRiverMaterial = new THREE.ShaderMaterial({
      vertexShader: pixelRiverVertexShader,
      fragmentShader: pixelRiverFragmentShader,
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
  // 更新滚动位置
  updateScrollPosition(scrollY = window.scrollY) {
    this.imageDOMMeshObjGroup.setObjsPosition(scrollY);
  }
  // 监听事件
  addListeners() {
    this.onResize();
    this.mouseWheelScroller.listenForWheel(this.params.scrollSpeedStrength);
  }
  // 动画
  update() {
    this.mouseWheelScroller.syncScroll();
    this.updateScrollPosition(this.mouseWheelScroller.scroll.current);
  }
}

export default PixelRiver;
