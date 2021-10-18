import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader";

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

export {
  loadModel,
  flatModel,
  printModel,
  loadFBXModel,
  loadFont,
  loadAudio,
  loadHDR,
};
