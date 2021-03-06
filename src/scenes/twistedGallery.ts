import * as THREE from "three";
import ky from "kyouka";
import { Base } from "./base";
// @ts-ignore
import twistedGalleryMainVertexShader from "../shaders/twistedGallery/main/vertex.glsl";
// @ts-ignore
import twistedGalleryMainFragmentShader from "../shaders/twistedGallery/main/fragment.glsl";
// @ts-ignore
import twistedGalleryPostprocessingVertexShader from "../shaders/twistedGallery/postprocessing/vertex.glsl";
// @ts-ignore
import twistedGalleryPostprocessingFragmentShader from "../shaders/twistedGallery/postprocessing/fragment.glsl";
import { DOMMeshObject, preloadImages } from "@/utils/dom";
// @ts-ignore
import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

class TwistedGallery extends Base {
  clock!: THREE.Clock;
  images!: HTMLImageElement[];
  imageDOMMeshObjs!: DOMMeshObject[];
  distortImageMaterial!: THREE.ShaderMaterial;
  materials!: THREE.ShaderMaterial[];
  scroll!: any;
  customPass!: ShaderPass;
  scrollSpeed!: number;
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
    this.materials = [];
    this.scrollSpeed = 0;
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    await preloadImages();
    this.createEverything();
    this.listenScroll();
    this.createLight();
    this.createRaycaster();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建一切
  createEverything() {
    this.createDistortImageMaterial();
    this.createImageDOMMeshObjs();
    this.setImagesPosition();
    this.createMainEffect();
    this.createPostprocessingEffect();
  }
  // 获取跟屏幕同像素的fov角度
  getScreenFov() {
    return ky.rad2deg(
      2 * Math.atan(window.innerHeight / 2 / this.cameraPosition.z)
    );
  }
  // 创建材质
  createDistortImageMaterial() {
    const distortImageMaterial = new THREE.ShaderMaterial({
      vertexShader: twistedGalleryMainVertexShader,
      fragmentShader: twistedGalleryMainFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {
          value: 0,
        },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTexture: {
          value: 0,
        },
        uHoverUv: {
          value: new THREE.Vector2(0.5, 0.5),
        },
        uHoverState: {
          value: 0,
        },
      },
    });
    this.distortImageMaterial = distortImageMaterial;
  }
  // 创建图片DOM物体
  createImageDOMMeshObjs() {
    this.materials = [];
    this.imageDOMMeshObjs.forEach((obj) => {
      const { mesh } = obj;
      this.scene.remove(mesh);
    });
    const { images, scene, distortImageMaterial } = this;
    const imageDOMMeshObjs = images.map((image) => {
      const texture = new THREE.Texture(image);
      texture.needsUpdate = true;
      const material = distortImageMaterial.clone();
      material.uniforms.uTexture.value = texture;
      this.materials.push(material);
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
  // 设置滚动速度
  setScrollSpeed() {
    const scrollSpeed = this.scroll.scroll.instance.speed || 0;
    gsap.to(this, {
      scrollSpeed: Math.min(Math.abs(scrollSpeed), 2),
      duration: 1,
    });
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
    const { imageDOMMeshObjs } = this;
    imageDOMMeshObjs.forEach((obj) => {
      const { el, mesh } = obj;
      const material = mesh.material as any;
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
      const intersect = this.getInterSects()[0];
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
    const customPass = new ShaderPass({
      vertexShader: twistedGalleryPostprocessingVertexShader,
      fragmentShader: twistedGalleryPostprocessingFragmentShader,
      uniforms: {
        tDiffuse: {
          value: null,
        },
        uTime: {
          value: 0,
        },
        uRadius: {
          value: 0.75,
        },
        uPower: {
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
    if (!ky.isEmpty(this.materials)) {
      this.materials.forEach((material) => {
        material.uniforms.uTime.value = elapsedTime;
      });
    }
    if (this.customPass) {
      this.setScrollSpeed();
      this.customPass.uniforms.uPower.value = this.scrollSpeed;
    }
  }
}

export default TwistedGallery;
