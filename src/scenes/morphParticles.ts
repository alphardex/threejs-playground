import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import morphParticlesVertexShader from "../shaders/morphParticles/vertex.glsl";
// @ts-ignore
import morphParticlesFragmentShader from "../shaders/morphParticles/fragment.glsl";
import gsap from "gsap";

class MorphParticles extends Base {
  clock!: THREE.Clock;
  morphParticlesMaterial!: THREE.ShaderMaterial;
  params!: any;
  currentTransition!: number;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
    this.params = {
      rotateSpeed: 0.01,
    };
    this.currentTransition = 0;
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createMorphParticlesMaterial();
    this.createParticles();
    this.createLight();
    // this.createDebugPanel();
    this.trackMousePos();
    this.onClickParticles();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createMorphParticlesMaterial() {
    const morphParticlesMaterial = new THREE.ShaderMaterial({
      vertexShader: morphParticlesVertexShader,
      fragmentShader: morphParticlesFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
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
        uTransition1: {
          value: 0,
        },
        uTransition2: {
          value: 0,
        },
      },
    });
    this.morphParticlesMaterial = morphParticlesMaterial;
  }
  // 创建微粒体
  createParticles() {
    const geometry = new THREE.BufferGeometry();

    // sphere
    const sphereGeometry = new THREE.SphereBufferGeometry(1, 128, 128);
    const spherePositions = this.sampleParticlesPositionFromMesh(
      sphereGeometry.toNonIndexed()
    );
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(spherePositions, 3)
    );

    // box
    const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 128, 128);
    const boxPositions = this.sampleParticlesPositionFromMesh(
      boxGeometry.toNonIndexed()
    );
    geometry.setAttribute(
      "aPositionBox",
      new THREE.BufferAttribute(boxPositions, 3)
    );

    // torus
    const torusGeometry = new THREE.TorusBufferGeometry(0.6, 0.4, 128, 128);
    const torusPositions = this.sampleParticlesPositionFromMesh(
      torusGeometry.toNonIndexed()
    );
    geometry.setAttribute(
      "aPositionTorus",
      new THREE.BufferAttribute(torusPositions, 3)
    );

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
    const rotateSpeed = this.params.rotateSpeed;
    this.scene.rotation.x += rotateSpeed;
    this.scene.rotation.y += rotateSpeed;
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    const uniforms = this.morphParticlesMaterial.uniforms;
    gui
      .add(uniforms.uTransition1, "value")
      .min(0)
      .max(1)
      .step(0.01)
      .name("transition1");
  }
  // 监听点击微粒
  onClickParticles() {
    document.addEventListener("click", () => {
      this.changeParticles();
    });
  }
  // 改变微粒
  changeParticles() {
    let currentTransition = this.currentTransition;
    const uniforms = this.morphParticlesMaterial.uniforms;
    console.log(currentTransition);
    if (currentTransition === 0) {
      gsap.to(uniforms.uTransition1, {
        value: 1,
      });
      this.currentTransition += 1;
    } else if (currentTransition === 1) {
      gsap.to(uniforms.uTransition2, {
        value: 1,
      });
      this.currentTransition += 1;
    } else if (currentTransition === 2) {
      gsap.to(uniforms.uTransition2, {
        value: 0,
      });
      this.currentTransition += 1;
    } else if (currentTransition === 3) {
      gsap.to(uniforms.uTransition1, {
        value: 0,
      });
      this.currentTransition = 0;
    }
  }
}

export default MorphParticles;
