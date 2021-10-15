import imagesLoaded from "imagesloaded";

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

export { getNormalizedMousePos, preloadImages, getPointsInPath };
