import * as THREE from "three";
import C from "cannon";
import {
  bellAudioUrl,
  bellModelUrl,
  woodTextureUrl,
} from "@/consts/bellStrike";
import { PhysicsBase } from "./base";
import { MeshPhysicsObject } from "@/utils/physics";

class BellStrike extends PhysicsBase {
  bellObj!: MeshPhysicsObject;
  stickObj!: MeshPhysicsObject;
  hingeBellObj!: MeshPhysicsObject;
  hingeStickObj!: MeshPhysicsObject;
  groundMat!: C.Material;
  stickMat!: C.Material;
  bellMat!: C.Material;
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
    this.cameraPosition = new THREE.Vector3(0, 5, -20);
    this.lookAtPosition = new THREE.Vector3(0, 1, 0);
    this.gravity = new C.Vec3(0, -10, 0);
  }
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createLight();
    this.createAudioSource();
    await this.loadAudio(bellAudioUrl);
    this.createWorld();
    const hingeBellObj = this.createHinge(new THREE.Vector3(0, 7, 0));
    this.hingeBellObj = hingeBellObj;
    const hingeStickObj = this.createHinge(new THREE.Vector3(-5, 7, 0));
    this.hingeStickObj = hingeStickObj;
    await this.createBell();
    this.createStick();
    this.createConstraints();
    this.createContactMaterial();
    this.detectCollision();
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
    mesh.scale.set(0.001, 0.001, 0.001);
    this.scene.add(mesh);
    const body = this.createBody(
      new C.Sphere(1),
      new C.Body({
        mass: 2.5,
        position: new C.Vec3(0, 3, 0),
        material: this.bellMat,
      })
    );
    const bellObj = new MeshPhysicsObject(mesh, body);
    this.bellObj = bellObj;
    this.meshPhysicsObjs.push(bellObj);
    this.createGround(new C.Vec3(10, 0.1, 10), new C.Vec3(0, 0, 0));
  }
  // 创建悬挂点
  createHinge(position: THREE.Vector3) {
    const mesh = this.createMesh({
      geometry: new THREE.SphereGeometry(0.1),
      position,
      material: new THREE.MeshPhongMaterial(),
    });
    const body = this.createBody(
      new C.Sphere(0.1),
      new C.Body({
        mass: 0,
        position: new C.Vec3().copy(mesh.position as any),
      })
    );
    const hingeObj = new MeshPhysicsObject(mesh, body);
    this.meshPhysicsObjs.push(hingeObj);
    return hingeObj;
  }
  // 创建木棍
  createStick() {
    const loader = new THREE.TextureLoader();
    const mesh = this.createMesh({
      geometry: new THREE.BoxGeometry(5, 0.5, 0.5),
      material: new THREE.MeshBasicMaterial({
        map: loader.load(woodTextureUrl),
      }),
    });
    const body = this.createBody(
      new C.Box(new C.Vec3(2.5, 0.25, 0.25)),
      new C.Body({
        mass: 1,
        position: new C.Vec3(-5, 3.6, 0),
        material: this.stickMat,
      })
    );
    const stickObj = new MeshPhysicsObject(mesh, body);
    this.stickObj = stickObj;
    this.meshPhysicsObjs.push(stickObj);
  }
  // 创建地面
  createGround(
    halfExtents: C.Vec3,
    position: C.Vec3,
    material: C.Material | undefined = undefined
  ) {
    this.createBody(
      new C.Box(halfExtents),
      new C.Body({
        mass: 0,
        position,
        material,
      })
    );
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
    this.onClick();
  }
  // 监听点击
  onClick() {
    window.addEventListener("click", () => {
      this.onClickStick();
    });
    window.addEventListener("touchstart", () => {
      this.onClickStick();
    });
  }
  // 点击木棍时
  onClickStick() {
    const intersect = this.onChooseIntersect(this.stickObj.mesh);
    if (intersect) {
      this.strikeBell();
    }
  }
  // 撞钟
  strikeBell() {
    const { stickObj } = this;
    const { body } = stickObj;
    const impulse = new C.Vec3(5, 0, 0);
    body.applyLocalImpulse(impulse, new C.Vec3());
  }
  // 碰撞检测
  detectCollision() {
    const stick = this.stickObj.body;
    stick.addEventListener("collide", (e: any) => {
      const target = e.body;
      const bell = this.bellObj.body;
      if (target === bell) {
        this.bellObj.body.angularDamping = 0.9;
        this.stickObj.body.angularDamping = 1;
        this.stickObj.body.linearDamping = 0.4;
        if (!this.sound.isPlaying) {
          this.sound.play();
        }
      }
    });
  }
  // 创建联系材质
  createContactMaterial() {
    const groundMat = new C.Material("ground");
    const stickMat = new C.Material("stick");
    const bellMat = new C.Material("bell");
    const contactMat1 = new C.ContactMaterial(groundMat, stickMat, {
      friction: 0,
    });
    this.world.addContactMaterial(contactMat1);
    this.groundMat = groundMat;
    this.stickMat = stickMat;
    this.bellMat = bellMat;
  }
  // 添加约束条件
  createConstraints() {
    const bellConstraint = new C.PointToPointConstraint(
      this.bellObj.body,
      new C.Vec3(0, 2, 0),
      this.hingeBellObj.body,
      new C.Vec3(0, -2, 0)
    );
    this.world.addConstraint(bellConstraint);
    const stickConstraint1 = new C.DistanceConstraint(
      this.stickObj.body,
      this.hingeStickObj.body,
      4
    );
    this.world.addConstraint(stickConstraint1);
  }
}

export default BellStrike;
