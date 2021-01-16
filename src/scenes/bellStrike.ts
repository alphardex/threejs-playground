import * as THREE from "three";
import { bellModelUrl } from "@/consts/bellStrike";
import { PhysicsBase } from "./base";

class BellStrike extends PhysicsBase {
  constructor(sel: string, debug = false) {
    super(sel, debug);
    this.rendererParams = {
      outputEncoding: THREE.sRGBEncoding,
      config: {
        alpha: true,
        antialias: true,
      },
    };
    this.perspectiveCameraParams = {
      fov: 45,
      near: 1,
      far: 1000,
    };
    this.cameraPosition = new THREE.Vector3(-180, 50, -300);
    this.lookAtPosition = new THREE.Vector3(0, 25, 0);
  }
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createLight();
    await this.createBell();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建光
  createLight() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    this.scene.add(dirLight);
  }
  // 创建大钟
  async createBell() {
    const model = await this.loadModel(bellModelUrl);
    const bell = model.children[0];
    return bell;
  }
}

export default BellStrike;
