import * as THREE from "three";
import * as CANNON from "cannon-es";
import gsap from "gsap";
import { Maku } from "maku.js";
import { HTMLIVCElement, MeshSizeType, MeshType } from "maku.js/types/types";
import SimplexNoise from "simplex-noise";
import { MouseTracker } from "./dom";

class MeshPhysicsObject {
  mesh!: THREE.Mesh | THREE.Object3D;
  body!: CANNON.Body;
  copyPosition!: boolean;
  copyQuaternion!: boolean;
  constructor(
    mesh: THREE.Mesh | THREE.Object3D,
    body: CANNON.Body,
    copyPosition = true,
    copyQuaternion = true
  ) {
    this.mesh = mesh;
    this.body = body;
    this.copyPosition = copyPosition;
    this.copyQuaternion = copyQuaternion;
  }
}

interface Segments {
  width: number;
  height: number;
}

class ClothMaku extends Maku {
  world: CANNON.World;
  stitches: CANNON.Body[];
  segments: Segments;
  constructor(
    el: HTMLIVCElement,
    material: THREE.ShaderMaterial,
    scene: THREE.Scene,
    world: CANNON.World,
    meshType: MeshType = "mesh",
    meshSizeType: MeshSizeType = "size",
    segments = {
      width: 64,
      height: 64,
    }
  ) {
    super(el, material, scene, meshType, meshSizeType, segments);
    this.world = world;
    this.segments = segments;
    this.createStitches();
    this.connectStitches();
  }
  // 获取position的行列
  getPositionRowCol(i: number, size: number) {
    const length = size + 1;
    const row = Math.floor(i / length);
    const col = i % length;
    return { row, col };
  }
  // 创建缝合
  createStitches() {
    const { mesh, rect, segments } = this;
    const particleShape = new CANNON.Particle();
    const { position } = mesh.geometry.attributes;
    const { width, height } = rect;
    const stitches = [...Array(position.count).keys()].map((i) => {
      const size = segments.width;
      const { row } = this.getPositionRowCol(i, size);
      const pos = new CANNON.Vec3(
        position.getX(i) * width,
        position.getY(i) * height,
        position.getZ(i)
      );
      const mass = row === 0 ? 0 : 1 / position.count;
      const stitch = new CANNON.Body({
        mass,
        position: pos,
        shape: particleShape,
      });
      this.world.addBody(stitch);
      return stitch;
    });
    this.stitches = stitches;
    return stitches;
  }
  // 连结
  connect(bodyA: CANNON.Body, bodyB: CANNON.Body) {
    const c = new CANNON.DistanceConstraint(bodyA, bodyB);
    this.world.addConstraint(c);
  }
  // 连结缝合
  connectStitches() {
    const { mesh, segments } = this;
    const { position } = mesh.geometry.attributes;
    [...Array(position.count).keys()].forEach((i) => {
      const size = segments.width;
      const { row, col } = this.getPositionRowCol(i, size);
      if (col < size) {
        this.connect(this.stitches[i], this.stitches[i + 1]);
      }
      if (row < size) {
        this.connect(this.stitches[i], this.stitches[i + 1 + size]);
      }
    });
  }
  // 更新
  update() {
    const { mesh, rect, stitches } = this;
    const { width, height } = rect;
    const { position } = mesh.geometry.attributes;
    [...Array(position.count).keys()].forEach((i) => {
      position.setXYZ(
        i,
        stitches[i].position.x / width,
        stitches[i].position.y / height,
        stitches[i].position.z
      );
    });
    position.needsUpdate = true;
  }
  // 施加风
  applyWind(wind: Wind) {
    const { position } = this.mesh.geometry.attributes;
    [...Array(position.count).keys()].forEach((i) => {
      const stitch = this.stitches[i];
      const noise = wind.flowField[i];
      const { x, y, z } = noise;
      const force = new CANNON.Vec3(x, y, z);
      stitch.applyForce(force);
    });
  }
}

interface WindConfig {
  baseForce?: number;
  off?: number;
  direction?: THREE.Vector3;
}

class Wind {
  maku: ClothMaku;
  off: number;
  force: number;
  clock: THREE.Clock;
  direction: THREE.Vector3;
  noise: SimplexNoise;
  flowField: THREE.Vector3[];
  mouseTracker: MouseTracker;
  constructor(maku: ClothMaku, config: WindConfig = {}) {
    this.maku = maku;

    const {
      baseForce = 1000,
      off = 0.05,
      direction = new THREE.Vector3(0.5, 0, -1),
    } = config;
    const { count } = maku.mesh.geometry.attributes.position;
    const force = baseForce / count;
    const clock = new THREE.Clock();
    const flowField = new Array(count);
    this.flowField = flowField;
    this.off = off;
    this.force = force;
    this.clock = clock;
    this.direction = direction;

    const noise = new SimplexNoise();
    this.noise = noise;

    this.mouseTracker = new MouseTracker();
    this.mouseTracker.trackMousePos();

    this.update();
    this.directionFollowMouse();
  }
  // 更新
  update() {
    const time = this.clock.getElapsedTime();

    const { maku, off } = this;
    const { position } = maku.mesh.geometry.attributes;
    const size = maku.segments.width;
    [...Array(position.count).keys()].forEach((i) => {
      const { row, col } = this.maku.getPositionRowCol(i, size);
      const force = this.noise.noise3D(row * off, col * off, time);
      const centeredForce = 0.5 * force + 0.5;
      const realForce = centeredForce * this.force;
      const forceVector = this.direction.clone().multiplyScalar(realForce);
      this.flowField[i] = forceVector;
    });
  }
  // 风向跟随鼠标
  directionFollowMouse() {
    window.addEventListener("mousemove", () => {
      const mousePos = this.mouseTracker.mousePos;
      const { x, y } = mousePos;
      gsap.to(this.direction, {
        x,
        y,
        duration: 0.8,
      });
    });
  }
}

export { MeshPhysicsObject, ClothMaku, Wind };
