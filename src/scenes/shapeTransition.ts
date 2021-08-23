import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import shapeTransitionVertexShader from "../shaders/shapeTransition/vertex.glsl";
// @ts-ignore
import shapeTransitionFragmentShader from "../shaders/shapeTransition/fragment.glsl";

class ShapeTransition extends Base {
  clock!: THREE.Clock;
  shapeTransitionMaterial!: THREE.ShaderMaterial;
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
    this.createShapeTransitionMaterial();
    this.createPlane();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createShapeTransitionMaterial() {
    const shapeTransitionMaterial = new THREE.ShaderMaterial({
      vertexShader: shapeTransitionVertexShader,
      fragmentShader: shapeTransitionFragmentShader,
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
    this.shapeTransitionMaterial = shapeTransitionMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.shapeTransitionMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.shapeTransitionMaterial) {
      this.shapeTransitionMaterial.uniforms.uTime.value = elapsedTime;
      this.shapeTransitionMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default ShapeTransition;
