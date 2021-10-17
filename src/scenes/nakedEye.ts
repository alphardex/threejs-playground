import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import nakedEyeVertexShader from "../shaders/nakedEye/vertex.glsl";
// @ts-ignore
import nakedEyeFragmentShader from "../shaders/nakedEye/fragment.glsl";
import { nakedEyeDepthMapImgUrl, nakedEyeImgUrl } from "@/consts/nakedEye";

class NakedEye extends Base {
  clock!: THREE.Clock;
  nakedEyeMaterial!: THREE.ShaderMaterial;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1);
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createNakedEyeMaterial();
    this.createPlane();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createNakedEyeMaterial() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(nakedEyeImgUrl);
    const depthMapTexture = loader.load(nakedEyeDepthMapImgUrl);
    const nakedEyeMaterial = new THREE.ShaderMaterial({
      vertexShader: nakedEyeVertexShader,
      fragmentShader: nakedEyeFragmentShader,
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
        uDepthMap: {
          value: depthMapTexture,
        },
      },
    });
    this.nakedEyeMaterial = nakedEyeMaterial;
    this.shaderMaterial = nakedEyeMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 3, 100, 100);
    const material = this.nakedEyeMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.nakedEyeMaterial) {
      this.nakedEyeMaterial.uniforms.uTime.value = elapsedTime;
      this.nakedEyeMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default NakedEye;
