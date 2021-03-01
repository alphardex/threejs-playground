import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import distortImageVertexShader from "../shaders/distortImage/vertex.glsl";
// @ts-ignore
import distortImageFragmentShader from "../shaders/distortImage/fragment.glsl";
import { distortImageTextureUrl } from "@/consts/distortImage";

class DistortImage extends Base {
  clock!: THREE.Clock;
  distortImageMaterial!: THREE.ShaderMaterial;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createDistortImageMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createDistortImageMaterial() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(distortImageTextureUrl);
    const distortImageMaterial = new THREE.ShaderMaterial({
      vertexShader: distortImageVertexShader,
      fragmentShader: distortImageFragmentShader,
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
      },
    });
    this.distortImageMaterial = distortImageMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 150, 150);
    const material = this.distortImageMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.distortImageMaterial) {
      this.distortImageMaterial.uniforms.uTime.value = elapsedTime;
      this.distortImageMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default DistortImage;
