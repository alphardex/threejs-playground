import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import bouncyBalloonVertexShader from "../shaders/bouncyBalloon/vertex.glsl";
// @ts-ignore
import bouncyBalloonFragmentShader from "../shaders/bouncyBalloon/fragment.glsl";

class BouncyBalloon extends Base {
  clock!: THREE.Clock;
  bouncyBalloonMaterial!: THREE.ShaderMaterial;
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
    this.createBouncyBalloonMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createBouncyBalloonMaterial() {
    const bouncyBalloonMaterial = new THREE.ShaderMaterial({
      vertexShader: bouncyBalloonVertexShader,
      fragmentShader: bouncyBalloonFragmentShader,
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
    this.bouncyBalloonMaterial = bouncyBalloonMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.bouncyBalloonMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.bouncyBalloonMaterial) {
      this.bouncyBalloonMaterial.uniforms.uTime.value = elapsedTime;
      this.bouncyBalloonMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default BouncyBalloon;
