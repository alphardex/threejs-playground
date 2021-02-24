import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
import { faceModelUrl } from "@/consts/lineWave";
// @ts-ignore
import lineWaveVertexShader from "../shaders/lineWave/vertex.glsl";
// @ts-ignore
import lineWaveFragmentShader from "../shaders/lineWave/fragment.glsl";

class LineWave extends Base {
  rt!: THREE.WebGLRenderTarget;
  rtCamera!: THREE.PerspectiveCamera;
  material!: THREE.ShaderMaterial;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.renderer.setClearColor(0xeeeeee, 1);
    this.createLines();
    await this.createFace();
    this.createLight();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建渲染目标，即包含深度信息的贴图
  // From: three.js\examples\webgl_depth_texture.html
  createRenderTarget() {
    const rt = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    rt.texture.format = THREE.RGBFormat;
    rt.texture.minFilter = THREE.NearestFilter;
    rt.texture.magFilter = THREE.NearestFilter;
    rt.texture.generateMipmaps = false;
    rt.stencilBuffer = false;
    rt.depthBuffer = true;
    rt.depthTexture = new THREE.DepthTexture(1, 1);
    rt.depthTexture.format = THREE.DepthFormat;
    rt.depthTexture.type = THREE.UnsignedShortType;
    this.rt = rt;
    const rtCamera = new THREE.PerspectiveCamera(40, 1, 2, 2.5);
    rtCamera.position.set(0, 0, 2);
    this.rtCamera = rtCamera;
  }
  // 创建线
  createLines(count = 20) {
    // const geometry = new THREE.PlaneGeometry(1, 0.01, 100, 1);
    // const material = new THREE.ShaderMaterial({
    //   vertexShader: lineWaveVertexShader,
    //   fragmentShader: lineWaveFragmentShader,
    //   side: THREE.DoubleSide,
    // });
    // for (let i = 0; i < count; i++) {
    //   const lineY = (i - count / 2) / count;
    //   const mesh = this.createMesh({
    //     geometry,
    //     material,
    //     position: new THREE.Vector3(0, lineY, 0),
    //   });
    // }
    this.createRenderTarget();
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 200, 200);
    const material = new THREE.ShaderMaterial({
      vertexShader: lineWaveVertexShader,
      fragmentShader: lineWaveFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uDepth: {
          value: this.rt.texture,
        },
        cameraNear: { value: this.rtCamera.near },
        cameraFar: { value: this.rtCamera.far },
      },
    });
    this.material = material;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 创建人脸
  async createFace() {
    const model = await this.loadModel(faceModelUrl);
    const mesh = model.children[0].children[0];
    console.log(mesh);
    mesh.scale.set(0.05, 0.05, 0.05);
    mesh.position.set(0, 0, -0.5);
    mesh.rotation.set(ky.deg2rad(90), 0, 0);
    mesh.traverse((obj) => {
      if (obj.isObject3D) {
        (obj as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
        });
      }
    });
    this.scene.add(mesh);
  }
  // 动画
  update() {
    this.renderer.setRenderTarget(this.rt);
    this.renderer.render(this.scene, this.rtCamera);
    this.renderer.setRenderTarget(null);
  }
}

export default LineWave;
