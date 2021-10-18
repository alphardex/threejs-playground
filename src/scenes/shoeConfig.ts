import * as THREE from "three";
import { Base } from "@/commons/base";
import shoeConfigVertexShader from "../shaders/shoeConfig/vertex.glsl";
import shoeConfigFragmentShader from "../shaders/shoeConfig/fragment.glsl";
import {
  flatModel,
  loadModel,
  printModel,
  RaycastSelector,
} from "@/utils/misc";
import { shoeModelUrl } from "@/consts/shoeConfig";

class ShoeConfig extends Base {
  clock: THREE.Clock;
  shoeConfigMaterial: THREE.ShaderMaterial;
  raycastSelector: RaycastSelector;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRaycastSelector();
    this.createRenderer();
    this.createShoeConfigMaterial();
    await this.createShoe();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建选择器
  createRaycastSelector() {
    this.raycastSelector = new RaycastSelector(this.scene, this.camera);
    this.raycastSelector.highlightIntersect();
  }
  // 创建材质
  createShoeConfigMaterial() {
    const shoeConfigMaterial = new THREE.ShaderMaterial({
      vertexShader: shoeConfigVertexShader,
      fragmentShader: shoeConfigFragmentShader,
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
    this.shoeConfigMaterial = shoeConfigMaterial;
  }
  // 创建鞋子
  async createShoe() {
    const model = await loadModel(shoeModelUrl, true);
    this.scene.add(model);
    const modelParts = flatModel(model);
    printModel(modelParts);
    const Scene = modelParts[0];
    const Shoe = modelParts[1];
    const shoe = modelParts[2];
    const shoe_1 = modelParts[3];
    const shoe_2 = modelParts[4];
    const shoe_3 = modelParts[5];
    const shoe_4 = modelParts[6];
    const shoe_5 = modelParts[7];
    const shoe_6 = modelParts[8];
    const shoe_7 = modelParts[9];
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.shoeConfigMaterial) {
      this.shoeConfigMaterial.uniforms.uTime.value = elapsedTime;
      this.shoeConfigMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default ShoeConfig;
