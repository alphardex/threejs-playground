import * as THREE from "three";
import { Base } from "@/commons/base";
import { loadModel, flatModel, printModel } from "@/utils/loader";
import { RaycastSelector } from "@/utils/raycast";
import { shoeModelUrl } from "@/consts/shoeConfig";

class ShoeConfig extends Base {
  clock: THREE.Clock;
  raycastSelector: RaycastSelector;
  modelParts: THREE.Object3D[];
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
    await this.createShoe();
    this.createLight();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建选择器
  createRaycastSelector() {
    this.raycastSelector = new RaycastSelector(this.scene, this.camera);
  }
  // 创建鞋子
  async createShoe() {
    const model = await loadModel(shoeModelUrl, true);
    this.scene.add(model.scene);
    const modelParts = flatModel(model.scene);
    printModel(modelParts);
    this.modelParts = modelParts;
  }
  // 选中鞋的部件时
  onSelectShoeComponent() {
    const modelParts = this.modelParts;
    const shoeComponents = modelParts.slice(2);
    const intersect = this.raycastSelector.getFirstIntersect(shoeComponents);
    return intersect?.object;
  }
}

export default ShoeConfig;
