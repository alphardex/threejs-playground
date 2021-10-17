import * as THREE from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import hyperbolicHelicoidColorFragmentShader from "../shaders/hyperbolicHelicoid/color/fragment.glsl";
// @ts-ignore
import hyperbolicHelicoidFunctionFragmentShader from "../shaders/hyperbolicHelicoid/function/fragment.glsl";
import { hyperbolicHelicoidFunction } from "@/utils/math";
import {
  hyperbolicHelicoidMatcapTextureUrl1,
  hyperbolicHelicoidMatcapTextureUrl2,
} from "@/consts/hyperbolicHelicoid";

class HyperbolicHelicoid extends Base {
  clock!: THREE.Clock;
  hyperbolicHelicoidMaterial!: THREE.MeshPhysicalMaterial;
  hyperbolicHelicoid!: THREE.Mesh;
  params!: any;
  uniforms!: any;
  ball1!: THREE.Mesh;
  ball2!: THREE.Mesh;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
    this.params = {
      ballRadius: 0.2,
      ballRotateRadius: 0.6,
      speed: 0.5,
    };
    this.uniforms = {
      uTime: {
        value: 0,
      },
      uTexture1: {
        value: new THREE.TextureLoader().load(
          hyperbolicHelicoidMatcapTextureUrl1
        ),
      },
      uTexture2: {
        value: new THREE.TextureLoader().load(
          hyperbolicHelicoidMatcapTextureUrl2
        ),
      },
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.enableShadow();
    this.usePCFSoftShadowMap();
    this.createHyperbolicHelicoidMaterial();
    this.createHyperbolicHelicoid();
    this.createTwoBalls();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    // this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 允许投影
  enableShadow() {
    this.renderer.shadowMap.enabled = true;
  }
  // 使用PCFSoft阴影
  usePCFSoftShadowMap() {
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  // 创建材质
  createHyperbolicHelicoidMaterial() {
    const hyperbolicHelicoidMaterial = new THREE.MeshPhysicalMaterial({
      roughness: 0,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.4,
      side: THREE.DoubleSide,
    });
    hyperbolicHelicoidMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTexture = this.uniforms.uTexture1;
      this.modifyShader(shader);
    };
    this.hyperbolicHelicoidMaterial = hyperbolicHelicoidMaterial;
  }
  // 修改shader
  modifyShader(shader: THREE.Shader) {
    const CLIPPING_SHADER = "#include <clipping_planes_pars_fragment>";
    const MODIFIED_CLIPPING_SHADER = `
${CLIPPING_SHADER}
${hyperbolicHelicoidFunctionFragmentShader}`;
    const LOGDEPTHBUF_SHADER = "#include <logdepthbuf_fragment>";
    const MODIFIED_LOGDEPTHBUF_SHADER = `
${LOGDEPTHBUF_SHADER}
${hyperbolicHelicoidColorFragmentShader}`;
    shader.fragmentShader = shader.fragmentShader
      .replace(CLIPPING_SHADER, MODIFIED_CLIPPING_SHADER)
      .replace(LOGDEPTHBUF_SHADER, MODIFIED_LOGDEPTHBUF_SHADER);
  }
  // 创建双曲螺旋体
  createHyperbolicHelicoid() {
    const geometry = new ParametricGeometry(
      hyperbolicHelicoidFunction,
      128,
      128
    );
    const material = this.hyperbolicHelicoidMaterial;
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTexture = this.uniforms.uTexture1;
      this.modifyShader(shader);
    };
    const hyperbolicHelicoid = this.createMesh({
      geometry,
      material,
    });
    hyperbolicHelicoid.castShadow = true;
    hyperbolicHelicoid.receiveShadow = true;
    this.hyperbolicHelicoid = hyperbolicHelicoid;
  }
  // 创建双珠
  createTwoBalls() {
    const r = this.params.ballRadius;
    const geometry = new THREE.IcosahedronBufferGeometry(r, 5);
    const material = this.hyperbolicHelicoidMaterial.clone();
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTexture = this.uniforms.uTexture2;
      this.modifyShader(shader);
    };
    const ball1 = this.createMesh({
      geometry,
      material,
    });
    ball1.receiveShadow = true;
    ball1.castShadow = true;
    const ball2 = ball1.clone();
    this.scene.add(ball2);
    this.ball1 = ball1;
    this.ball2 = ball2;
  }
  // 创建光源
  createLight() {
    const dirLight = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 3);
    dirLight.position.set(1, 1, 1);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    this.scene.add(dirLight);
    const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 1);
    this.scene.add(ambiLight);
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const speed = this.params.speed;
    const displacement = elapsedTime * speed;
    this.uniforms.uTime.value = elapsedTime;
    if (this.hyperbolicHelicoid) {
      this.hyperbolicHelicoid.rotation.y = ky.deg2rad(360) * displacement;
    }
    if (this.ball1 && this.ball2) {
      const r = this.params.ballRotateRadius;
      const theta1 = ky.deg2rad(360) * displacement;
      const theta2 = ky.deg2rad(360) * displacement + ky.deg2rad(180);
      this.ball1.position.x = r * Math.sin(theta1);
      this.ball1.position.z = r * Math.cos(theta1);
      this.ball2.position.x = r * Math.sin(theta2);
      this.ball2.position.z = r * Math.cos(theta2);
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI({ width: 300 });
    gui.add(this.params, "ballRotateRadius").min(0).max(1).step(0.01);
    gui.add(this.params, "speed").min(0).max(1).step(0.01);
  }
}

export default HyperbolicHelicoid;
