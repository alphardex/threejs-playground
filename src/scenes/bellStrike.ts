import * as THREE from "three";
import C from "cannon";
import { bellModelUrl, woodTextureUrl } from "@/consts/bellStrike";
import { PhysicsBase } from "./base";
import { MeshPhysicsObject } from "@/utils/physics";

class BellStrike extends PhysicsBase {
  bellObj!: MeshPhysicsObject;
  stickObj!: MeshPhysicsObject;
  groundMat!: C.Material;
  stickMat!: C.Material;
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
    this.createContactMaterial();
    await this.createBell();
    this.createStick();
    this.createRaycaster();
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
    this.createGround(new C.Vec3(100, 0.1, 100), new C.Vec3(0, -50, 0));
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
    const mass = 1;
    const position = new C.Vec3(-60, 0, 0);
    const bodyOptions = { mass, position, material: this.stickMat };
    const body = this.createBody(
      new C.Box(halfExtents),
      new C.Body(bodyOptions)
    );
    const stickObj = new MeshPhysicsObject(mesh, body);
    this.stickObj = stickObj;
    this.meshPhysicsObjs.push(stickObj);
    this.createGround(
      new C.Vec3(24, 0.1, 25),
      new C.Vec3(-60, -5.5, 0),
      this.groundMat
    );
  }
  // 创建地面
  createGround(
    halfExtents: C.Vec3,
    position: C.Vec3,
    material: C.Material | undefined = undefined
  ) {
    const mass = 0;
    const bodyOptions = { mass, position, material };
    this.createBody(new C.Box(halfExtents), new C.Body(bodyOptions));
    if (this.debug) {
      this.createMesh({
        geometry: new THREE.BoxGeometry(
          halfExtents.x * 2,
          halfExtents.y * 2,
          halfExtents.z * 2
        ),
        position: new THREE.Vector3(position.x, position.y, position.z),
      });
    }
  }
  // 监听事件
  addListeners() {
    this.onResize();
    this.onMousemove();
    this.onClick();
  }
  // 监听点击
  onClick() {
    document.addEventListener("click", () => {
      const intersects = this.getInterSects();
      const intersect = intersects[0];
      if (!intersect || !intersect.face) {
        return;
      }
      const { object } = intersect;
      const { stickObj } = this;
      const { mesh } = stickObj;
      if (mesh !== object) {
        return;
      }
      this.strikeBell();
    });
  }
  // 撞钟
  strikeBell() {
    const { stickObj } = this;
    const { body } = stickObj;
    const impulse = new C.Vec3(25, 0, 0);
    body.applyLocalImpulse(impulse, new C.Vec3());
  }
  // 创建联系材质
  createContactMaterial() {
    const groundMat = new C.Material("ground");
    const stickMat = new C.Material("stick");
    const contactMat = new C.ContactMaterial(groundMat, stickMat, {
      friction: 0,
    });
    this.world.addContactMaterial(contactMat);
    this.groundMat = groundMat;
    this.stickMat = stickMat;
  }
}

export default BellStrike;
