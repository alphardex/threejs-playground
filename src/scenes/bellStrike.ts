import * as THREE from "three";
import CANNON from "cannon";
import gsap from "gsap";
import ky from "kyouka";
import {
  bellAudioUrl,
  bellModelUrl,
  cloudModelUrl,
  pavilionModelUrl,
  planeTextureUrl,
  skyParams,
  woodTextureUrl,
} from "@/consts/bellStrike";
import { PhysicsBase } from "./base";
import { MeshPhysicsObject } from "@/utils/physics";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { Sky } from "three/examples/jsm/objects/Sky";

class BellStrike extends PhysicsBase {
  bellObj!: MeshPhysicsObject;
  stickObj!: MeshPhysicsObject;
  hingeBellObj!: MeshPhysicsObject;
  hingeStickObj!: MeshPhysicsObject;
  isFirstSoundPlayed!: boolean;
  loadComplete!: boolean;
  showTip!: boolean;
  composer!: EffectComposer;
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
    this.cameraPosition = new THREE.Vector3(0, 5, -100);
    this.lookAtPosition = new THREE.Vector3(0, 5, 0);
    this.gravity = new CANNON.Vec3(0, -10, 0);
    this.isFirstSoundPlayed = false;
    this.loadComplete = false;
  }
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.addListeners();
    this.createAudioSource();
    this.createWorld();
    this.createGround();
    if (this.debug) {
      this.createOrbitControls();
    }
    await this.loadAudio(bellAudioUrl);
    await this.createPavilion();
    await this.createBell();
    await this.createCloud();
    this.createStick();
    this.createHingeBell();
    this.createHingeStick();
    this.createConstraints();
    this.createLight();
    this.createSky();
    // this.createEffects();
    this.setLoop();
    this.loadComplete = true;
    this.moveCamera(() => {
      this.createRaycaster();
      this.onClick();
      this.detectCollision();
      this.createHint();
    });
  }
  // 创建光
  createLight() {
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(-100, 200, -100);
    this.scene.add(dirLight);
    const pointLight1 = new THREE.PointLight(0xffffff, 1, 500);
    pointLight1.position.set(-20, 5, 20);
    this.scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0xffffff, 1, 500);
    pointLight2.position.set(-20, 5, -20);
    this.scene.add(pointLight2);
    const ambiLight = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambiLight);
  }
  // 创建天空
  createSky() {
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const sky = new Sky();
    sky.scale.setScalar(450000);
    const uniforms = sky.material.uniforms;
    uniforms["turbidity"].value = skyParams.turbidity;
    uniforms["rayleigh"].value = skyParams.rayleigh;
    uniforms["mieCoefficient"].value = skyParams.mieCoefficient;
    uniforms["mieDirectionalG"].value = skyParams.mieDirectionalG;
    const sun = new THREE.Vector3();
    const theta = Math.PI * (skyParams.inclination - 0.5);
    const phi = 2 * Math.PI * (skyParams.azimuth - 0.5);
    const x = Math.cos(phi);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.sin(phi) * Math.cos(theta);
    sun.x = x;
    sun.y = y;
    sun.z = -z;
    uniforms["sunPosition"].value.copy(sun);
    this.scene.add(sky);
  }
  // 创建后期处理效果
  createEffects() {
    const composer = new EffectComposer(this.renderer);
    composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer = composer;
  }
  // 创建地面
  createGround() {
    const planeSize = 200;
    const loader = new THREE.TextureLoader();
    const texture = loader.load(planeTextureUrl);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(planeSize / 2, planeSize / 2);
    const plane = this.createMesh({
      geometry: new THREE.PlaneGeometry(planeSize, planeSize),
      material: new THREE.MeshLambertMaterial({
        map: texture,
        side: THREE.DoubleSide,
      }),
    });
    plane.rotateX(-ky.deg2rad(90));
  }
  // 创建云朵
  async createCloud() {
    const mesh = await this.loadFBXModel(cloudModelUrl);
    mesh.scale.set(0.5, 0.5, 0.5);
    const cloudCount = 6;
    const cloudGap = 4;
    for (let i = 0; i < cloudCount; i++) {
      const cloud = mesh.clone();
      const x = cloudGap * (i - cloudCount / 2 + 0.5);
      const y = 12;
      const z = ky.isOdd(i)
        ? ky.randomNumberInRange(4, 5)
        : -ky.randomNumberInRange(4, 5);
      cloud.position.set(x, y, z);
      this.scene.add(cloud);
      gsap.to(cloud.position, {
        x: x + (ky.isOdd(i) ? 6 : -6),
        duration: 20,
        yoyo: true,
        repeat: -1,
        stagger: 5,
      });
    }
  }
  // 创建亭子
  async createPavilion() {
    const mesh = await this.loadModel(pavilionModelUrl);
    mesh.position.set(0, 0, 0);
    mesh.scale.set(2, 2, 2);
    mesh.rotateY(ky.deg2rad(90));
    this.scene.add(mesh);
  }
  // 创建大钟
  async createBell() {
    const model = await this.loadModel(bellModelUrl);
    const mesh = model.children[0].parent!.children[3];
    mesh.scale.set(0.001, 0.001, 0.001);
    mesh.position.set(0, 4, 0);
    this.scene.add(mesh);
    const body = this.createBody(
      new CANNON.Sphere(1.05),
      new CANNON.Body({
        mass: 1.5,
        position: new CANNON.Vec3(0, 4, 0),
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
      material: new THREE.MeshStandardMaterial({
        map: loader.load(woodTextureUrl),
      }),
    });
    mesh.rotateZ(-ky.deg2rad(90));
    const body = this.createBody(
      new CANNON.Box(new CANNON.Vec3(2.5, 0.25, 0.25)),
      new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(-5, 3.6, 0),
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
      new CANNON.Sphere(0.1),
      new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3().copy(mesh.position as any),
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
    const bellConstraint = new CANNON.PointToPointConstraint(
      this.bellObj.body,
      new CANNON.Vec3(0, 2, 0),
      this.hingeBellObj.body,
      new CANNON.Vec3(0, -2, 0)
    );
    this.world.addConstraint(bellConstraint);
    const stickConstraint = new CANNON.DistanceConstraint(
      this.stickObj.body,
      this.hingeStickObj.body,
      4
    );
    this.world.addConstraint(stickConstraint);
  }
  // 移动相机
  moveCamera(cb: Function) {
    const t1 = gsap.timeline();
    t1.to(this.camera.position, {
      z: -30,
      duration: 3,
    })
      .to(
        this.camera.rotation,
        {
          y: -ky.deg2rad(30),
          duration: 2,
        },
        "-=2"
      )
      .to(
        this.camera.position,
        {
          x: -14,
          z: -24,
          duration: 2,
          onComplete() {
            cb();
          },
        },
        "-=2"
      );
  }
  // 监听事件
  addListeners() {
    this.onResize();
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
    const impulse = new CANNON.Vec3(5, 0, 0);
    body.applyLocalImpulse(impulse, new CANNON.Vec3());
  }
  // 碰撞检测
  detectCollision() {
    const stick = this.stickObj.body;
    stick.addEventListener("collide", (e: any) => {
      const target = e.body;
      const bell = this.bellObj.body;
      if (target === bell) {
        this.bellObj.body.angularDamping = 0.2;
        this.stickObj.body.angularDamping = 1;
        this.stickObj.body.linearDamping = 0.4;
        if (this.sound.isPlaying) {
          this.sound.stop();
        }
        this.sound.play();
      }
    });
  }
  // 创建提示
  createHint() {
    this.showTip = true;
  }
  // 状态
  get status() {
    return {
      loadComplete: this.loadComplete,
      showTip: this.showTip,
    };
  }
}

export default BellStrike;
