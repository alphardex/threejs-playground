import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import sunNoiseVertexShader from "../shaders/sun/noise/vertex.glsl";
// @ts-ignore
import sunNoiseFragmentShader from "../shaders/sun/noise/fragment.glsl";
// @ts-ignore
import sunShapeVertexShader from "../shaders/sun/shape/vertex.glsl";
// @ts-ignore
import sunShapeFragmentShader from "../shaders/sun/shape/fragment.glsl";
// @ts-ignore
import sunRingVertexShader from "../shaders/sun/ring/vertex.glsl";
// @ts-ignore
import sunRingFragmentShader from "../shaders/sun/ring/fragment.glsl";

class Sun extends Base {
  clock!: THREE.Clock;
  sunNoiseMaterial!: THREE.ShaderMaterial;
  sunShapeMaterial!: THREE.ShaderMaterial;
  sunRingMaterial!: THREE.ShaderMaterial;
  cubeRt!: THREE.WebGLCubeRenderTarget;
  cubeCamera!: THREE.CubeCamera;
  cubeScene!: THREE.Scene;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createSunNoiseMaterial();
    this.createCubeRt();
    this.createSunShapeMaterial();
    this.createSun();
    this.createSunRingMaterial();
    this.createSunRing();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建噪声材质
  createSunNoiseMaterial() {
    const sunNoiseMaterial = new THREE.ShaderMaterial({
      vertexShader: sunNoiseVertexShader,
      fragmentShader: sunNoiseFragmentShader,
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
      },
    });
    this.sunNoiseMaterial = sunNoiseMaterial;
  }
  // 创建立方体离屏渲染目标，将其作为太阳本体的噪声贴图
  createCubeRt() {
    const cubeRt = new THREE.WebGLCubeRenderTarget(256);
    this.cubeRt = cubeRt;
    const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRt);
    this.cubeCamera = cubeCamera;
    const cubeScene = new THREE.Scene();
    const geometry = new THREE.SphereBufferGeometry(1, 100, 100);
    const material = this.sunNoiseMaterial;
    this.createMesh(
      {
        geometry,
        material,
      },
      cubeScene
    );
    this.cubeScene = cubeScene;
  }
  // 创建太阳本体材质
  createSunShapeMaterial() {
    const sunShapeMaterial = new THREE.ShaderMaterial({
      vertexShader: sunShapeVertexShader,
      fragmentShader: sunShapeFragmentShader,
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
        uNoiseTexture: {
          value: null,
        },
        uVelocity: {
          value: 0.05,
        },
        uBrightness: {
          value: 0.33,
        },
        uStagger: {
          value: 16,
        },
      },
    });
    this.sunShapeMaterial = sunShapeMaterial;
  }
  // 创建太阳
  createSun() {
    const geometry = new THREE.SphereBufferGeometry(1, 100, 100);
    const material = this.sunShapeMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 创建太阳环材质
  createSunRingMaterial() {
    const sunRingMaterial = new THREE.ShaderMaterial({
      vertexShader: sunRingVertexShader,
      fragmentShader: sunRingFragmentShader,
      side: THREE.BackSide,
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
      },
    });
    this.sunRingMaterial = sunRingMaterial;
  }
  // 创建太阳环
  createSunRing() {
    const geometry = new THREE.SphereBufferGeometry(1.2, 100, 100);
    const material = this.sunRingMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.sunNoiseMaterial && this.sunShapeMaterial) {
      this.cubeCamera.update(this.renderer, this.cubeScene);
      this.sunNoiseMaterial.uniforms.uTime.value = elapsedTime;
      this.sunNoiseMaterial.uniforms.uMouse.value = mousePos;
      this.sunShapeMaterial.uniforms.uTime.value = elapsedTime;
      this.sunShapeMaterial.uniforms.uMouse.value = mousePos;
      this.sunShapeMaterial.uniforms.uNoiseTexture.value = this.cubeRt.texture;
      this.sunRingMaterial.uniforms.uTime.value = elapsedTime;
      this.sunRingMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default Sun;
