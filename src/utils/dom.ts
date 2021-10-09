import * as THREE from "three";
import imagesLoaded from "imagesloaded";
import NormalizeWheel from "normalize-wheel";
import { lerp } from "./math";

// 获取归一化的鼠标位置
const getNormalizedMousePos = (e: MouseEvent | Touch) => {
  return {
    x: (e.clientX / window.innerWidth) * 2 - 1,
    y: -(e.clientY / window.innerHeight) * 2 + 1,
  };
};

// 图片预加载
const preloadImages = (sel = "img") => {
  return new Promise((resolve) => {
    imagesLoaded(sel, { background: true }, resolve);
  });
};

// 根据点数获取路径上的所有点
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

// 用于同步HTML元素与WebGL的平面元素
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
  // 同步位置
  setPosition(deltaY = window.scrollY) {
    const { mesh, rect } = this;
    const { top, left, width, height } = rect;
    const x = left + width / 2 - window.innerWidth / 2;
    const y = -(top + height / 2 - window.innerHeight / 2) + deltaY;
    mesh.position.set(x, y, 0);
  }
}

// 同步元素的集合
class ImageDOMMeshObjGroup {
  imageDOMMeshObjs: DOMMeshObject[];
  materials: THREE.ShaderMaterial[];
  constructor() {
    this.imageDOMMeshObjs = [];
    this.materials = [];
  }
  // 添加元素
  addObject(
    image: HTMLImageElement,
    scene: THREE.Scene,
    mat: THREE.ShaderMaterial
  ) {
    const texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    const material = mat.clone();
    material.uniforms.uTexture.value = texture;
    this.materials.push(material);
    const imageDOMMeshObj = new DOMMeshObject(image, scene, material);
    this.imageDOMMeshObjs.push(imageDOMMeshObj);
    return imageDOMMeshObj;
  }
  // 批量同步元素位置
  setObjsPosition(deltaY = window.scrollY) {
    const { imageDOMMeshObjs } = this;
    imageDOMMeshObjs.forEach((obj) => {
      obj.setPosition(deltaY);
    });
  }
}

// 鼠标滚轮监听器
class MouseWheelScroller {
  scroll!: any;
  constructor() {
    this.scroll = {
      current: 0,
      target: 0,
      ease: 0.05,
      last: 0,
      delta: 0,
      direction: "",
    };
  }
  // 监听滚轮滚动
  listenForWheel(strength = 0.5) {
    window.addEventListener("mousewheel", (e) => {
      const normalized = NormalizeWheel(e);
      const speed = normalized.pixelY;
      const scrollY = speed * strength;
      this.scroll.target += scrollY;
    });
  }
  // 同步滚动的数据
  syncScroll() {
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    this.scroll.delta = this.scroll.current - this.scroll.last;
    this.scroll.direction = this.scroll.delta > 0 ? "down" : "up";
    this.scroll.last = this.scroll.current;
  }
}

export {
  getNormalizedMousePos,
  preloadImages,
  getPointsInPath,
  DOMMeshObject,
  ImageDOMMeshObjGroup,
  MouseWheelScroller,
};
