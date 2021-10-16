import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import {
  TextGeometry,
  TextGeometryParameters,
} from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader";
import { point2Array } from "./math";

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

// 加载GLTF模型
const loadModel = (url: string): Promise<THREE.Object3D> => {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        console.log(model);
        resolve(model);
      },
      undefined,
      (err) => {
        console.log(err);
        reject();
      }
    );
  });
};

// 加载FBX模型
const loadFBXModel = (url: string): Promise<THREE.Object3D> => {
  const loader = new FBXLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (obj) => {
        resolve(obj);
      },
      undefined,
      (err) => {
        console.log(err);
        reject();
      }
    );
  });
};

// 加载字体
const loadFont = (url: string): Promise<Font> => {
  const loader = new FontLoader();
  return new Promise((resolve) => {
    loader.load(url, (font) => {
      resolve(font);
    });
  });
};

// 加载音效
const loadAudio = (url: string): Promise<AudioBuffer> => {
  const loader = new THREE.AudioLoader();
  return new Promise((resolve) => {
    loader.load(url, (buffer) => {
      //   this.sound.setBuffer(buffer);
      resolve(buffer);
    });
  });
};

// 加载HDR
const loadHDR = (
  url: string,
  renderer: THREE.WebGLRenderer
): Promise<THREE.Texture> => {
  const loader = new RGBELoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        const generator = new THREE.PMREMGenerator(renderer);
        const envmap = generator.fromEquirectangular(texture).texture;
        texture.dispose();
        generator.dispose();
        resolve(envmap);
      },
      undefined,
      (err) => {
        console.log(err);
        reject();
      }
    );
  });
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
  createText,
  loadModel,
  loadFBXModel,
  loadFont,
  loadAudio,
  loadHDR,
  sampleParticlesPositionFromMesh,
  getViewport,
};
