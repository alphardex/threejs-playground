import * as THREE from "three";
import { MakuGroup, Scroller, Maku, getScreenFov } from "maku.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { preloadImages } from "@/utils/dom";
import { Base } from "@/commons/base";
import mainVertexShader from "../shaders/imagePlane/main/vertex.glsl";
import mainFragmentShader from "../shaders/imagePlane/main/fragment.glsl";
import postprocessingVertexShader from "../shaders/imagePlane/postprocessing/vertex.glsl";
import postprocessingFragmentShader from "../shaders/imagePlane/postprocessing/fragment.glsl";

class ImagePlane extends Base {
  clock: THREE.Clock;
  images: HTMLImageElement[];
  makuGroup: MakuGroup;
  scroller: Scroller;
  customPass: ShaderPass;
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
    this.createShaderMaterial();
    this.createMakuGroup();
    this.createPostprocessingEffect();
  }
  // 创建材质
  createShaderMaterial() {
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: mainVertexShader,
      fragmentShader: mainFragmentShader,
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
    this.shaderMaterial = shaderMaterial;
  }
  // 创建图片DOM物体组
  createMakuGroup() {
    this.makuGroup.clear();
    const { images, scene, shaderMaterial } = this;
    const makus = images.map((image) => new Maku(image, shaderMaterial, scene));
    this.makuGroup.addMultiple(makus);
  }
  // 创建后期处理特效
  createPostprocessingEffect() {
    const composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    const customPass = new ShaderPass({
      vertexShader: postprocessingVertexShader,
      fragmentShader: postprocessingFragmentShader,
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
    this.updateMaterialUniforms();
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
  // 更新材质参数
  updateMaterialUniforms() {
    this.makuGroup.makus.forEach((maku) => {
      const shaderMaterial = maku.mesh.material as THREE.ShaderMaterial;
      const { uniforms } = shaderMaterial;
      const elapsedTime = this.clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;
    });
  }
}

export default ImagePlane;
