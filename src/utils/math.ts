const calcAspect = (el: HTMLElement) => el.clientWidth / el.clientHeight;

const plane = (u: number, v: number, target: THREE.Vector3) => {
  let [x, y, z] = [u, v, 0];
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
const helicoid = (u: number, v: number, target: THREE.Vector3) => {
  u = Math.PI * 2 * (u - 0.5);
  v = Math.PI * 2 * (v - 0.5);
  const tau = 5;
  const bottom = 1 + Math.cosh(u) * Math.cosh(v);
  const x = (Math.sinh(v) * Math.cos(tau * u)) / bottom;
  const y = (Math.sinh(v) * Math.sin(tau * u)) / bottom;
  const z = (Math.cosh(v) * Math.sinh(u)) / bottom;
  target.set(x, z, y);
};

export { calcAspect, helicoid };
