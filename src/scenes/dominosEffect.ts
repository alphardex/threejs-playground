import * as THREE from "three";
import ky from "kyouka";
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

class DominosEffect extends PhysicsBase {
  clock!: THREE.Clock;
  cubeMat!: THREE.MeshPhongMaterial;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 3, 5);
    this.params = {
      cubeColor: "#002f93", // 骨牌颜色
    };
  }
  // 初始化
  init() {
    this.createWorld();
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createCubeMaterial();
    this.createCube({ position: { x: 0, y: 0.5, z: 0 } });
    this.createGround();
    this.createLight();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建骨牌材质
  createCubeMaterial() {
    const { cubeColor } = this.params;
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
  // 创建地面
  createGround() {
    const position = new Point({ x: 0, y: 0, z: 0 });
    const rotation = new Point({ x: ky.deg2rad(-90), y: 0, z: 0 });
    const geo = new THREE.PlaneBufferGeometry(100, 100);
    const mat = this.cubeMat;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(point2ThreeVector(position));
    // @ts-ignore
    mesh.rotation.set(...point2Array(rotation));
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
    return obj;
  }
}

export default DominosEffect;
