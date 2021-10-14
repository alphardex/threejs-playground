import * as THREE from "three";
import gsap from "gsap";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import {
  preloadImages,
  MakuGroup,
  Scroller,
  Maku,
  getScreenFov,
} from "@/utils/dom";
import { Base } from "./base";
// @ts-ignore
import imageRippleMainVertexShader from "../shaders/imageRipple/main/vertex.glsl";
// @ts-ignore
import imageRippleMainFragmentShader from "../shaders/imageRipple/main/fragment.glsl";
// @ts-ignore
import imageRipplePostprocessingVertexShader from "../shaders/imageRipple/postprocessing/vertex.glsl";
// @ts-ignore
import imageRipplePostprocessingFragmentShader from "../shaders/imageRipple/postprocessing/fragment.glsl";

class ImageRipple extends Base {
  clock!: THREE.Clock;
  imageRippleMaterial!: THREE.ShaderMaterial;
  makuGroup: MakuGroup;
  scroller!: Scroller;
  customPass!: ShaderPass;
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
    this.scroller = new Scroller();
    this.params = {
      distortDuration: 15,
      distortEase: "power2.out",
      distortStagger: 0.25,
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
    this.distortMultipleImages(
      this.makuGroup.makus,
      this.params.distortStagger
    );
  }
  // 创建一切
  createEverything() {
    this.createImagePlaneMaterial();
    this.createMakuGroup();
    this.createPostprocessingEffect();
  }
  // 创建材质
  createImagePlaneMaterial() {
    const imageRippleMaterial = new THREE.ShaderMaterial({
      vertexShader: imageRippleMainVertexShader,
      fragmentShader: imageRippleMainFragmentShader,
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
        uProgress: {
          value: 0,
        },
      },
    });
    this.imageRippleMaterial = imageRippleMaterial;
  }
  // 创建图片DOM物体组
  createMakuGroup() {
    const makuGroup = new MakuGroup();
    const { scene, imageRippleMaterial } = this;
    const images = [...document.querySelectorAll("img")];
    images.map((image) => {
      const maku = new Maku(image, imageRippleMaterial, scene);
      makuGroup.add(maku);
    });
    makuGroup.setPositions();
    this.makuGroup = makuGroup;
  }
  // 创建后期处理特效
  createPostprocessingEffect() {
    const composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    const customPass = new ShaderPass({
      vertexShader: imageRipplePostprocessingVertexShader,
      fragmentShader: imageRipplePostprocessingFragmentShader,
      uniforms: {
        tDiffuse: {
          value: null,
        },
        uTime: {
          value: 0,
        },
      },
    });
    customPass.renderToScreen = true;
    this.customPass = customPass;
    composer.addPass(customPass);

    this.composer = composer;
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
  // 动画
  update() {
    this.syncScroll();
    this.updatePassTime();
  }
  // 同步滚动
  syncScroll() {
    this.scroller.syncScroll();
    const currentScrollY = this.scroller.scroll.current;
    this.makuGroup.setPositions(currentScrollY);
  }
  // 更新Pass的时间
  updatePassTime() {
    const uniforms = this.customPass.uniforms;
    const elapsedTime = this.clock.getElapsedTime();
    uniforms.uTime.value = elapsedTime;
  }
  // 扭曲图片
  distortImage(imageDOMMeshObj: Maku) {
    const uProgress = (imageDOMMeshObj.mesh.material as any).uniforms.uProgress;
    gsap.to(uProgress, {
      value: 1,
      duration: this.params.distortDuration,
      ease: this.params.distortEase,
    });
  }
  // 扭曲多个图片
  distortMultipleImages(makus: Maku[], stagger = 0) {
    const alluProgress = makus.map(
      (obj) => (obj.mesh.material as any).uniforms.uProgress
    );
    gsap.to(alluProgress, {
      value: 1,
      duration: this.params.distortDuration,
      ease: this.params.distortEase,
      stagger,
    });
  }
}

export default ImageRipple;
