import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import distortImageVertexShader from "../shaders/distortImage/vertex.glsl";
// @ts-ignore
import distortImageFragmentShader from "../shaders/distortImage/fragment.glsl";
import { distortImageTextureUrl } from "@/consts/distortImage";
import { DOMMeshObject, preloadImages } from "@/utils/dom";
// @ts-ignore
import LocomotiveScroll from "locomotive-scroll";

class DistortImage extends Base {
  clock!: THREE.Clock;
  images!: HTMLImageElement[];
  imageDOMMeshObjs!: DOMMeshObject[];
  distortImageMaterial!: THREE.ShaderMaterial;
  scroll!: any;
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
    this.imageDOMMeshObjs = [];
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createDistortImageMaterial();
    await preloadImages();
    this.createImageDOMMeshObjs();
    this.setImagesPosition();
    this.listenScroll();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
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
  createDistortImageMaterial() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(distortImageTextureUrl);
    const distortImageMaterial = new THREE.ShaderMaterial({
      vertexShader: distortImageVertexShader,
      fragmentShader: distortImageFragmentShader,
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
          value: texture,
        },
      },
      wireframe: true,
    });
    this.distortImageMaterial = distortImageMaterial;
  }
  // 创建图片DOM物体
  createImageDOMMeshObjs() {
    const { images, scene } = this;
    const imageDOMMeshObjs = images.map((image) => {
      const texture = new THREE.Texture(image);
      texture.needsUpdate = true;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
      });
      const imageDOMMeshObj = new DOMMeshObject(image, scene, material);
      return imageDOMMeshObj;
    });
    this.imageDOMMeshObjs = imageDOMMeshObjs;
  }
  // 设置图片位置
  setImagesPosition() {
    const { imageDOMMeshObjs } = this;
    imageDOMMeshObjs.forEach((obj) => {
      obj.setPosition();
    });
  }
  // 监听滚动
  listenScroll() {
    const scroll = new LocomotiveScroll();
    scroll.on("scroll", () => {
      this.setImagesPosition();
    });
    this.scroll = scroll;
  }
  // 停止滚动
  stopScroll() {
    this.scroll.stop();
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.distortImageMaterial) {
      this.distortImageMaterial.uniforms.uTime.value = elapsedTime;
      this.distortImageMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default DistortImage;
