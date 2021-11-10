import * as THREE from "three";
import { Base } from "@/commons/base";
import { bgUrl, hdrUrl, normalMapUrl } from "@/consts/transmissionMaterial";
import { loadHDR } from "@/utils/loader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

class TransmissionMaterial extends Base {
  clock: THREE.Clock;
  physicalMaterial: THREE.MeshPhysicalMaterial;
  envmap: THREE.Texture;
  bloomPass!: UnrealBloomPass;
  bloomParams: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
    this.bloomParams = {
      bloomStrength: 0.5,
      bloomRadius: 0.33,
      bloomThreshold: 0.85,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    await this.loadEnvmap();
    this.createPhysicalMaterial();
    this.createSphere();
    this.createBg();
    this.createLight();
    this.createPostprocessingEffect();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createPhysicalMaterial() {
    const normalMap = new THREE.TextureLoader().load(normalMapUrl);
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    const material = new THREE.MeshPhysicalMaterial({
      roughness: 0.6, // frosted glass
      transmission: 1,
      // @ts-ignore
      thickness: 1.2, // refraction
      envMap: this.envmap,
      envMapIntensity: 1.5,
      normalMap,
      clearcoatNormalMap: normalMap,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });
    this.physicalMaterial = material;
  }
  // 创建球体
  createSphere() {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = this.physicalMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 创建光源
  createLight() {
    const dirLight = new THREE.DirectionalLight(0xfff0dd, 1);
    dirLight.position.set(0, 5, 10);
    this.scene.add(dirLight);
  }
  // 创建背景
  createBg() {
    const texture = new THREE.TextureLoader().load(bgUrl);
    const geometry = new THREE.PlaneGeometry(5, 5);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });
    const position = new THREE.Vector3(0, 0, -1);
    this.createMesh({
      geometry,
      material,
      position,
    });
  }
  // 加载envmap
  async loadEnvmap() {
    const envmap = await loadHDR(hdrUrl, this.renderer);
    this.envmap = envmap;
  }
  // 创建后期特效
  createPostprocessingEffect() {
    const composer = new EffectComposer(this.renderer);
    this.composer = composer;

    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    // unreal bloom
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.4,
      0.87,
      0.23
    );
    bloomPass.strength = this.bloomParams.bloomStrength;
    bloomPass.radius = this.bloomParams.bloomRadius;
    bloomPass.threshold = this.bloomParams.bloomThreshold;
    composer.addPass(bloomPass);
    this.bloomPass = bloomPass;
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.shaderMaterial) {
      this.shaderMaterial.uniforms.uTime.value = elapsedTime;
      this.shaderMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default TransmissionMaterial;
