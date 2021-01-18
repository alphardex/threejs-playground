import * as THREE from "three";
import C from "cannon";
import {
  bellAudioUrl,
  bellModelUrl,
  pavilionModelUrl,
  woodTextureUrl,
} from "@/consts/bellStrike";
import { PhysicsBase } from "./base";
import { MeshPhysicsObject } from "@/utils/physics";

class BellStrike extends PhysicsBase {
  bellObj!: MeshPhysicsObject;
  stickObj!: MeshPhysicsObject;
  hingeBellObj!: MeshPhysicsObject;
  hingeStickObj!: MeshPhysicsObject;
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
    this.createAudioSource();
    await this.loadAudio(bellAudioUrl);
    this.createRaycaster();
    this.createOrbitControls();
    this.createWorld();
    this.createLight();
    await this.createPavilion();
    await this.createBell();
    this.createStick();
    this.createHingeBell();
    this.createHingeStick();
    this.createConstraints();
    this.addListeners();
    this.setLoop();
    this.detectCollision();
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
  // 创建亭子
  async createPavilion() {
    const mesh = await this.loadFBXModel(pavilionModelUrl);
    mesh.position.set(0, 5, 0);
    mesh.scale.set(0.002, 0.002, 0.002);
    mesh.rotateZ(Math.PI / 2);
    this.scene.add(mesh);
  }
  // 创建大钟
  async createBell() {
    const model = await this.loadModel(bellModelUrl);
    const mesh = model.children[0].parent!.children[3];
    mesh.scale.set(0.001, 0.001, 0.001);
    this.scene.add(mesh);
    const body = this.createBody(
      new C.Sphere(1.05),
      new C.Body({
        mass: 1.5,
        position: new C.Vec3(0, 3, 0),
      })
    );
    const bellObj = new MeshPhysicsObject(mesh, body);
    this.bellObj = bellObj;
    this.meshPhysicsObjs.push(bellObj);
  }
  // 创建木棍
  createStick() {
    const loader = new THREE.TextureLoader();
    const mesh = this.createMesh({
      geometry: new THREE.CylinderGeometry(0.25, 0.25, 5, 100),
      material: new THREE.MeshBasicMaterial({
        map: loader.load(woodTextureUrl),
      }),
    });
    mesh.rotateZ(-Math.PI * 0.5);
    const body = this.createBody(
      new C.Box(new C.Vec3(2.5, 0.25, 0.25)),
      new C.Body({
        mass: 1,
        position: new C.Vec3(-5, 3.6, 0),
      })
    );
    const stickObj = new MeshPhysicsObject(mesh, body, true, false);
    this.stickObj = stickObj;
    this.meshPhysicsObjs.push(stickObj);
  }
  // 创建悬挂点
  createHinge(position: THREE.Vector3) {
    const mesh = this.createMesh({
      geometry: new THREE.SphereGeometry(this.debug ? 0.1 : 0.001),
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
  // 创建大钟悬挂点
  createHingeBell() {
    const hingeBellObj = this.createHinge(new THREE.Vector3(0, 7, 0));
    this.hingeBellObj = hingeBellObj;
  }
  // 创建木棍悬挂点
  createHingeStick() {
    const hingeStickObj = this.createHinge(new THREE.Vector3(-5, 6.25, 0));
    this.hingeStickObj = hingeStickObj;
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
    const stickConstraint = new C.DistanceConstraint(
      this.stickObj.body,
      this.hingeStickObj.body,
      4
    );
    this.world.addConstraint(stickConstraint);
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
      // ios audio hack
      this.sound.play();
      this.sound.stop();
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
        this.sound.play();
      }
    });
  }
}

export default BellStrike;
