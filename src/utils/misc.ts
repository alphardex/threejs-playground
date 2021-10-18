import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import {
  TextGeometry,
  TextGeometryParameters,
} from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader";
import { point2Array } from "./math";
import { MouseTracker } from "./dom";

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
const loadModel = (
  url: string,
  useDraco = true,
  dracoPath = "./static/draco/"
): Promise<THREE.Object3D> => {
  const loader = new GLTFLoader();
  if (useDraco) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(dracoPath);
    loader.setDRACOLoader(dracoLoader);
  }
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
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

// 遍历模型，使其扁平化
const flatModel = (model: THREE.Object3D): THREE.Object3D[] => {
  const modelPartsArray = [];
  model.traverse((obj) => {
    modelPartsArray.push(obj);
  });
  return modelPartsArray;
};

// 打印扁平模型的所有部分
const printModel = (modelParts: THREE.Object3D[], modelName = "modelParts") => {
  const strArray = modelParts.map((obj, i) => {
    const row = `const ${obj.name} = ${modelName}[${i}];`;
    return row;
  });
  const str = strArray.join("\n");
  console.log(str);
  return str;
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

class RaycastSelector {
  scene: THREE.Scene;
  camera: THREE.Camera;
  raycaster: THREE.Raycaster;
  mouseTracker: MouseTracker;
  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.mouseTracker = new MouseTracker();
    this.mouseTracker.trackMousePos();
  }
  // 获取点击物
  getInterSects(
    targets: THREE.Object3D[] = this.scene.children
  ): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouseTracker.mousePos, this.camera);
    const intersects = this.raycaster.intersectObjects(targets, true);
    return intersects;
  }
  // 获取第一个选中物
  getFirstIntersect(targets: THREE.Object3D[] = this.scene.children) {
    const intersects = this.getInterSects(targets);
    const intersect = intersects[0];
    if (!intersect || !intersect.face) {
      return null;
    }
    return intersect;
  }
  // 选中点击物时
  onChooseIntersect(target: THREE.Object3D) {
    const intersect = this.getFirstIntersect();
    if (!intersect) {
      return null;
    }
    const object = intersect.object;
    return target === object ? intersect : null;
  }
  // 高亮选中物
  highlightIntersect(color = "#ff0000") {
    document.addEventListener("click", () => {
      const intersect = this.getFirstIntersect();
      if (!intersect) {
        return null;
      }
      const object = intersect.object as THREE.Mesh;
      const material = object.material as any;
      console.log(object.name);
      if (!material.isHighlighted) {
        material.isHighlighted = true;
        material.originColor = new THREE.Color(
          material.color.r,
          material.color.g,
          material.color.b
        );
        material.color.set(color);
      } else {
        material.isHighlighted = false;
        material.color.set(material.originColor);
      }
    });
  }
}

export {
  createText,
  loadModel,
  flatModel,
  printModel,
  loadFBXModel,
  loadFont,
  loadAudio,
  loadHDR,
  sampleParticlesPositionFromMesh,
  getViewport,
  RaycastSelector,
};
