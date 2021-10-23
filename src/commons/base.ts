import * as THREE from "three";
import * as CANNON from "cannon-es";
import {
  MeshObject,
  OrthographicCameraParams,
  PerspectiveCameraParams,
} from "@/types";
import { calcAspect } from "@/utils/dom";
import { MeshPhysicsObject } from "@/utils/physics";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import Stats from "three/examples/jsm/libs/stats.module";
import { MouseTracker } from "@/utils/dom";

class Base {
  debug: boolean;
  container: HTMLElement | null;
  perspectiveCameraParams: PerspectiveCameraParams;
  orthographicCameraParams: OrthographicCameraParams;
  cameraPosition: THREE.Vector3;
  lookAtPosition: THREE.Vector3;
  rendererParams: THREE.WebGLRendererParameters;
  mouseTracker: MouseTracker;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  stats: Stats;
  shaderMaterial: THREE.ShaderMaterial;
  composer: EffectComposer;
  constructor(sel: string, debug = false) {
    this.debug = debug;
    this.container = document.querySelector(sel);
    this.perspectiveCameraParams = {
      fov: 75,
      near: 0.1,
      far: 100,
    };
    this.orthographicCameraParams = {
      zoom: 2,
      near: -100,
      far: 1000,
    };
    this.cameraPosition = new THREE.Vector3(0, 3, 10);
    this.lookAtPosition = new THREE.Vector3(0, 0, 0);
    this.rendererParams = {
      alpha: true,
      antialias: true,
    };
    this.mouseTracker = new MouseTracker();
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createMesh({});
    this.createLight();
    this.createOrbitControls();
    this.createDebugUI();
    this.addListeners();
    this.setLoop();
  }
  // 创建场景
  createScene() {
    const scene = new THREE.Scene();
    this.scene = scene;
  }
  // 创建透视相机
  createPerspectiveCamera() {
    const { perspectiveCameraParams, cameraPosition, lookAtPosition } = this;
    const { fov, near, far } = perspectiveCameraParams;
    const aspect = calcAspect(this.container);
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.copy(cameraPosition);
    camera.lookAt(lookAtPosition);
    this.camera = camera;
  }
  // 创建正交相机
  createOrthographicCamera() {
    const { orthographicCameraParams, cameraPosition, lookAtPosition } = this;
    const { left, right, top, bottom, near, far } = orthographicCameraParams;
    const camera = new THREE.OrthographicCamera(
      left,
      right,
      top,
      bottom,
      near,
      far
    );
    camera.position.copy(cameraPosition);
    camera.lookAt(lookAtPosition);
    this.camera = camera;
  }
  // 更新正交相机参数
  updateOrthographicCameraParams() {
    const { container } = this;
    const { zoom, near, far } = this.orthographicCameraParams;
    const aspect = calcAspect(container);
    this.orthographicCameraParams = {
      left: -zoom * aspect,
      right: zoom * aspect,
      top: zoom,
      bottom: -zoom,
      near,
      far,
      zoom,
    };
  }
  // 创建渲染
  createRenderer() {
    const { rendererParams } = this;
    const renderer = new THREE.WebGLRenderer(rendererParams);
    this.container.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.resizeRendererToDisplaySize();
  }
  // 调整渲染器尺寸
  resizeRendererToDisplaySize() {
    const { renderer } = this;
    renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  // 创建网格
  createMesh(
    meshObject: MeshObject,
    container: THREE.Scene | THREE.Mesh = this.scene
  ) {
    const {
      geometry = new THREE.BoxGeometry(1, 1, 1),
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#d9dfc8"),
      }),
      position = new THREE.Vector3(0, 0, 0),
    } = meshObject;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    container.add(mesh);
    return mesh;
  }
  // 创建光源
  createLight() {
    const dirLight = new THREE.DirectionalLight(
      new THREE.Color("#ffffff"),
      0.5
    );
    dirLight.position.set(0, 50, 0);
    this.scene.add(dirLight);
    const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.4);
    this.scene.add(ambiLight);
  }
  // 创建轨道控制
  createOrbitControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    const { lookAtPosition } = this;
    controls.target.copy(lookAtPosition);
    controls.update();
    this.controls = controls;
  }
  // 创建调试UI
  createDebugUI() {
    const axisHelper = new THREE.AxesHelper();
    this.scene.add(axisHelper);
    const stats = Stats();
    this.container.appendChild(stats.dom);
    this.stats = stats;
  }
  // 监听事件
  addListeners() {
    this.onResize();
  }
  // 监听画面缩放
  onResize() {
    window.addEventListener("resize", (e) => {
      const aspect = calcAspect(this.container);
      const camera = this.camera as THREE.PerspectiveCamera;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      this.resizeRendererToDisplaySize();
      if (this.shaderMaterial) {
        this.shaderMaterial.uniforms.uResolution.value.x = window.innerWidth;
        this.shaderMaterial.uniforms.uResolution.value.y = window.innerHeight;
      }
    });
  }
  // 动画
  update() {
    console.log("animation");
  }
  // 渲染
  setLoop() {
    this.renderer.setAnimationLoop(() => {
      this.update();
      if (this.controls) {
        this.controls.update();
      }
      if (this.stats) {
        this.stats.update();
      }
      if (this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    });
  }
}

class PhysicsBase extends Base {
  world: CANNON.World;
  gravity: CANNON.Vec3;
  meshPhysicsObjs: MeshPhysicsObject[];
  constructor(sel: string, debug = false) {
    super(sel, debug);
    this.gravity = new CANNON.Vec3(0, -9.82, 0);
    this.meshPhysicsObjs = [];
  }
  // 创建物理世界
  createWorld() {
    const { gravity } = this;
    const world = new CANNON.World();
    world.gravity.copy(gravity);
    this.world = world;
  }
  // 创建物理物体
  createBody(
    shape: CANNON.Shape,
    body: CANNON.Body,
    bodyOffset: CANNON.Vec3 = new CANNON.Vec3(0, 0, 0),
    orientation: CANNON.Quaternion = new CANNON.Quaternion(0, 0, 0)
  ) {
    body.addShape(shape, bodyOffset, orientation);
    this.world.addBody(body);
    return body;
  }
  // 动画
  update() {
    this.sync();
    this.world.step(1 / 60);
  }
  // 同步物理和渲染
  sync() {
    this.meshPhysicsObjs.forEach((obj) => {
      const { mesh, body, copyPosition, copyQuaternion } = obj;
      if (copyPosition) {
        mesh.position.copy(body.position as any);
      }
      if (copyQuaternion) {
        mesh.quaternion.copy(body.quaternion as any);
      }
    });
  }
}

export { Base, PhysicsBase };
