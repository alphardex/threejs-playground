import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import morphParticlesVertexShader from "../shaders/morphParticles/vertex.glsl";
// @ts-ignore
import morphParticlesFragmentShader from "../shaders/morphParticles/fragment.glsl";

class MorphParticles extends Base {
  clock!: THREE.Clock;
  morphParticlesMaterial!: THREE.ShaderMaterial;
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
    this.createMorphParticlesMaterial();
    this.createParticleSphere();
    this.createLight();
    this.trackMousePos();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createMorphParticlesMaterial() {
    const morphParticlesMaterial = new THREE.ShaderMaterial({
      vertexShader: morphParticlesVertexShader,
      fragmentShader: morphParticlesFragmentShader,
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
    this.morphParticlesMaterial = morphParticlesMaterial;
  }
  // 创建微粒球体
  createParticleSphere() {
    const geometry = new THREE.SphereBufferGeometry(1, 128, 128);
    const material = this.morphParticlesMaterial;
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.morphParticlesMaterial) {
      this.morphParticlesMaterial.uniforms.uTime.value = elapsedTime;
      this.morphParticlesMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default MorphParticles;
