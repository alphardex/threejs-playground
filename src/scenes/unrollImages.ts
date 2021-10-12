import * as THREE from "three";
import ky from "kyouka";
import gsap from "gsap";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import {
  preloadImages,
  ImageDOMMeshObjGroup,
  Scroller,
  DOMMeshObject,
} from "@/utils/dom";
import { Base } from "./base";
// @ts-ignore
import unrollImagesMainVertexShader from "../shaders/unrollImages/main/vertex.glsl";
// @ts-ignore
import unrollImagesMainFragmentShader from "../shaders/unrollImages/main/fragment.glsl";
// @ts-ignore
import unrollImagesPostprocessingVertexShader from "../shaders/unrollImages/postprocessing/vertex.glsl";
// @ts-ignore
import unrollImagesPostprocessingFragmentShader from "../shaders/unrollImages/postprocessing/fragment.glsl";

class UnrollImages extends Base {
  clock!: THREE.Clock;
  unrollImagesMaterial!: THREE.ShaderMaterial;
  imageDOMMeshObjGroup: ImageDOMMeshObjGroup;
  scroller!: Scroller;
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
    this.scroller = new Scroller();
    this.params = {
      revealAngle: 15,
      revealDuration: 40,
      revealEase: "power2.out",
      revealStagger: 0,
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
    this.revealMultipleImages(
      this.imageDOMMeshObjGroup.imageDOMMeshObjs,
      this.params.revealStagger
    );
  }
  // 创建一切
  createEverything() {
    this.createUnrollImagesMaterial();
    this.createImageDOMMeshObjGroup();
    this.createPostprocessingEffect();
  }
  // 创建材质
  createUnrollImagesMaterial() {
    const unrollImagesMaterial = new THREE.ShaderMaterial({
      vertexShader: unrollImagesMainVertexShader,
      fragmentShader: unrollImagesMainFragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
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
        uAngle: {
          value: ky.deg2rad(this.params.revealAngle),
        },
      },
    });
    this.unrollImagesMaterial = unrollImagesMaterial;
  }
  // 创建图片DOM物体组
  createImageDOMMeshObjGroup() {
    const imageDOMMeshObjGroup = new ImageDOMMeshObjGroup();
    const { scene, unrollImagesMaterial } = this;
    const images = [...document.querySelectorAll("img")];
    images.map((image) => {
      imageDOMMeshObjGroup.addObject(
        image,
        scene,
        unrollImagesMaterial,
        false,
        "scale"
      );
    });
    imageDOMMeshObjGroup.setObjsPosition();
    this.imageDOMMeshObjGroup = imageDOMMeshObjGroup;
  }
  // 创建后期处理特效
  createPostprocessingEffect() {
    const composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    const customPass = new ShaderPass({
      vertexShader: unrollImagesPostprocessingVertexShader,
      fragmentShader: unrollImagesPostprocessingFragmentShader,
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
    this.imageDOMMeshObjGroup.setObjsPosition(currentScrollY);
  }
  // 更新Pass的时间
  updatePassTime() {
    const uniforms = this.customPass.uniforms;
    const elapsedTime = this.clock.getElapsedTime();
    uniforms.uTime.value = elapsedTime;
  }
  // 展开图片
  revealImage(imageDOMMeshObj: DOMMeshObject) {
    const uProgress = (imageDOMMeshObj.mesh.material as any).uniforms.uProgress;
    gsap.fromTo(
      uProgress,
      {
        value: 0,
      },
      {
        value: 1,
        duration: this.params.revealDuration,
        ease: this.params.revealEase,
      }
    );
  }
  // 展开多个图片
  revealMultipleImages(imageDOMMeshObjs: DOMMeshObject[], stagger = 0) {
    const alluProgress = imageDOMMeshObjs.map(
      (obj) => (obj.mesh.material as any).uniforms.uProgress
    );
    gsap.fromTo(
      alluProgress,
      {
        value: 0,
      },
      {
        value: 1,
        duration: this.params.revealDuration,
        ease: this.params.revealEase,
        stagger,
      }
    );
  }
}

export default UnrollImages;
