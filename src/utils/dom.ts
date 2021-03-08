import * as THREE from "three";
import imagesLoaded from "imagesloaded";

const getNormalizedMousePos = (e: MouseEvent | Touch) => {
  return {
    x: (e.clientX / window.innerWidth) * 2 - 1,
    y: -(e.clientY / window.innerHeight) * 2 + 1,
  };
};

class DOMMeshObject {
  el!: Element;
  rect!: DOMRect;
  mesh!: THREE.Mesh | THREE.Points;
  constructor(
    el: Element,
    scene: THREE.Scene,
    material: THREE.Material = new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    isPoints = false
  ) {
    this.el = el;
    const rect = el.getBoundingClientRect();
    this.rect = rect;
    const { width, height } = rect;
    const geometry = new THREE.PlaneBufferGeometry(
      width,
      height,
      width,
      height
    );
    const mesh = isPoints
      ? new THREE.Points(geometry, material)
      : new THREE.Mesh(geometry, material);
    scene.add(mesh);
    this.mesh = mesh;
  }
  setPosition() {
    const { mesh, rect } = this;
    const { top, left, width, height } = rect;
    const x = left + width / 2 - window.innerWidth / 2;
    const y = -(top + height / 2 - window.innerHeight / 2) + window.scrollY;
    mesh.position.set(x, y, 0);
  }
}

const preloadImages = (sel = "img") => {
  return new Promise((resolve) => {
    imagesLoaded(sel, { background: true }, resolve);
  });
};

const getPointsInPath = (path: SVGPathElement, pointNum = 4) => {
  const points = [];
  const pathLength = path.getTotalLength();
  const pointCount = Math.floor(pathLength / pointNum);
  for (let i = 0; i < pointCount; i++) {
    const distance = (pathLength * i) / pointCount;
    const point = path.getPointAtLength(distance);
    points.push(point);
  }
  return points;
};

export { getNormalizedMousePos, DOMMeshObject, preloadImages, getPointsInPath };
