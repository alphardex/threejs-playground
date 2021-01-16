import * as THREE from "three";
import { bellModelUrl } from "@/consts/bellStrike";
import { PhysicsBase } from "./base";

class BellStrike extends PhysicsBase {
  constructor(sel: string, debug = false) {
    super(sel, debug);
    this.perspectiveCameraParams = {
      fov: 45,
      near: 1,
      far: 1000,
    };
    this.cameraPosition = new THREE.Vector3(1, 2, -3);
    this.lookAtPosition = new THREE.Vector3(0, 1, 0);
  }
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    await this.loadModel(bellModelUrl);
    this.createLight();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  createLight() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    this.scene.add(dirLight);
  }
}

export default BellStrike;
