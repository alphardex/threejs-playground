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
    this.cameraPosition = new THREE.Vector3(0, 0, 1);
    this.params = {
      refractionPower: 0.77,
      lightChannelDelta: 0.02,
      morphPower: 0.99,
      angle: 0.75 * Math.PI,
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
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
        refractionPower: {
          value: this.params.refractionPower,
        },
        lightChannelDelta: {
          value: this.params.lightChannelDelta,
        },
        morphPower: {
          value: this.params.morphPower,
        },
        angle: {
          value: this.params.angle,
        },
      },
      defines: {
        AA: 2,
      },
    });
    this.rayTracingMaterial = rayTracingMaterial;
    this.shaderMaterial = rayTracingMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
    const material = this.rayTracingMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  animate() {
    gsap.to(this.rayTracingMaterial.uniforms.morphPower, {
      keyframes: [
        { value: 0.01, duration: 1.6, delay: 0.6 },
        { value: 0.99, duration: 1, delay: 0.6 },
      ],
      repeat: -1,
      ease: "sine.out",
    });
    gsap.to(this.rayTracingMaterial.uniforms.lightChannelDelta, {
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
      this.rayTracingMaterial.uniforms.angle.value += 0.02;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    const uniforms = this.rayTracingMaterial.uniforms;
    gui
      .add(uniforms.refractionPower, "value")
      .min(0)
      .max(1)
      .name("refractionPower");
    gui
      .add(uniforms.lightChannelDelta, "value")
      .min(0)
      .max(0.2)
      .name("lightChannelDelta");
    gui
      .add(uniforms.morphPower, "value")
      .min(0.01)
      .max(0.99)
      .name("morphPower");
    gui
      .add(uniforms.angle, "value")
      .min(0)
      .max(6.28)
      .name("angle");
  }
}

export default RayTracing;
