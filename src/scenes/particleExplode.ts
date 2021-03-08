import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import particleExplodeVertexShader from "../shaders/particleExplode/vertex.glsl";
// @ts-ignore
import particleExplodeFragmentShader from "../shaders/particleExplode/fragment.glsl";
import { particleExplodeVideo1FirstUrl } from "@/consts/particleExplode";

class ParticleExplode extends Base {
  clock!: THREE.Clock;
  particleExplodeMaterial!: THREE.ShaderMaterial;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1500);
    this.perspectiveCameraParams = {
      fov: 75,
      near: 0.1,
      far: 5000,
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createParticleExplodeMaterial();
    this.createPoints();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createParticleExplodeMaterial() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(particleExplodeVideo1FirstUrl);
    const particleExplodeMaterial = new THREE.ShaderMaterial({
      vertexShader: particleExplodeVertexShader,
      fragmentShader: particleExplodeFragmentShader,
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
        uProgress: {
          value: 0,
        },
        uTexture: {
          value: texture,
        },
      },
    });
    this.particleExplodeMaterial = particleExplodeMaterial;
  }
  // 创建点
  createPoints() {
    const ratio = 0.3;
    const geometry = new THREE.PlaneBufferGeometry(
      480 * 1.5,
      820 * 1.5,
      480 * ratio,
      820 * ratio
    );
    const material = this.particleExplodeMaterial;
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.particleExplodeMaterial) {
      this.particleExplodeMaterial.uniforms.uTime.value = elapsedTime;
      this.particleExplodeMaterial.uniforms.uMouse.value = mousePos;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    const uniforms = this.particleExplodeMaterial.uniforms;
    gui
      .add(uniforms.uProgress, "value")
      .min(0)
      .max(1)
      .step(0.01)
      .name("progress");
  }
}

export default ParticleExplode;
