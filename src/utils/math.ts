import * as THREE from "three";
import * as CANNON from "cannon-es";
import PoissonDiskSampling from "poisson-disk-sampling";

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

// 泊松分布
const poisson = ({ range, minRadius, maxRadius }) => {
  const scale = (n) => n * 100;
  const scaleInvert = (n) => n / 100;

  const rangeScaled = range.map(scale);
  return new PoissonDiskSampling({
    shape: rangeScaled,
    minDistance: minRadius,
    maxDistance: maxRadius,
    tries: 10,
  })
    .fill()
    .map((p) => p.map(scaleInvert));
};

export {
  Point,
  array2Point,
  point2Array,
  arrays2Point,
  point2ThreeVector,
  point2CannonVec,
  TAU,
  poisson,
};
