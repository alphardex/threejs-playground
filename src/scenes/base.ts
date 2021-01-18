import * as THREE from "three";
import C from "cannon";
import { MeshObject } from "@/types";
import { calcAspect } from "@/utils/math";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { getNormalizedMousePos } from "@/utils/dom";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { MeshPhysicsObject } from "@/utils/physics";

class Base {
  debug: boolean;
  container: HTMLElement | null;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  rendererParams!: Record<string, any>;
  perspectiveCameraParams!: Record<string, any>;
  orthographicCameraParams!: Record<string, any>;
  cameraPosition!: THREE.Vector3;
  lookAtPosition!: THREE.Vector3;
  renderer!: THREE.WebGLRenderer;
  box!: THREE.Mesh;
  light!: THREE.PointLight | THREE.DirectionalLight;
  controls!: OrbitControls;
  mousePos!: THREE.Vector2;
  raycaster!: THREE.Raycaster;
  sound!: THREE.Audio;
  constructor(sel: string, debug = false) {
    this.debug = debug;
    this.container = document.querySelector(sel);
    this.rendererParams = {
      outputEncoding: THREE.LinearEncoding,
      config: {
        alpha: true,
        antialias: true,
      },
    };
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
    this.mousePos = new THREE.Vector2(0, 0);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createMesh({});
    this.createLight();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建场景
  createScene() {
    const scene = new THREE.Scene();
    if (this.debug) {
      scene.add(new THREE.AxesHelper());
    }
    this.scene = scene;
  }
  // 创建透视相机
  createPerspectiveCamera() {
    const { perspectiveCameraParams, cameraPosition, lookAtPosition } = this;
    const { fov, near, far } = perspectiveCameraParams;
    const aspect = calcAspect(this.container!);
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
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
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
    this.camera = camera;
  }
  // 更新正交相机参数
  updateOrthographicCameraParams() {
    const { container } = this;
    const { zoom, near, far } = this.orthographicCameraParams;
    const aspect = calcAspect(container!);
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
    const { outputEncoding, config } = rendererParams;
    const renderer = new THREE.WebGLRenderer(config);
    renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
    renderer.outputEncoding = outputEncoding;
    this.resizeRendererToDisplaySize();
    this.container?.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.renderer.setClearColor(0x000000, 0);
  }
  // 调整渲染器尺寸
  resizeRendererToDisplaySize() {
    const { renderer } = this;
    if (!renderer) {
      return;
    }
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const { clientWidth, clientHeight } = canvas;
    const width = (clientWidth * pixelRatio) | 0;
    const height = (clientHeight * pixelRatio) | 0;
    const isResizeNeeded = canvas.width !== width || canvas.height !== height;
    if (isResizeNeeded) {
      renderer.setSize(width, height, false);
    }
    return isResizeNeeded;
  }
  // 创建网格
  createMesh(
    meshObject: MeshObject,
    container: THREE.Scene | THREE.Mesh = this.scene
  ) {
    const {
      geometry = new THREE.BoxGeometry(1, 1, 1),
      material = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#d9dfc8"),
      }),
      position = new THREE.Vector3(0, 0, 0),
    } = meshObject;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    container.add(mesh);
    return mesh;
  }
  // 创建文本
  createText(
    text = "",
    config: THREE.TextGeometryParameters,
    material: any,
    color: number | THREE.Color
  ) {
    const mat = new material({ color });
    const geo = new THREE.TextGeometry(text, config);
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    const size = geo.boundingBox!.getSize(new THREE.Vector3());
    const mesh = new THREE.Mesh(geo, mat);
    return { mesh, size };
  }
  // 创建音效源
  createAudioSource() {
    const listener = new THREE.AudioListener();
    this.camera.add(listener);
    const sound = new THREE.Audio(listener);
    this.sound = sound;
  }
  // 加载音效
  loadAudio(url: string): Promise<AudioBuffer> {
    const loader = new THREE.AudioLoader();
    return new Promise((resolve) => {
      loader.load(url, (buffer) => {
        this.sound.setBuffer(buffer);
        resolve(buffer);
      });
    });
  }
  // 加载模型
  loadModel(url: string): Promise<THREE.Object3D> {
    const loader = new GLTFLoader();
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
  }
  // 加载FBX模型
  loadFBXModel(url: string): Promise<THREE.Object3D> {
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
  }
  // 加载字体
  loadFont(url: string): Promise<THREE.Font> {
    const loader = new THREE.FontLoader();
    return new Promise((resolve) => {
      loader.load(url, (font) => {
        resolve(font);
      });
    });
  }
  // 创建光源
  createLight() {
    const light = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 0.5);
    light.position.set(0, 50, 0);
    this.scene.add(light);
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color("#ffffff"),
      0.4
    );
    this.scene.add(ambientLight);
    this.light = light;
  }
  // 创建点选模型
  createRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.trackMousePos();
  }
  // 追踪鼠标位置
  trackMousePos() {
    window.addEventListener("mousemove", (e) => {
      this.setMousePos(e);
    });
    window.addEventListener("mouseout", () => {
      this.clearMousePos();
    });
    window.addEventListener("mouseleave", () => {
      this.clearMousePos();
    });
    window.addEventListener(
      "touchstart",
      (e: TouchEvent) => {
        e.preventDefault();
        this.setMousePos(e.touches[0]);
      },
      { passive: false }
    );
    window.addEventListener("touchmove", (e: TouchEvent) => {
      this.setMousePos(e.touches[0]);
    });
    window.addEventListener("touchend", () => {
      this.clearMousePos();
    });
  }
  // 设置鼠标位置
  setMousePos(e: MouseEvent | Touch) {
    const { x, y } = getNormalizedMousePos(e);
    this.mousePos.x = x;
    this.mousePos.y = y;
  }
  // 清空鼠标位置
  clearMousePos() {
    this.mousePos.x = -100000;
    this.mousePos.y = -100000;
  }
  // 获取点击物
  getInterSects(): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );
    return intersects;
  }
  // 选中点击物时
  onChooseIntersect(target: THREE.Object3D) {
    const intersects = this.getInterSects();
    const intersect = intersects[0];
    if (!intersect || !intersect.face) {
      return null;
    }
    const { object } = intersect;
    return target === object ? intersect : null;
  }
  // 创建轨道控制
  createOrbitControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    const { lookAtPosition } = this;
    controls.target.set(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
    controls.update();
    this.controls = controls;
  }
  // 监听事件
  addListeners() {
    this.onResize();
  }
  // 监听画面缩放
  onResize() {
    window.addEventListener("resize", (e) => {
      if (this.camera instanceof THREE.PerspectiveCamera) {
        const aspect = calcAspect(this.container!);
        const camera = this.camera as THREE.PerspectiveCamera;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        this.renderer.setSize(
          this.container!.clientWidth,
          this.container!.clientHeight
        );
      } else if (this.camera instanceof THREE.OrthographicCamera) {
        this.updateOrthographicCameraParams();
        const camera = this.camera as THREE.OrthographicCamera;
        const {
          left,
          right,
          top,
          bottom,
          near,
          far,
        } = this.orthographicCameraParams;
        camera.left = left;
        camera.right = right;
        camera.top = top;
        camera.bottom = bottom;
        camera.near = near;
        camera.far = far;
        camera.updateProjectionMatrix();
        this.renderer.setSize(
          this.container!.clientWidth,
          this.container!.clientHeight
        );
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
      this.resizeRendererToDisplaySize();
      this.update();
      if (this.controls) {
        this.controls.update();
      }
      this.renderer.render(this.scene, this.camera);
    });
  }
}

class PhysicsBase extends Base {
  world!: C.World;
  gravity!: C.Vec3;
  meshPhysicsObjs!: MeshPhysicsObject[];
  constructor(sel: string, debug = false) {
    super(sel, debug);
    this.gravity = new C.Vec3(0, 0, 0);
    this.meshPhysicsObjs = [];
  }
  // 创建物理世界
  createWorld() {
    const { gravity } = this;
    const world = new C.World();
    world.gravity.set(gravity.x, gravity.y, gravity.z);
    this.world = world;
  }
  // 创建物理物体
  createBody(
    shape: C.Shape,
    body: C.Body,
    bodyOffset: C.Vec3 = new C.Vec3(0, 0, 0),
    orientation: C.Quaternion = new C.Quaternion(0, 0, 0)
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
