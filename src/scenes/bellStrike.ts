import * as THREE from "three";
import C from "cannon";
import { bellModelUrl, woodTextureUrl } from "@/consts/bellStrike";
import { PhysicsBase } from "./base";
import { MeshPhysicsObject } from "@/utils/physics";

class BellStrike extends PhysicsBase {
  bellObj!: MeshPhysicsObject;
  stickObj!: MeshPhysicsObject;
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
    this.lookAtPosition = new THREE.Vector3(0, 0, 0);
    this.gravity = new C.Vec3(0, -10, 0);
  }
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createLight();
    this.createWorld();
    this.createGround();
    await this.createBell();
    this.createStick();
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
    const halfExtents = new C.Vec3(25, 50, 25);
    const mass = 1;
    const position = new C.Vec3(0, 0, 0);
    const bodyOptions = { mass, position };
    const body = this.createBody(
      new C.Box(halfExtents),
      new C.Body(bodyOptions)
    );
    const bellObj = new MeshPhysicsObject(mesh, body);
    this.bellObj = bellObj;
    this.meshPhysicsObjs.push(bellObj);
  }
  // 创建木棍
  createStick() {
    const loader = new THREE.TextureLoader();
    const geometry = new THREE.BoxGeometry(50, 10, 10);
    const material = new THREE.MeshBasicMaterial({
      map: loader.load(woodTextureUrl),
    });
    const mesh = this.createMesh({
      geometry,
      material,
    });
    const halfExtents = new C.Vec3(25, 5, 5);
    const mass = 0;
    const position = new C.Vec3(-80, 0, 0);
    const bodyOptions = { mass, position };
    const body = this.createBody(
      new C.Box(halfExtents),
      new C.Body(bodyOptions)
    );
    const stickObj = new MeshPhysicsObject(mesh, body);
    this.stickObj = stickObj;
    this.meshPhysicsObjs.push(stickObj);
  }
  // 创建地面
  createGround() {
    const halfExtents = new C.Vec3(50, 0.1, 50);
    const mass = 0;
    const position = new C.Vec3(0, -50, 0);
    const bodyOptions = { mass, position };
    this.createBody(new C.Box(halfExtents), new C.Body(bodyOptions));
  }
}

export default BellStrike;
