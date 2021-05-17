import * as THREE from "three";
import SimplexNoise from "simplex-noise";

const simplex = new SimplexNoise(Math.random);

const calcAspect = (el: HTMLElement) => el.clientWidth / el.clientHeight;

const plane = (u: number, v: number, target: THREE.Vector3) => {
  const [x, y, z] = [u, v, 0];
  target.set(x, y, z);
};

const sphere = (u: number, v: number, target: THREE.Vector3) => {
  const phi = Math.PI * 2 * u;
  const theta = Math.PI * 2 * v;
  const x = Math.cos(theta) * Math.sin(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(phi);
  target.set(x, y, z);
};

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

export { calcAspect, hyperbolicHelicoidFunction, sphube, computeCurl };
