import * as THREE from "three";
import ky from "kyouka";
import gsap from "gsap";
import { MakuGroup, Scroller, Maku, getScreenFov } from "maku.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { preloadImages } from "@/utils/dom";
import { Base } from "@/commons/base";
import mainVertexShader from "../shaders/gooeyImage/main/vertex.glsl";
import mainFragmentShader from "../shaders/gooeyImage/main/fragment.glsl";
import postprocessingVertexShader from "../shaders/gooeyImage/postprocessing/vertex.glsl";
import postprocessingFragmentShader from "../shaders/gooeyImage/postprocessing/fragment.glsl";
import { RaycastSelector } from "@/utils/raycast";

class GooeyImage extends Base {
  clock: THREE.Clock;
  images: HTMLImageElement[];
  makuGroup: MakuGroup;
  scroller: Scroller;
  customPass: ShaderPass;
  raycastSelector: RaycastSelector;
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
    this.raycastSelector = new RaycastSelector(this.scene, this.camera);
    this.createRenderer();
    await preloadImages();
    this.createEverything();
    this.mouseTracker.trackMousePos();
    this.addListeners();
    this.setLoop();
  }
  // 创建一切
  createEverything() {
    this.createShaderMaterial();
    this.createMakuGroup();
    this.addInnerImage();
    this.createPostprocessingEffect();
  }
  // 创建材质
  createShaderMaterial() {
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: mainVertexShader,
      fragmentShader: mainFragmentShader,
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
        uTexture2: {
          value: null,
        },
        uHoverUv: {
          value: new THREE.Vector2(2, 2),
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
  // 添加内部图
  addInnerImage() {
    this.makuGroup.makus.forEach((maku) => {
      const innerImgUrl = maku.el.dataset.inner;
      const innerImg = new Image();
      innerImg.src = innerImgUrl;
      const texture = new THREE.Texture(innerImg);
      texture.needsUpdate = true;
      const material = maku.mesh.material as THREE.ShaderMaterial;
      const uniforms = material.uniforms;
      uniforms.uTexture2.value = texture;
    });
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
    this.createMouseHoverEffect();
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
      const { width, height } = maku.rect;
      uniforms.uResolution.value = new THREE.Vector2(width, height);
    });
  }
  // 创建鼠标悬浮效果
  createMouseHoverEffect() {
    // 鼠标离开图片时
    this.makuGroup.makus.forEach((obj) => {
      const { el, mesh } = obj;
      const material = mesh.material as THREE.ShaderMaterial;
      const uniforms = material.uniforms;
      el.addEventListener("mouseleave", () => {
        gsap.set(uniforms.uHoverUv, {
          value: new THREE.Vector2(2, 2),
        });
      });
    });

    // 鼠标在图片上移动时
    window.addEventListener(
      "mousemove",
      ky.debounce(() => {
        const intersect = this.raycastSelector.getFirstIntersect();
        if (intersect) {
          const obj = intersect.object as THREE.Mesh;
          const material = obj.material as THREE.ShaderMaterial;
          const uniforms = material.uniforms;
          uniforms.uHoverUv.value = intersect.uv;
        }
      }, 10)
    );
  }
}

export default GooeyImage;
