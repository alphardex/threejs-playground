import * as THREE from "three";
import * as dat from "dat.gui";
import ky from "kyouka";
import { Base } from "./base";
// @ts-ignore
import distortImageMouseWaveVertexShader from "../shaders/distortImage/mousewave/vertex.glsl";
// @ts-ignore
import distortImageMouseWaveFragmentShader from "../shaders/distortImage/mousewave/fragment.glsl";
import { DOMMeshObject, preloadImages } from "@/utils/dom";
// @ts-ignore
import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";

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
    };
    this.shaderNames = Object.keys(this.shaderConfig);
    this.params = {
      shaderName: "mousewave",
    };
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
    this.createRaycaster();
    this.createMouseWaveEffect();
    this.createOrbitControls();
    this.createDebugPanel();
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
    const distortImageMaterial = new THREE.ShaderMaterial({
      vertexShader: distortImageMouseWaveVertexShader,
      fragmentShader: distortImageMouseWaveFragmentShader,
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
  // 监听滚动
  listenScroll() {
    const scroll = new LocomotiveScroll();
    scroll.on("scroll", () => {
      this.setImagesPosition();
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
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    if (!ky.isEmpty(this.materials)) {
      this.materials.forEach((material) => {
        material.uniforms.uTime.value = elapsedTime;
      });
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    gui.add(this.params, "shaderName", this.shaderNames).onFinishChange(() => {
      this.createDistortImageMaterial();
    });
  }
}

export default DistortImage;
