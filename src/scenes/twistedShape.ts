import * as THREE from "three";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import twistedShapeVertexShader from "../shaders/twistedShape/vertex.glsl";
// @ts-ignore
import twistedShapeFragmentShader from "../shaders/twistedShape/fragment.glsl";

class TwistedShape extends Base {
  clock!: THREE.Clock;
  material!: THREE.ShaderMaterial;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 3);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createTwistedMaterial();
    this.createTwistedShape();
    this.createLight();
    this.createOrbitControls();
    // this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建扭曲材质
  createTwistedMaterial() {
    const material = new THREE.ShaderMaterial({
      vertexShader: twistedShapeVertexShader,
      fragmentShader: twistedShapeFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uVelocity: { value: 0.5 },
        uAxis: { value: new THREE.Vector3(0, 1, 0) },
        uDistortion: { value: 3 },
      },
    });
    this.material = material;
  }
  // 创建扭曲图形
  createTwistedShape() {
    const geometry = new THREE.TorusBufferGeometry(1, 0.3, 20, 45);
    const material = this.material;
    this.createMesh({ geometry, material });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    if (this.material) {
      this.material.uniforms.uTime.value = elapsedTime;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const { material } = this;
    const gui = new dat.GUI();
    gui
      .add(material.uniforms.uVelocity, "value")
      .min(0)
      .max(2)
      .step(0.01)
      .name("velocity");
    gui
      .add(material.uniforms.uAxis.value, "x")
      .min(0)
      .max(1)
      .step(1)
      .name("X");
    gui
      .add(material.uniforms.uAxis.value, "y")
      .min(0)
      .max(1)
      .step(1)
      .name("Y");
    gui
      .add(material.uniforms.uDistortion, "value")
      .min(0)
      .max(5)
      .step(0.01)
      .name("distortion");
  }
}

export default TwistedShape;
