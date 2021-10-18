import * as THREE from "three";
import SimplexNoise from "simplex-noise";

const simplex = new SimplexNoise(Math.random);

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

export { computeCurl };
