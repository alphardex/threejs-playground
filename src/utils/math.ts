import * as THREE from "three";
import * as CANNON from "cannon-es";
import SimplexNoise from "simplex-noise";

const simplex = new SimplexNoise(Math.random);

const calcAspect = (el: HTMLElement) => el.clientWidth / el.clientHeight;

// https://mathworld.wolfram.com/HyperbolicHelicoid.html
const hyperbolicHelicoidFunction = (
  u: number,
  v: number,
  target: THREE.Vector3
) => {
  u = Math.PI * 2 * (u - 0.5);
  v = Math.PI * 2 * (v - 0.5);
  const tau = 5;
  const bottom = 1 + Math.cosh(u) * Math.cosh(v);
  const x = (Math.sinh(v) * Math.cos(tau * u)) / bottom;
  const y = (Math.sinh(v) * Math.sin(tau * u)) / bottom;
  const z = (Math.cosh(v) * Math.sinh(u)) / bottom;
  target.set(x, z, y);
};

// https://arxiv.org/pdf/1604.02174.pdf
const sphube = (u1, v1, target) => {
  const s = 0.6;
  const r = 1;
  const theta = 2 * u1 * Math.PI;
  const phi = v1 * 2 * Math.PI;

  const u = Math.cos(theta) * Math.cos(phi);
  const v = Math.cos(theta) * Math.sin(phi);
  const w = Math.sin(theta);

  const z = (r * u) / Math.sqrt(1 - s * v ** 2 - s * w ** 2);
  const x = (r * v) / Math.sqrt(1 - s * u ** 2 - s * w ** 2);
  const y = (r * w) / Math.sqrt(1 - s * Math.cos(theta) ** 2);

  target.set(x, y, z);
};

// https://al-ro.github.io/projects/embers/
const computeCurl = (x: number, y: number, z: number) => {
  let eps = 0.0001;

  let curl = new THREE.Vector3();

  //Find rate of change in YZ plane
  let n1 = simplex.noise3D(x, y + eps, z);
  let n2 = simplex.noise3D(x, y - eps, z);
  //Average to find approximate derivative
  let a = (n1 - n2) / (2 * eps);
  n1 = simplex.noise3D(x, y, z + eps);
  n2 = simplex.noise3D(x, y, z - eps);
  //Average to find approximate derivative
  let b = (n1 - n2) / (2 * eps);
  curl.x = a - b;

  //Find rate of change in XZ plane
  n1 = simplex.noise3D(x, y, z + eps);
  n2 = simplex.noise3D(x, y, z - eps);
  a = (n1 - n2) / (2 * eps);
  n1 = simplex.noise3D(x + eps, y, z);
  n2 = simplex.noise3D(x + eps, y, z);
  b = (n1 - n2) / (2 * eps);
  curl.y = a - b;

  //Find rate of change in XY plane
  n1 = simplex.noise3D(x + eps, y, z);
  n2 = simplex.noise3D(x - eps, y, z);
  a = (n1 - n2) / (2 * eps);
  n1 = simplex.noise3D(x, y + eps, z);
  n2 = simplex.noise3D(x, y - eps, z);
  b = (n1 - n2) / (2 * eps);
  curl.z = a - b;

  return curl;
};

// 三维点
class Point {
  x: number;
  y: number;
  z: number;
  constructor(p) {
    this.x = p.x;
    this.y = p.y;
    this.z = p.z;
  }
}

// 数组转化为点
const array2Point = (arr) => new Point({ x: arr[0], y: arr[1], z: arr[2] });

// 点转化为数组
const point2Array = (point) => [point.x, point.y, point.z];

// 多个数组转化为多个点
const arrays2Point = (arrs) => arrs.map((item) => array2Point(item));

// 点转化为Three.js的向量
const point2ThreeVector = (point) =>
  new THREE.Vector3(point.x, point.y, point.z);

// 点转化为Cannon.js的向量
const point2CannonVec = (point) => new CANNON.Vec3(point.x, point.y, point.z);

// 2PI
const TAU = 2 * Math.PI;

// 获取重心坐标系
const getBaryCoord = (bufferGeometry: THREE.BufferGeometry) => {
  // https://gist.github.com/mattdesl/e399418558b2b52b58f5edeafea3c16c
  const length = bufferGeometry.attributes.position.array.length;
  const count = length / 3;
  const bary = [];
  for (let i = 0; i < count; i++) {
    bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
  }
  const aCenter = new Float32Array(bary);
  bufferGeometry.setAttribute("aCenter", new THREE.BufferAttribute(aCenter, 3));
};

export {
  calcAspect,
  hyperbolicHelicoidFunction,
  sphube,
  computeCurl,
  Point,
  array2Point,
  point2Array,
  arrays2Point,
  point2ThreeVector,
  point2CannonVec,
  TAU,
  getBaryCoord,
};
