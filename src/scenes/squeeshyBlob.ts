import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
// @ts-ignore
import colors from "nice-color-palettes";
import { Base } from "./base";
// @ts-ignore
import squeeshyBlobVertexShader from "../shaders/squeeshyBlob/vertex.glsl";
// @ts-ignore
import squeeshyBlobFragmentShader from "../shaders/squeeshyBlob/fragment.glsl";

class SqueeshyBlob extends Base {
  clock!: THREE.Clock;
  squeeshyBlobMaterial!: THREE.ShaderMaterial;
  squeeshyBlob!: THREE.Mesh;
  colorParams!: any;
  currentColor!: any;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 3);
    this.currentColor = ky.sample(colors);
    this.params = {
      rotationYVelocity: 0.005,
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createSqueeshyBlobMaterial();
    this.createSphere();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createSqueeshyBlobMaterial() {
    const squeeshyBlobMaterial = new THREE.ShaderMaterial({
      vertexShader: squeeshyBlobVertexShader,
      fragmentShader: squeeshyBlobFragmentShader,
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
        uSpikeCount: {
          value: 2,
        },
        uSpikeLength: {
          value: 10,
        },
        uColor1: {
          value: new THREE.Color(this.currentColor[0]),
        },
        uColor2: {
          value: new THREE.Color(this.currentColor[3]),
        },
        uImpulse: {
          value: new THREE.Vector2(0, 0),
        },
        uSceneRotationY: {
          value: 0,
        },
      },
    });
    this.squeeshyBlobMaterial = squeeshyBlobMaterial;
  }
  // 创建球体
  createSphere() {
    const geometry = new THREE.SphereBufferGeometry(1, 256, 256);
    const material = this.squeeshyBlobMaterial;
    const mesh = this.createMesh({
      geometry,
      material,
    });
    this.squeeshyBlob = mesh;
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.squeeshyBlobMaterial) {
      this.squeeshyBlobMaterial.uniforms.uTime.value = elapsedTime;
      this.squeeshyBlobMaterial.uniforms.uMouse.value = mousePos;
      this.squeeshyBlob.rotation.y += this.params.rotationYVelocity;
      this.squeeshyBlobMaterial.uniforms.uSceneRotationY.value = this.squeeshyBlob.rotation.y;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI({ width: 300 });
    const uniforms = this.squeeshyBlobMaterial.uniforms;
    gui
      .add(uniforms.uImpulse.value, "x")
      .min(0)
      .max(1.5)
      .step(0.01)
      .name("impulseX");
    gui
      .add(uniforms.uImpulse.value, "y")
      .min(0)
      .max(0.5)
      .step(0.01)
      .name("impulseY");
  }
}

export default SqueeshyBlob;
