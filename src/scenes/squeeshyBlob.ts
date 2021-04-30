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
  impulse!: any;
  lastMousePos!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 3);
    // this.currentColor = ky.sample(colors);
    this.currentColor = colors[28];
    this.params = {
      spikeCount: 24,
      spikeLength: 2,
      impulseIntensity: {
        x: 1.5,
        y: 0.6,
      },
      rotationAcceleration: 0.24,
      impulseDecay: {
        x: 0.9,
        y: 0.9,
      },
    };
    this.impulse = {
      x: 0,
      y: 0,
    };
    this.lastMousePos = {
      x: 0,
      y: 0,
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
    // this.createDebugPanel();
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
          value: this.params.spikeCount,
        },
        uSpikeLength: {
          value: this.params.spikeLength,
        },
        uColor1: {
          value: new THREE.Color(this.currentColor[0]),
        },
        uColor2: {
          value: new THREE.Color(this.currentColor[3]),
        },
        uImpulse: {
          value: new THREE.Vector2(this.impulse.x, this.impulse.y),
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
  // 根据鼠标移动计算力的大小
  calcImpulse() {
    const mousePos = this.mousePos;
    const deltaX = mousePos.x - this.lastMousePos.x;
    const deltaY = mousePos.y - this.lastMousePos.y;
    const direction =
      ((this.squeeshyBlob.rotation.x + Math.PI / 2) / Math.PI) % 2 > 1 ? -1 : 1;
    this.impulse.x += deltaX * this.params.impulseIntensity.x * direction;
    this.impulse.y -= deltaY * this.params.impulseIntensity.y;
    this.impulse.x *= this.params.impulseDecay.x;
    this.impulse.y *= this.params.impulseDecay.y;
    this.lastMousePos = { ...mousePos };
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.squeeshyBlobMaterial) {
      this.squeeshyBlobMaterial.uniforms.uTime.value = elapsedTime;
      this.squeeshyBlobMaterial.uniforms.uMouse.value = mousePos;
      this.calcImpulse();
      this.squeeshyBlob.rotation.y +=
        this.impulse.x * this.params.rotationAcceleration;
      this.squeeshyBlob.rotation.x +=
        this.impulse.y * this.params.rotationAcceleration;
      this.squeeshyBlobMaterial.uniforms.uSceneRotationY.value = this.squeeshyBlob.rotation.y;
      this.squeeshyBlobMaterial.uniforms.uImpulse.value = new THREE.Vector2(
        this.impulse.x,
        this.impulse.y
      );
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
