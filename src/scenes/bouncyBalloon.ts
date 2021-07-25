import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { PhysicsBase } from "./base";
import * as CANNON from "cannon-es";
import { MeshPhysicsObject } from "@/utils/physics";
import {
  arrays2Point,
  Point,
  point2Array,
  point2CannonVec,
  point2ThreeVector,
} from "@/utils/math";
import {
  EffectComposer,
  RenderPass,
  NormalPass,
  SSAOEffect,
  EffectPass,
} from "postprocessing";

class BouncyBalloon extends PhysicsBase {
  ballMat: THREE.MeshLambertMaterial;
  balls: MeshPhysicsObject[];
  planes: MeshPhysicsObject[];
  mouseFollowBall: MeshPhysicsObject;
  params: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.perspectiveCameraParams = {
      fov: 35,
      near: 10,
      far: 40,
    }; // 透视相机相关参数
    this.cameraPosition = new THREE.Vector3(0, 0, 20); // 相机位置
    this.gravity = new CANNON.Vec3(0, 0, 0); // 重力
    this.ballMat = null; // 球的材质
    this.balls = []; // 一堆小球
    this.planes = []; // 4个平面隔板
    this.mouseFollowBall = null; // 跟随鼠标的大球
    this.params = {
      ballColor: "#002f93", // 球的颜色
    };
  }
  // 初始化
  init() {
    this.createWorld();
    this.createScene();
    this.createPerspectiveCamera();
    this.getViewport();
    this.createRenderer();
    this.changeRendererParams();
    this.createBallMaterial();
    this.createBalls();
    this.createFourPlanes();
    this.addBallsDamping();
    this.createMouseFollowBall();
    this.hideSomeObjs();
    this.createLight();
    this.createPostprocessingEffect();
    this.trackMousePos();
    this.addListeners();
    this.setLoop();
  }
  // 创建球材质
  createBallMaterial() {
    const { ballColor } = this.params;
    const ballMat = new THREE.MeshLambertMaterial({
      color: new THREE.Color("silver"),
      emissive: new THREE.Color(ballColor),
    });
    this.ballMat = ballMat;
  }
  // 创建球
  createBall({ position = new Point({ x: 0, y: 0, z: 0 }), scale = 1 }) {
    // 在three.js中创建渲染物体
    const geo = new THREE.SphereBufferGeometry(1, 64, 64);
    const mat = this.ballMat;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(point2ThreeVector(position));
    mesh.scale.copy(new THREE.Vector3(scale, scale, scale));
    this.scene.add(mesh);

    // 在cannon.js中创建物理物体
    const body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(scale, scale, scale)),
      position: point2CannonVec(position),
    });
    this.world.addBody(body);

    // 将两物体的数据同步
    const obj = new MeshPhysicsObject(mesh, body);
    this.meshPhysicsObjs.push(obj);
    return obj;
  }
  // 创建一堆球
  createBalls(count = 64) {
    const balls = [...Array(count).keys()].map(() => {
      const scale = ky.randomNumberInRange(0.5, 1);
      const ball = this.createBall({
        scale,
      });
      return ball;
    });
    this.balls = balls;
  }
  // 创建平面
  createPlane({
    position = new Point({ x: 0, y: 0, z: 0 }),
    rotation = new Point({ x: 0, y: 0, z: 0 }),
  }) {
    // 在three.js中创建渲染物体
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("red"),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(point2ThreeVector(position));
    // @ts-ignore
    mesh.rotation.set(...point2Array(rotation));
    this.scene.add(mesh);

    // 在cannon.js中创建物理物体
    const body = new CANNON.Body({
      shape: new CANNON.Plane(),
      position: point2CannonVec(position),
      quaternion: new CANNON.Quaternion().setFromEuler(
        // @ts-ignore
        ...point2Array(rotation)
      ),
    });
    this.world.addBody(body);

    // 将两物体的数据同步
    const obj = new MeshPhysicsObject(mesh, body);
    this.meshPhysicsObjs.push(obj);
    return obj;
  }
  // 创建4个平面隔板
  createFourPlanes() {
    const planePositions = arrays2Point([
      [0, 0, 0],
      [0, 0, 8],
      [0, -4, 0],
      [0, 4, 0],
    ]);
    const planeRotations = arrays2Point([
      [0, 0, 0],
      [0, ky.deg2rad(-180), 0],
      [ky.deg2rad(-90), 0, 0],
      [ky.deg2rad(90), 0, 0],
    ]);
    const planes = [];
    for (let i = 0; i < 4; i++) {
      const position = planePositions[i];
      const rotation = planeRotations[i];
      const plane = this.createPlane({ position, rotation });
      planes.push(plane);
    }
    this.planes = planes;
  }
  // 给球添加阻尼
  addBallsDamping() {
    this.balls.forEach((ball) => {
      ball.body.angularDamping = 0.2;
      ball.body.linearDamping = 0.95;
    });
  }
  // 动画
  update() {
    this.sync();
    this.world.step(1 / 60);
    this.applyForce2Balls();
    this.mouseBallFollow();
  }
  // 给球施加力
  applyForce2Balls() {
    this.balls.forEach((obj) => {
      const force = new THREE.Vector3()
        .copy(obj.body.position as any)
        .normalize()
        .multiplyScalar(-36);
      obj.body.applyForce(force as any);
    });
  }
  // 创建跟踪鼠标的球
  createMouseFollowBall(scale = 2) {
    // 在three.js中创建渲染物体
    const geo = new THREE.SphereBufferGeometry(1, 64, 64);
    const mat = this.ballMat;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.copy(new THREE.Vector3(scale, scale, scale));
    this.scene.add(mesh);

    // 在cannon.js中创建物理物体
    const body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(2),
      type: CANNON.Body.KINEMATIC,
    });
    this.world.addBody(body);

    // 将两物体的数据同步
    const mouseFollowBall = new MeshPhysicsObject(mesh, body);
    this.meshPhysicsObjs.push(mouseFollowBall);
    this.mouseFollowBall = mouseFollowBall;
  }
  // 大球跟踪鼠标
  mouseBallFollow() {
    const mousePos = this.mousePos;
    const x = (mousePos.x * this.viewport.width) / 2;
    const y = (mousePos.y * this.viewport.height) / 2;
    const pos = new CANNON.Vec3(x, y, 2.5);
    this.mouseFollowBall.body.position.copy(pos);
  }
  // 隐藏部分物体
  hideSomeObjs() {
    this.planes.forEach((plane) => (plane.mesh.visible = false));
    this.mouseFollowBall.mesh.visible = false;
  }
  // 更改渲染器参数
  changeRendererParams() {
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.CineonToneMapping;
    this.renderer.toneMappingExposure = 1.5;
  }
  // 创建光源
  createLight() {
    const { ballColor } = this.params;

    // 环境光
    const ambiLight = new THREE.AmbientLight(new THREE.Color("white"), 0.75);
    this.scene.add(ambiLight);

    // 平行光
    const dirLight1 = new THREE.DirectionalLight(new THREE.Color("white"), 4);
    dirLight1.position.set(0, 5, -5);
    this.scene.add(dirLight1);

    // 聚光
    const spotLight = new THREE.SpotLight(new THREE.Color(ballColor));
    spotLight.position.set(20, 20, 25);
    this.scene.add(spotLight);
  }
  // 创建后期处理特效
  createPostprocessingEffect() {
    const { ballColor } = this.params;
    const composer = new EffectComposer(this.renderer);

    // 渲染通道
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    // 法线通道
    const normalPass = new NormalPass(this.scene, this.camera);
    composer.addPass(normalPass);

    // SSAO特效
    const ssaoConfig = {
      rangeThreshold: 0.5,
      rangeFalloff: 0.1,
      bias: 0.5,
    };
    const ssaoEffect1 = new SSAOEffect(
      this.camera,
      normalPass.renderTarget.texture,
      {
        samples: 9,
        radius: 30,
        intensity: 30,
        color: ballColor,
        ...ssaoConfig,
      }
    );
    const ssaoEffect2 = new SSAOEffect(
      this.camera,
      normalPass.renderTarget.texture,
      {
        samples: 18,
        radius: 5,
        intensity: 30,
        color: ballColor,
        ...ssaoConfig,
      }
    );

    // 特效通道
    const effectPass = new EffectPass(this.camera, ssaoEffect1, ssaoEffect2);
    effectPass.renderToScreen = true;
    composer.addPass(effectPass);

    this.composer = composer;
  }
}

export default BouncyBalloon;
