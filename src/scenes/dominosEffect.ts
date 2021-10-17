import * as THREE from "three";
import ky from "kyouka";
import { PhysicsBase } from "@/commons/base";
import * as CANNON from "cannon-es";
import { MeshPhysicsObject } from "@/utils/physics";
import {
  Point,
  point2Array,
  point2CannonVec,
  point2ThreeVector,
} from "@/utils/math";

class DominosEffect extends PhysicsBase {
  clock!: THREE.Clock;
  groundMat!: THREE.MeshPhongMaterial;
  cubeMat!: THREE.MeshPhongMaterial;
  sphereMat!: THREE.MeshPhongMaterial;
  ground!: MeshPhysicsObject;
  ball!: MeshPhysicsObject;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(-5, 5, 5);
    this.params = {
      groundColor: "#f0f0f0", // 地面颜色
      cubeColor: "#002f93", // 骨牌颜色
      sphereColor: "silver", // 球体颜色
    };
  }
  // 初始化
  init() {
    this.createWorld();
    this.changeWorldParams();
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.changeRendererParams();
    this.enableShadow();
    this.createLight();
    this.createGroundMaterial();
    this.createGround();
    this.createCubeMaterial();
    this.createCube({});
    this.createCubes();
    this.createSphereMaterial();
    this.createBall();
    this.applyForce2Ball();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 允许投影
  enableShadow() {
    this.renderer.shadowMap.enabled = true;
  }
  // 创建地面材质
  createGroundMaterial() {
    const groundColor = this.params.groundColor;
    const groundMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(groundColor),
    });
    this.groundMat = groundMat;
  }
  // 创建地面
  createGround() {
    const position = new Point({ x: 0, y: -0.5, z: 0 });
    const rotation = new Point({ x: ky.deg2rad(-90), y: 0, z: 0 });
    const geo = new THREE.PlaneBufferGeometry(100, 100);
    const mat = this.groundMat;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(point2ThreeVector(position));
    // @ts-ignore
    mesh.rotation.set(...point2Array(rotation));
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const body = new CANNON.Body({
      shape: new CANNON.Plane(),
      position: point2CannonVec(position),
      quaternion: new CANNON.Quaternion().setFromEuler(
        // @ts-ignore
        ...point2Array(rotation)
      ),
    });
    this.world.addBody(body);

    const obj = new MeshPhysicsObject(mesh, body);
    this.meshPhysicsObjs.push(obj);
    this.ground = obj;
    return obj;
  }
  // 创建骨牌材质
  createCubeMaterial() {
    const cubeColor = this.params.cubeColor;
    const cubeMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(cubeColor),
    });
    this.cubeMat = cubeMat;
  }
  // 创建骨牌
  createCube({ position = new Point({ x: 0, y: 0, z: 0 }) }) {
    const box = new Point({ x: 0.1, y: 1, z: 0.5 });
    const boxHalf = new Point({ x: box.x / 2, y: box.y / 2, z: box.z / 2 });
    const geo = new THREE.BoxBufferGeometry(box.x, box.y, box.z);
    const mat = this.cubeMat;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(point2ThreeVector(position));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(point2CannonVec(boxHalf)),
      position: point2CannonVec(position),
    });
    this.world.addBody(body);

    const obj = new MeshPhysicsObject(mesh, body);
    this.meshPhysicsObjs.push(obj);
    return obj;
  }
  // 创建多个骨牌
  createCubes() {
    const pairCount = 10;
    const gap = 0.5;
    for (let i = 1; i < pairCount + 1; i++) {
      const before = new Point({ x: gap * i, y: 0, z: 0 });
      const after = new Point({ x: -gap * i, y: 0, z: 0 });
      this.createCube({ position: before });
      this.createCube({ position: after });
    }
  }
  // 创建球体材质
  createSphereMaterial() {
    const sphereColor = this.params.sphereColor;
    const sphereMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(sphereColor),
    });
    this.sphereMat = sphereMat;
  }
  // 创建球
  createSphere({ position = new Point({ x: 0, y: 0, z: 0 }), r = 0.5 }) {
    const geo = new THREE.SphereBufferGeometry(r, 64, 64);
    const mat = this.sphereMat;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(point2ThreeVector(position));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(r),
      position: point2CannonVec(position),
    });
    this.world.addBody(body);

    const obj = new MeshPhysicsObject(mesh, body);
    this.meshPhysicsObjs.push(obj);
    return obj;
  }
  // 创建球
  createBall() {
    const ball = this.createSphere({
      position: new Point({ x: -6.5, y: 0, z: 0 }),
    });
    this.ball = ball;
  }
  // 对球施加力
  applyForce2Ball() {
    const ball = this.ball;
    ball.body.applyLocalForce(new CANNON.Vec3(200, 0, 0));
  }
  // 改变物理世界参数
  changeWorldParams() {
    const world = this.world;
    world.defaultContactMaterial.contactEquationStiffness = 100;
    world.defaultContactMaterial.contactEquationRelaxation = 2;
    world.defaultContactMaterial.frictionEquationRelaxation = 2;
    world.allowSleep = true;
    world.quatNormalizeFast = true;
    world.quatNormalizeSkip = 8;
  }
  // 更改渲染器参数
  changeRendererParams() {
    this.renderer.outputEncoding = THREE.sRGBEncoding;
  }
  // 创建光源
  createLight() {
    // 环境光
    const ambiLight = new THREE.AmbientLight(new THREE.Color("white"), 0.5);
    this.scene.add(ambiLight);

    // 聚光
    const spotLight = new THREE.SpotLight(new THREE.Color("white"));
    spotLight.position.set(15, 10, 10);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.angle = 0.3;
    spotLight.penumbra = 1;
    this.scene.add(spotLight);
  }
}

export default DominosEffect;
