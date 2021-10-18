import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import gsap from "gsap";
import { Base } from "@/commons/base";
// @ts-ignore
import noiseMaterialVertexShader from "../shaders/noiseMaterial/vertex.glsl";
// @ts-ignore
import noiseMaterialFragmentShader from "../shaders/noiseMaterial/fragment.glsl";
import { perlinNoiseTextureUrl } from "@/consts/noiseMaterial";
import { RaycastSelector } from "@/utils/raycast";

class NoiseMaterial extends Base {
  clock!: THREE.Clock;
  noiseMaterialMaterial!: THREE.ShaderMaterial;
  mesh!: THREE.Mesh;
  isOpen!: boolean;
  raycastSelector: RaycastSelector;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1.8);
    this.isOpen = false;
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.raycastSelector = new RaycastSelector(this.scene, this.camera);
    this.createRenderer();
    this.createNoiseMaterialMaterial();
    this.createBox();
    this.createLight();
    this.createOrbitControls();
    this.createClickEffect();
    // this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createNoiseMaterialMaterial() {
    const noiseMaterialMaterial = new THREE.ShaderMaterial({
      vertexShader: noiseMaterialVertexShader,
      fragmentShader: noiseMaterialFragmentShader,
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
        uPerlinNoiseTexture: {
          value: new THREE.TextureLoader().load(perlinNoiseTextureUrl),
        },
        uTransitionProgress: {
          value: 0,
        },
      },
    });
    this.noiseMaterialMaterial = noiseMaterialMaterial;
  }
  // 创建方块
  createBox() {
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 10, 10, 10);
    const material = this.noiseMaterialMaterial;
    const mesh = this.createMesh({
      geometry,
      material,
    });
    this.mesh = mesh;
  }
  // 创建点击效果
  createClickEffect() {
    window.addEventListener("click", () => {
      this.onClickMesh();
    });
    window.addEventListener("touchstart", () => {
      this.onClickMesh();
    });
  }
  // 点击物体时
  onClickMesh() {
    const mesh = this.mesh;
    if (this.raycastSelector.onChooseIntersect(mesh)) {
      const material = this.noiseMaterialMaterial;
      if (!this.isOpen) {
        gsap.to(material.uniforms.uTransitionProgress, {
          value: 1,
          duration: 1.2,
        });
        this.isOpen = true;
      } else {
        gsap.to(material.uniforms.uTransitionProgress, {
          value: 0,
          duration: 1.2,
        });
        this.isOpen = false;
      }
    }
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.noiseMaterialMaterial) {
      this.noiseMaterialMaterial.uniforms.uTime.value = elapsedTime;
      this.noiseMaterialMaterial.uniforms.uMouse.value = mousePos;
      this.mesh.rotation.x = elapsedTime;
      this.mesh.rotation.y = elapsedTime;
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI({ width: 300 });
    const material = this.noiseMaterialMaterial;
    const uniforms = material.uniforms;
    gui
      .add(uniforms.uTransitionProgress, "value")
      .min(0)
      .max(1)
      .step(0.01)
      .name("transitionProgress");
  }
}

export default NoiseMaterial;
