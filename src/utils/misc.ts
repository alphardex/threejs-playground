import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import {
  TextGeometry,
  TextGeometryParameters,
} from "three/examples/jsm/geometries/TextGeometry";
import { point2Array } from "./math";

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

// 创建文本
const createText = (
  text = "",
  config: TextGeometryParameters,
  material: THREE.Material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
  })
) => {
  const geo = new TextGeometry(text, config);
  const mesh = new THREE.Mesh(geo, material);
  return mesh;
};

// 从mesh上取样微粒位置信息
const sampleParticlesPositionFromMesh = (
  geometry: THREE.BufferGeometry,
  count = 10000
) => {
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  const sampler = new MeshSurfaceSampler(mesh).build();
  const particlesPosition = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const position = new THREE.Vector3();
    sampler.sample(position);
    particlesPosition.set(point2Array(position), i * 3);
  }
  return particlesPosition;
};

// 获取viewport
const getViewport = (camera: THREE.Camera) => {
  const position = new THREE.Vector3();
  const target = new THREE.Vector3();
  const distance = camera.getWorldPosition(position).distanceTo(target);
  const fov = ((camera as any).fov * Math.PI) / 180; // convert vertical fov to radians
  const h = 2 * Math.tan(fov / 2) * distance; // visible height
  const w = h * (window.innerWidth / window.innerHeight);
  const viewport = { width: w, height: h };
  return viewport;
};

export {
  getBaryCoord,
  createText,
  sampleParticlesPositionFromMesh,
  getViewport,
};
