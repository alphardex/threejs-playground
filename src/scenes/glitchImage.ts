import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import glitchImageMainVertexShader from "../shaders/glitchImage/main/vertex.glsl";
// @ts-ignore
import glitchImageMainFragmentShader from "../shaders/glitchImage/main/fragment.glsl";
// @ts-ignore
import glitchImagePostprocessingVertexShader from "../shaders/glitchImage/postprocessing/vertex.glsl";
// @ts-ignore
import glitchImagePostprocessingFragmentShader from "../shaders/glitchImage/postprocessing/fragment.glsl";
import { glitchImageTextureUrl } from "@/consts/glitchImage";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

class GlitchImage extends Base {
  clock!: THREE.Clock;
  glitchImageMaterial!: THREE.ShaderMaterial;
  customPass!: ShaderPass;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 0);
    this.orthographicCameraParams = {
      left: -1,
      right: 1,
      top: 1,
      bottom: -1,
      near: 0,
      far: 1,
      zoom: 1,
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createGlitchImageMaterial();
    this.createPlane();
    this.createPostprocessingEffect();
    this.createLight();
    this.trackMousePos();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createGlitchImageMaterial() {
    const glitchImageMaterial = new THREE.ShaderMaterial({
      vertexShader: glitchImageMainVertexShader,
      fragmentShader: glitchImageMainFragmentShader,
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
          value: new THREE.TextureLoader().load(glitchImageTextureUrl),
        },
      },
    });
    this.glitchImageMaterial = glitchImageMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
    const material = this.glitchImageMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 创建后期处理特效
  createPostprocessingEffect() {
    const composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);
    const customPass = new ShaderPass({
      vertexShader: glitchImagePostprocessingVertexShader,
      fragmentShader: glitchImagePostprocessingFragmentShader,
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
    composer.addPass(customPass);
    this.composer = composer;
    this.customPass = customPass;
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.glitchImageMaterial) {
      this.glitchImageMaterial.uniforms.uTime.value = elapsedTime;
      this.glitchImageMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default GlitchImage;
