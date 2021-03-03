import * as THREE from "three";
import * as dat from "dat.gui";
import ky from "kyouka";
import { Base } from "./base";
// @ts-ignore
import distortImageMouseWaveVertexShader from "../shaders/distortImage/mousewave/vertex.glsl";
// @ts-ignore
import distortImageMouseWaveFragmentShader from "../shaders/distortImage/mousewave/fragment.glsl";
// @ts-ignore
import distortImagePostprocessingVertexShader from "../shaders/distortImage/postprocessing/vertex.glsl";
// @ts-ignore
import distortImagePostprocessingFragmentShader from "../shaders/distortImage/postprocessing/fragment.glsl";
// @ts-ignore
import distortImageHoverWaveVertexShader from "../shaders/distortImage/hoverwave/vertex.glsl";
// @ts-ignore
import distortImageHoverWaveFragmentShader from "../shaders/distortImage/hoverwave/fragment.glsl";
import { DOMMeshObject, preloadImages } from "@/utils/dom";
// @ts-ignore
import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

class DistortImage extends Base {
  clock!: THREE.Clock;
  images!: HTMLImageElement[];
  imageDOMMeshObjs!: DOMMeshObject[];
  distortImageMaterial!: THREE.ShaderMaterial;
  materials!: THREE.ShaderMaterial[];
  scroll!: any;
  shaderConfig!: any;
  shaderNames!: string[];
  params!: any;
  customPass!: ShaderPass;
  scrollSpeedTarget!: number;
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
    this.shaderConfig = {
      mousewave: {
        vertexShader: distortImageMouseWaveVertexShader,
        fragmentShader: distortImageMouseWaveFragmentShader,
      },
      hoverwave: {
        vertexShader: distortImageHoverWaveVertexShader,
        fragmentShader: distortImageHoverWaveFragmentShader,
      },
    };
    this.shaderNames = Object.keys(this.shaderConfig);
    this.params = {
      shaderName: "mousewave",
    };
    this.scrollSpeedTarget = 0;
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
    this.createMouseWaveEffect();
    this.createPostprocessingEffect();
    this.createOrbitControls();
    this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建一切
  createEverything() {
    this.createDistortImageMaterial();
    this.createImageDOMMeshObjs();
    this.setImagesPosition();
  }
  // 获取跟屏幕同像素的fov角度
  getScreenFov() {
    return ky.rad2deg(
      2 * Math.atan(window.innerHeight / 2 / this.cameraPosition.z)
    );
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
    const scrollSpeed = this.scroll.scroll.instance.speed;
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
      this.setScrollSpeed();
    });
    this.scroll = scroll;
  }
  // 创建mousewave特效
  createMouseWaveEffect() {
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
        obj.material.uniforms.uHoverUv.value = intersect.uv;
      }
    });
  }
  // 创建后期处理特效
  createPostprocessingEffect() {
    const composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);
    const customPass = new ShaderPass({
      vertexShader: distortImagePostprocessingVertexShader,
      fragmentShader: distortImagePostprocessingFragmentShader,
      uniforms: {
        tDiffuse: {
          value: null,
        },
        uScrollSpeed: {
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
      const { scrollSpeedTarget } = this;
      this.customPass.uniforms.uScrollSpeed.value = scrollSpeedTarget;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    gui.add(this.params, "shaderName", this.shaderNames).onFinishChange(() => {
      this.createEverything();
    });
  }
}

export default DistortImage;
