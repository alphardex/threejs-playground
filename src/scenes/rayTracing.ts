import * as THREE from "three";
import ky from "kyouka";
import gsap from "gsap";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import rayTracingVertexShader from "../shaders/rayTracing/vertex.glsl";
// @ts-ignore
import rayTracingFragmentShader from "../shaders/rayTracing/fragment.glsl";

class RayTracing extends Base {
  clock!: THREE.Clock;
  rayTracingMaterial!: THREE.ShaderMaterial;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.params = {
      uRefractionPower: 0.77,
      uLightChannelDelta: 0.02,
      uMorphPower: 0.99,
      uAngle: 0.75 * Math.PI,
      uZDistance: 5,
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer(true);
    this.createRayTracingMaterial();
    this.createPlane();
    this.createLight();
    this.createDebugPanel();
    this.trackMousePos();
    this.addListeners();
    this.setLoop();
    this.animate();
  }
  // 创建材质
  createRayTracingMaterial() {
    const rayTracingMaterial = new THREE.ShaderMaterial({
      vertexShader: rayTracingVertexShader,
      fragmentShader: rayTracingFragmentShader,
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
        uRefractionPower: {
          value: this.params.uRefractionPower,
        },
        uLightChannelDelta: {
          value: this.params.uLightChannelDelta,
        },
        uMorphPower: {
          value: this.params.uMorphPower,
        },
        uAngle: {
          value: this.params.uAngle,
        },
        uZDistance: {
          value: this.params.uZDistance,
        },
      },
    });
    this.rayTracingMaterial = rayTracingMaterial;
    this.shaderMaterial = rayTracingMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
    const material = this.rayTracingMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  animate() {
    gsap.to(this.rayTracingMaterial.uniforms.uMorphPower, {
      keyframes: [
        { value: 0.01, duration: 1.6, delay: 0.6 },
        { value: 0.99, duration: 1, delay: 0.6 },
      ],
      repeat: -1,
      ease: "sine.out",
    });
    gsap.to(this.rayTracingMaterial.uniforms.uLightChannelDelta, {
      keyframes: [
        { value: 0.15, duration: 1.6, delay: 0.6 },
        { value: 0.02, duration: 1, delay: 0.6 },
      ],
      repeat: -1,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.rayTracingMaterial) {
      this.rayTracingMaterial.uniforms.uTime.value = elapsedTime;
      this.rayTracingMaterial.uniforms.uMouse.value = mousePos;
      this.rayTracingMaterial.uniforms.uAngle.value += 0.02;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    const uniforms = this.rayTracingMaterial.uniforms;
    gui
      .add(uniforms.uRefractionPower, "value")
      .min(0)
      .max(1)
      .name("uRefractionPower");
    gui
      .add(uniforms.uLightChannelDelta, "value")
      .min(0)
      .max(0.2)
      .name("uLightChannelDelta");
    gui
      .add(uniforms.uMorphPower, "value")
      .min(0.01)
      .max(0.99)
      .name("uMorphPower");
    gui
      .add(uniforms.uAngle, "value")
      .min(0)
      .max(6.28)
      .name("uAngle");
    gui
      .add(uniforms.uZDistance, "value")
      .min(0)
      .max(10)
      .name("uZDistance");
  }
}

export default RayTracing;
