import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "@/commons/base";
import {
  GPUComputationRenderer,
  Variable,
} from "three/examples/jsm/misc/GPUComputationRenderer.js";
import FBOParticlesBasicVertexShader from "../shaders/FBOParticles/basic/vertex.glsl";
import FBOParticlesBasicFragmentShader from "../shaders/FBOParticles/basic/fragment.glsl";
import FBOParticlesGPUFragmentShader from "../shaders/FBOParticles/gpu/fragment.glsl";
import { faceModelUrl } from "@/consts/FBOParticles";
import { loadModel } from "@/utils/loader";

class FBOParticles extends Base {
  clock!: THREE.Clock;
  FBOParticlesMaterial!: THREE.ShaderMaterial;
  FBOParticlesGeometry!: THREE.BufferGeometry;
  gpuCompute!: GPUComputationRenderer;
  positionVariable!: Variable;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
    this.params = {
      width: 128,
      amplitude: 0.0005,
      pointSize: 4,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    await this.initGPU();
    this.createFBOParticlesMaterial();
    this.createFBOParticlesGeometry();
    this.createPoints();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 初始化GPU
  // https://threejs.org/examples/#webgl_gpgpu_birds
  async initGPU() {
    const width = this.params.width;
    const gpuCompute = new GPUComputationRenderer(width, width, this.renderer);
    const dtPosition = gpuCompute.createTexture();
    await this.fillPositionTexture(dtPosition);
    const positionVariable = gpuCompute.addVariable(
      "texturePosition",
      FBOParticlesGPUFragmentShader,
      dtPosition
    );
    positionVariable.material.uniforms = {
      uTime: {
        value: 0,
      },
      uAmplitude: {
        value: this.params.amplitude,
      },
    };
    positionVariable.wrapS = THREE.RepeatWrapping;
    positionVariable.wrapT = THREE.RepeatWrapping;
    gpuCompute.init();
    this.positionVariable = positionVariable;
    this.gpuCompute = gpuCompute;
  }
  // 填充position材质
  async fillPositionTexture(dataTexture: THREE.DataTexture) {
    const data = dataTexture.image.data;
    const model = await this.getModel();
    const { modelData, vertCount } = this.getModelData(model as any);
    for (let i = 0; i < data.length; i += 4) {
      const rand = Math.floor(Math.random() * vertCount);
      const x = modelData[rand * 3];
      const y = modelData[rand * 3 + 1];
      const z = modelData[rand * 3 + 2];
      data[i] = x;
      data[i + 1] = y;
      data[i + 2] = z;
      data[i + 3] = 1;
    }
  }
  // 获取模型
  async getModel() {
    const model = await loadModel(faceModelUrl);
    const mesh = model.scene.children[0].children[0].children[4] as THREE.Mesh;
    mesh.geometry.scale(0.1, 0.1, 0.1);
    mesh.geometry.rotateX(ky.deg2rad(90));
    return mesh;
    // const geometry = new THREE.SphereBufferGeometry(1, 128, 128);
    // const material = new THREE.MeshBasicMaterial();
    // const mesh = this.createMesh({ geometry, material });
    // return mesh;
  }
  // 获取模型数据
  getModelData(model: THREE.Mesh) {
    const modelData = (model.geometry as any).attributes.position.array;
    const vertCount = modelData.length / 3;
    return { modelData, vertCount };
  }
  // 创建材质
  createFBOParticlesMaterial() {
    const FBOParticlesMaterial = new THREE.ShaderMaterial({
      vertexShader: FBOParticlesBasicVertexShader,
      fragmentShader: FBOParticlesBasicFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {
          value: 0,
        },
        uMouse: {
          value: new THREE.Vector2(0, 0),
        },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uPositionTexture: {
          value: null,
        },
        uPointSize: {
          value: this.params.pointSize,
        },
      },
    });
    this.FBOParticlesMaterial = FBOParticlesMaterial;
  }
  // 创建形状
  createFBOParticlesGeometry() {
    const geometry = new THREE.BufferGeometry();
    const width = this.params.width;
    const positions = new Float32Array(width * width * 3);
    const reference = new Float32Array(width * width * 2);
    for (let i = 0; i < width * width; i++) {
      const x = Math.random();
      const y = Math.random();
      const z = Math.random();
      positions.set([x, y, z], i * 3);
      const xx = (i % width) / width;
      const yy = Math.floor(i / width) / width;
      reference.set([xx, yy], i * 2);
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("reference", new THREE.BufferAttribute(reference, 2));
    this.FBOParticlesGeometry = geometry;
  }
  // 创建微粒
  createPoints() {
    const geometry = this.FBOParticlesGeometry;
    const material = this.FBOParticlesMaterial;
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
  }
  // 动画
  update() {
    this.gpuCompute.compute();
    const positionVariable = this.gpuCompute.getCurrentRenderTarget(
      this.positionVariable
    ) as any;
    const positionTexture = positionVariable.texture;
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.FBOParticlesMaterial) {
      this.FBOParticlesMaterial.uniforms.uTime.value = elapsedTime;
      this.FBOParticlesMaterial.uniforms.uMouse.value = mousePos;
      this.FBOParticlesMaterial.uniforms.uPositionTexture.value =
        positionTexture;
    }
    if (this.positionVariable) {
      this.positionVariable.material.uniforms.uTime.value = elapsedTime;
    }
  }
}

export default FBOParticles;
