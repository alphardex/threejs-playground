import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
import { faceModelUrl } from "@/consts/lineWave";
// @ts-ignore
import lineWaveVertexShader from "../shaders/lineWave/vertex.glsl";
// @ts-ignore
import lineWaveFragmentShader from "../shaders/lineWave/fragment.glsl";
import { loadModel } from "@/utils/misc";

class LineWave extends Base {
  rt!: THREE.WebGLRenderTarget;
  rtCamera!: THREE.PerspectiveCamera;
  depthMaterial!: THREE.ShaderMaterial;
  faceMesh!: THREE.Object3D;
  clock: THREE.Clock;
  params: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.cameraPosition = new THREE.Vector3(-0.25, 0, 1.5);
    this.clock = new THREE.Clock();
    this.params = {
      faceZ: -0.75,
      depthScale: 0.75,
      faceColor: "#ED5464",
      lineColor: "#4EC0E9",
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createDepthMaterial();
    await this.createFace();
    this.createLines();
    this.createLight();
    this.createOrbitControls();
    // this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建包含深度信息的材质
  createDepthMaterial() {
    // From: three.js\examples\webgl_depth_texture.html
    const rt = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    rt.depthTexture = new THREE.DepthTexture(1, 1);
    this.rt = rt;
    const rtCamera = new THREE.PerspectiveCamera(40, 1, 2.1, 3);
    rtCamera.position.set(0, 0, 2);
    this.rtCamera = rtCamera;
    const depthMaterial = new THREE.ShaderMaterial({
      vertexShader: lineWaveVertexShader,
      fragmentShader: lineWaveFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uDepth: {
          value: rt.depthTexture,
        },
        cameraNear: { value: rtCamera.near },
        cameraFar: { value: rtCamera.far },
        uTime: {
          value: 0,
        },
        uDepthScale: {
          value: this.params.depthScale,
        },
        uFaceColor: {
          value: new THREE.Color(this.params.faceColor),
        },
        uLineColor: {
          value: new THREE.Color(this.params.lineColor),
        },
      },
    });
    this.depthMaterial = depthMaterial;
  }
  // 创建球体
  createSphere() {
    const mesh = this.createMesh({
      geometry: new THREE.SphereGeometry(8, 100),
      material: new THREE.MeshBasicMaterial({
        color: 0x000000,
      }),
    });
    mesh.scale.set(0.05, 0.05, 0.05);
    mesh.position.set(0, 0, this.params.faceZ);
    this.faceMesh = mesh;
  }
  // 创建人脸
  async createFace() {
    const model = await loadModel(faceModelUrl);
    const mesh = model.children[0].children[0];
    mesh.scale.set(0.05, 0.05, 0.05);
    mesh.position.set(0, 0, this.params.faceZ);
    mesh.rotation.set(ky.deg2rad(90), 0, 0);
    mesh.traverse((obj) => {
      if (obj.isObject3D) {
        (obj as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color: 0x000000,
        });
      }
    });
    this.scene.add(mesh);
    this.faceMesh = mesh;
  }
  // 创建线
  createLines(count = 100) {
    const material = this.depthMaterial;
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.PlaneBufferGeometry(2, 0.005, 300, 1);
      const yCoordCount = geometry.attributes.position.array.length / 3;
      const yCoord = i / count;
      const yCoords = new Float32Array(yCoordCount).fill(yCoord);
      geometry.setAttribute("aY", new THREE.BufferAttribute(yCoords, 1));
      const halfCount = count / 2;
      const lineY = (i - halfCount) / halfCount;
      this.createMesh({
        geometry,
        material,
        position: new THREE.Vector3(0, lineY, 0),
      });
    }
  }
  // 动画
  update() {
    this.renderer.setRenderTarget(this.rt);
    this.renderer.render(this.scene, this.rtCamera);
    this.renderer.setRenderTarget(null);
    const elapsedTime = this.clock.getElapsedTime();
    if (this.faceMesh) {
      this.faceMesh.position.z =
        this.params.faceZ + 0.2 * Math.sin(elapsedTime);
    }
    this.depthMaterial.uniforms.uTime.value = elapsedTime;
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI();
    gui.addColor(this.params, "faceColor").onFinishChange(() => {
      this.depthMaterial.uniforms.uFaceColor.value.set(this.params.faceColor);
    });
    gui.addColor(this.params, "lineColor").onFinishChange(() => {
      this.depthMaterial.uniforms.uLineColor.value.set(this.params.lineColor);
    });
  }
}

export default LineWave;
