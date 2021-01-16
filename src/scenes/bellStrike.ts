import * as THREE from "three";
import C from "cannon";
import { bellModelUrl } from "@/consts/bellStrike";
import { PhysicsBase } from "./base";
import { MeshPhysicsObject } from "@/utils/physics";

class BellStrike extends PhysicsBase {
  bellObj!: MeshPhysicsObject;
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
    this.lookAtPosition = new THREE.Vector3(0, -36, 0);
  }
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createLight();
    this.createPhysicsWorld();
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
    const mesh = model.children[0].parent!.children[3];
    this.scene.add(mesh);
    const halfExtents = new C.Vec3(50, 50, 50);
    const mass = 1;
    const position = new C.Vec3(0, 0, 0);
    const bodyOptions = { mass, position };
    const body = this.createPhysicsBox(halfExtents, bodyOptions);
    const bellObj = new MeshPhysicsObject(body, mesh);
    this.bellObj = bellObj;
  }
  // 动画
  update() {
    this.sync();
    this.world.step(1 / 60);
  }
  // 同步物理和渲染
  sync() {
    const { bellObj } = this;
    if (bellObj) {
      const { mesh, body } = bellObj;
      mesh.position.copy(body.position as any);
      mesh.quaternion.copy(body.quaternion as any);
    }
  }
}

export default BellStrike;
