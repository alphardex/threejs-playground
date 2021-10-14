import * as THREE from "three";
import imagesLoaded from "imagesloaded";
import { HTMLIVCElement, MeshSizeType, MeshType, Scroll } from "@/types";

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
class Maku {
  el!: HTMLIVCElement; // 元素
  rect!: DOMRect; // 元素矩阵
  mesh!: THREE.Mesh | THREE.Points; // 网格
  constructor(
    el: HTMLIVCElement,
    material: THREE.ShaderMaterial,
    scene: THREE.Scene,
    meshType: MeshType = "mesh",
    meshSizeType: MeshSizeType = "size",
    segments = {
      width: 64,
      height: 64,
    }
  ) {
    this.el = el;

    const texture = new THREE.Texture(el);
    texture.needsUpdate = true;
    const materialCopy = material.clone();
    materialCopy.uniforms.uTexture.value = texture;

    const rect = el.getBoundingClientRect();
    const { width, height } = rect;
    this.rect = rect;

    const geometryMap = {
      size: new THREE.PlaneBufferGeometry(
        width,
        height,
        segments.width,
        segments.height
      ),
      scale: new THREE.PlaneBufferGeometry(
        1,
        1,
        segments.width,
        segments.height
      ),
    };
    const geometry = geometryMap[meshSizeType];

    const meshMap = {
      points: new THREE.Points(geometry, materialCopy),
      mesh: new THREE.Mesh(geometry, materialCopy),
    };
    const mesh = meshMap[meshType];
    if (meshSizeType === "scale") {
      mesh.scale.set(width, height, 1);
    }
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
class MakuGroup {
  makus: Maku[];
  constructor() {
    this.makus = [];
  }
  // 添加元素
  add(maku: Maku) {
    this.makus.push(maku);
    return maku;
  }
  // 批量同步元素位置
  setPositions(deltaY = window.scrollY) {
    const { makus } = this;
    makus.forEach((obj) => {
      obj.setPosition(deltaY);
    });
  }
}

// 滚动监听器
class Scroller {
  scroll!: Scroll;
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
  // 监听滚动
  listenForScroll() {
    window.addEventListener("scroll", () => {
      const oldScrollY = this.scroll.target;
      const newScrollY = window.scrollY;
      const scrollYDelta = newScrollY - oldScrollY;
      this.scroll.target += scrollYDelta;
    });
  }
  // 同步滚动的数据
  syncScroll() {
    this.scroll.current = THREE.MathUtils.lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    this.scroll.delta = this.scroll.current - this.scroll.last;
    this.scroll.direction = this.scroll.delta > 0 ? "down" : "up";
    this.scroll.last = this.scroll.current;
  }
}

// 获取跟屏幕同像素的fov角度
const getScreenFov = (z: number) => {
  return THREE.MathUtils.radToDeg(2 * Math.atan(window.innerHeight / 2 / z));
};

export {
  getNormalizedMousePos,
  preloadImages,
  getPointsInPath,
  Maku,
  MakuGroup,
  Scroller,
  getScreenFov,
};
