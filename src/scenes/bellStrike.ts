import * as THREE from "three";
import C from "cannon";
import {
  bellAudioUrl,
  bellModelUrl,
  pavilionModelUrl,
  planeTextureUrl,
  woodTextureUrl,
} from "@/consts/bellStrike";
import { PhysicsBase } from "./base";
import { MeshPhysicsObject } from "@/utils/physics";

class BellStrike extends PhysicsBase {
  bellObj!: MeshPhysicsObject;
  stickObj!: MeshPhysicsObject;
  hingeBellObj!: MeshPhysicsObject;
  hingeStickObj!: MeshPhysicsObject;
  isFirstSoundPlayed!: boolean;
  loadComplete!: boolean;
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
    this.lookAtPosition = new THREE.Vector3(0, 4, 0);
    this.gravity = new C.Vec3(0, -10, 0);
    this.isFirstSoundPlayed = false;
    this.loadComplete = false;
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
    await this.createGround();
    this.createStick();
    this.createHingeBell();
    this.createHingeStick();
    this.createConstraints();
    this.addListeners();
    this.setLoop();
    this.detectCollision();
    this.loadComplete = true;
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
  // 创建地面
  async createGround() {
    const loader = new THREE.TextureLoader();
    const plane = this.createMesh({
      geometry: new THREE.PlaneGeometry(50, 50),
      material: new THREE.MeshBasicMaterial({
        map: loader.load(planeTextureUrl),
      }),
    });
    plane.rotateX(-Math.PI / 2);
  }
  // 创建亭子
  async createPavilion() {
    const mesh = await this.loadModel(pavilionModelUrl);
    mesh.position.set(0, 0, 0);
    mesh.scale.set(2, 2, 2);
    mesh.rotateY(Math.PI / 2);
    this.scene.add(mesh);
  }
  // 创建大钟
  async createBell() {
    const model = await this.loadModel(bellModelUrl);
    const mesh = model.children[0].parent!.children[3];
    mesh.scale.set(0.001, 0.001, 0.001);
    mesh.position.set(0, 4, 0);
    this.scene.add(mesh);
    console.log(mesh);
    const body = this.createBody(
      new C.Sphere(1.05),
      new C.Body({
        mass: 1.5,
        position: new C.Vec3(0, 4, 0),
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
    const hingeBellObj = this.createHinge(new THREE.Vector3(0, 8, 0));
    this.hingeBellObj = hingeBellObj;
  }
  // 创建木棍悬挂点
  createHingeStick() {
    const hingeStickObj = this.createHinge(new THREE.Vector3(-5, 7.25, 0));
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
      if (!this.isFirstSoundPlayed) {
        this.sound.play();
        this.sound.stop();
        this.isFirstSoundPlayed = true;
      }
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
        this.bellObj.body.angularDamping = 0.7;
        this.stickObj.body.angularDamping = 1;
        this.stickObj.body.linearDamping = 0.4;
        if (this.sound.isPlaying) {
          this.sound.stop();
        }
        this.sound.play();
      }
    });
  }
  // 状态
  get status() {
    return {
      loadComplete: this.loadComplete,
    };
  }
}

export default BellStrike;
