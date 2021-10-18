import * as THREE from "three";
import * as CANNON from "cannon-es";
import gsap from "gsap";
import ky from "kyouka";
import {
  bellAudioUrl,
  bellModelUrl,
  bellTextureUrl,
  bgTextureUrl,
  cloudModelUrl,
  pavilionModelUrl,
  planeTextureUrl,
  skyParams,
  woodTextureUrl,
} from "@/consts/bellStrike";
import { PhysicsBase } from "@/commons/base";
import { MeshPhysicsObject } from "@/utils/physics";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Sky } from "three/examples/jsm/objects/Sky";
import * as dat from "dat.gui";
import { loadAudio, loadFBXModel, loadModel } from "@/utils/loader";
import { RaycastSelector } from "@/utils/raycast";

class BellStrike extends PhysicsBase {
  bellObj!: MeshPhysicsObject;
  stickObj!: MeshPhysicsObject;
  hingeBellObj!: MeshPhysicsObject;
  hingeStickObj!: MeshPhysicsObject;
  loadComplete!: boolean;
  showTip!: boolean;
  startStrike!: boolean;
  isStriked!: boolean;
  startWish!: boolean;
  number!: number;
  sound!: THREE.Audio;
  raycastSelector: RaycastSelector;
  params!: Record<string, any>;
  constructor(sel: string, debug = false) {
    super(sel, debug);
    this.perspectiveCameraParams = {
      fov: 45,
      near: 1,
      far: 1000,
    };
    this.cameraPosition = new THREE.Vector3(0, 5, -100);
    this.lookAtPosition = new THREE.Vector3(0, 5, 0);
    this.loadComplete = false;
    this.params = {
      force: 6,
      bellMass: 1.5,
      bellAngularDamping: 0.99,
      stickLinearDamping: 0.4,
      stickRopeLength: 4,
      stickY: 3.6,
      stickLength: 5,
      hingeStickY: 7.25,
    };
  }
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.raycastSelector = new RaycastSelector(this.scene, this.camera);
    this.createRenderer();
    this.changeRendererParams();
    // 出于移动端性能考虑，这里未开启投影
    // this.enableShadow()
    this.addListeners();
    this.createAudioSource();
    this.createWorld();
    this.createGround();
    if (this.debug) {
      this.createOrbitControls();
    }
    const buffer = await loadAudio(bellAudioUrl);
    this.sound.setBuffer(buffer);
    await this.createPavilion();
    await this.createBell();
    // await this.createCloud();
    this.createStick();
    this.createHingeBell();
    this.createHingeStick();
    this.createConstraints();
    this.createLight();
    // this.createSky();
    this.createBg();
    // 出于移动端性能考虑，这里未开启后期特效
    // this.createEffects();
    if (this.debug) {
      this.createDebugPanel();
    }
    this.setLoop();
    await ky.sleep(500);
    this.loadComplete = true;
    this.moveCamera(() => {
      this.onClick();
      this.detectCollision();
      this.createHint();
    });
  }
  // 改变渲染器参数
  changeRendererParams() {
    this.renderer.outputEncoding = THREE.sRGBEncoding;
  }
  // 创建音效源
  createAudioSource() {
    const listener = new THREE.AudioListener();
    this.camera.add(listener);
    const sound = new THREE.Audio(listener);
    this.sound = sound;
  }
  // 创建光
  createLight() {
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(-10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 38;
    const d = 10;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.left = -d;
    this.scene.add(dirLight);
    if (this.debug && this.renderer.shadowMap.enabled) {
      const dirLightCameraHelper = new THREE.CameraHelper(
        dirLight.shadow.camera
      );
      this.scene.add(dirLightCameraHelper);
    }
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
  // 创建背景
  createBg() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(bgTextureUrl);
    this.scene.background = texture;
  }
  // 创建后期处理效果
  createEffects() {
    const composer = new EffectComposer(this.renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(new RenderPass(this.scene, this.camera));
    const bufferSize = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const unrealBloomPass = new UnrealBloomPass(bufferSize, 0.3, 1, 0.8);
    composer.addPass(unrealBloomPass);
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
    plane.receiveShadow = true;
    const body = this.createBody(
      new CANNON.Plane(),
      new CANNON.Body({ mass: 0 })
    );
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), ky.deg2rad(90));
  }
  // 创建云朵
  async createCloud() {
    const mesh = await loadFBXModel(cloudModelUrl);
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
    const model = await loadModel(pavilionModelUrl);
    const mesh = model.children[2];
    mesh.position.set(0, 6.5, 0);
    mesh.scale.set(0.002, 0.002, 0.002);
    mesh.rotateY(ky.deg2rad(90));
    mesh.children.forEach((item) => {
      item.castShadow = true;
    });
    this.scene.add(mesh);
  }
  // 创建大钟
  async createBell() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(bellTextureUrl);
    const model = await loadModel(bellModelUrl);
    const mesh = model.children[0].parent!.children[3];
    mesh.traverse((obj) => {
      // @ts-ignore
      if (obj.material) {
        // @ts-ignore
        obj.material.map = texture;
        // @ts-ignore
        obj.material.color = new THREE.Color("#988259");
      }
    });
    mesh.scale.set(0.001, 0.001, 0.001);
    mesh.position.set(0, 4, 0);
    this.scene.add(mesh);
    const body = this.createBody(
      new CANNON.Box(new CANNON.Vec3(1, 2, 1)),
      new CANNON.Body({
        mass: this.params.bellMass,
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
      geometry: new THREE.CylinderGeometry(
        0.25,
        0.25,
        this.params.stickLength,
        100
      ),
      material: new THREE.MeshStandardMaterial({
        map: loader.load(woodTextureUrl),
      }),
    });
    mesh.rotateZ(-ky.deg2rad(90));
    mesh.castShadow = true;
    const shape = new CANNON.Cylinder(0.25, 0.25, this.params.stickLength);
    const q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -ky.deg2rad(90));
    shape.transformAllPoints(new CANNON.Vec3(0, 0, 0), q);
    const body = this.createBody(
      shape,
      new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(-5, this.params.stickY, 0),
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
    const hingeStickObj = this.createHinge(
      new THREE.Vector3(-5, this.params.hingeStickY, 0)
    );
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
      this.params.stickRopeLength
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
    window.addEventListener("click", (e) => {
      this.onClickStick();
    });
    window.addEventListener("touchstart", (e) => {
      this.onClickStick();
    });
    window.addEventListener(
      "touchstart",
      () => {
        // ios audio hack
        this.sound.play();
        this.sound.stop();
      },
      { once: true }
    );
  }
  // 点击木棍时
  onClickStick() {
    const intersect = this.raycastSelector.onChooseIntersect(
      this.stickObj.mesh
    );
    if (intersect && !this.startStrike) {
      this.strikeBell();
      this.startStrike = true;
    }
  }
  // 撞钟
  strikeBell() {
    const { stickObj } = this;
    const { body } = stickObj;
    const force = new CANNON.Vec3(this.params.force, 0, 0);
    body.applyLocalImpulse(force, new CANNON.Vec3(0, 0, 0));
  }
  // 碰撞检测
  detectCollision() {
    const stick = this.stickObj.body;
    stick.addEventListener("collide", (e: any) => {
      const target = e.body;
      const bell = this.bellObj.body;
      if (target === bell) {
        this.bellObj.body.angularDamping = this.params.bellAngularDamping;
        this.stickObj.body.angularDamping = 1;
        this.stickObj.body.linearDamping = this.params.stickLinearDamping;
        if (this.sound.isPlaying) {
          this.sound.stop();
        }
        this.sound.setVolume(3);
        this.sound.play();
        if (!this.isStriked) {
          this.isStriked = true;
        }
      }
    });
  }
  // 创建提示
  createHint() {
    this.showTip = true;
  }
  // 渲染
  setLoop() {
    this.renderer.setAnimationLoop(async () => {
      this.resizeRendererToDisplaySize();
      this.update();
      if (this.controls) {
        this.controls.update();
      }
      if (this.stats) {
        this.stats.update();
      }
      if (this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
      if (this.isStriked) {
        await ky.sleep(4000);
        this.startWish = true;
      }
    });
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI({ width: 320 });
    gui.add(this.params, "force").min(0).max(25).step(0.1);
    gui
      .add(this.params, "bellMass")
      .min(0)
      .max(25)
      .step(0.1)
      .onChange((value) => {
        this.bellObj.body.mass = value;
      });
    gui.add(this.params, "bellAngularDamping").min(0).max(1).step(0.01);
    gui.add(this.params, "stickLinearDamping").min(0).max(1).step(0.01);
  }
  // 状态
  get status() {
    return {
      loadComplete: this.loadComplete,
      showTip: this.showTip,
      startWish: this.startWish,
      startStrike: this.startStrike,
      number: this.number,
    };
  }
}

export default BellStrike;
