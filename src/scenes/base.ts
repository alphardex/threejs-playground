import * as THREE from "three";
import * as CANNON from "cannon-es";
import ky from "kyouka";
import { MeshObject } from "@/types";
import { calcAspect } from "@/utils/math";
import { MeshPhysicsObject } from "@/utils/physics";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { getNormalizedMousePos } from "@/utils/dom";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import Stats from "three/examples/jsm/libs/stats.module";

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
  controls!: OrbitControls;
  mousePos!: THREE.Vector2;
  raycaster!: THREE.Raycaster;
  sound!: THREE.Audio;
  stats!: Stats;
  composer!: EffectComposer;
  shaderMaterial!: THREE.ShaderMaterial;
  mouseSpeed!: number;
  viewport!: any;
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
      outputEncoding: THREE.LinearEncoding,
      config: {
        alpha: true,
        antialias: true,
      },
    };
    this.mousePos = new THREE.Vector2(0, 0);
    this.mouseSpeed = 0;
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
      const stats = Stats();
      this.container!.appendChild(stats.dom);
      this.stats = stats;
    }
    this.scene = scene;
  }
  // 创建透视相机
  createPerspectiveCamera() {
    const { perspectiveCameraParams, cameraPosition, lookAtPosition } = this;
    const { fov, near, far } = perspectiveCameraParams;
    const aspect = calcAspect(this.container!);
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
  createRenderer(useWebGL1 = false) {
    const { rendererParams } = this;
    const { outputEncoding, config } = rendererParams;
    const renderer = !useWebGL1
      ? new THREE.WebGLRenderer(config)
      : new THREE.WebGL1Renderer(config);
    renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
    renderer.outputEncoding = outputEncoding;
    this.resizeRendererToDisplaySize();
    this.container?.appendChild(renderer.domElement);
    this.renderer = renderer;
    this.renderer.setClearColor(0x000000, 0);
  }
  // 允许投影
  enableShadow() {
    this.renderer.shadowMap.enabled = true;
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
  // 监听事件
  addListeners() {
    this.onResize();
  }
  // 监听画面缩放
  onResize() {
    window.addEventListener("resize", (e) => {
      if (this.shaderMaterial) {
        this.shaderMaterial.uniforms.uResolution.value.x = window.innerWidth;
        this.shaderMaterial.uniforms.uResolution.value.y = window.innerHeight;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      } else {
        if (this.camera instanceof THREE.PerspectiveCamera) {
          const aspect = calcAspect(this.container!);
          const camera = this.camera as THREE.PerspectiveCamera;
          camera.aspect = aspect;
          camera.updateProjectionMatrix();
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
        }
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
  // 创建文本
  createText(
    text = "",
    config: THREE.TextGeometryParameters,
    material: THREE.Material = new THREE.MeshStandardMaterial({
      color: "#ffffff",
    })
  ) {
    const geo = new THREE.TextGeometry(text, config);
    const mesh = new THREE.Mesh(geo, material);
    return mesh;
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
    window.addEventListener(
      "touchstart",
      (e: TouchEvent) => {
        this.setMousePos(e.touches[0]);
      },
      { passive: false }
    );
    window.addEventListener("touchmove", (e: TouchEvent) => {
      this.setMousePos(e.touches[0]);
    });
  }
  // 设置鼠标位置
  setMousePos(e: MouseEvent | Touch) {
    const { x, y } = getNormalizedMousePos(e);
    this.mousePos.x = x;
    this.mousePos.y = y;
  }
  // 获取点击物
  getInterSects(container = this.scene): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const intersects = this.raycaster.intersectObjects(
      container.children,
      true
    );
    return intersects;
  }
  // 选中点击物时
  onChooseIntersect(target: THREE.Object3D, container = this.scene) {
    const intersects = this.getInterSects(container);
    const intersect = intersects[0];
    if (!intersect || !intersect.face) {
      return null;
    }
    const { object } = intersect;
    return target === object ? intersect : null;
  }
  // 获取跟屏幕同像素的fov角度
  getScreenFov() {
    return ky.rad2deg(
      2 * Math.atan(window.innerHeight / 2 / this.cameraPosition.z)
    );
  }
  // 获取重心坐标系
  getBaryCoord(bufferGeometry: THREE.BufferGeometry) {
    // https://gist.github.com/mattdesl/e399418558b2b52b58f5edeafea3c16c
    const length = bufferGeometry.attributes.position.array.length;
    const count = length / 3;
    const bary = [];
    for (let i = 0; i < count; i++) {
      bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
    }
    const aCenter = new Float32Array(bary);
    bufferGeometry.setAttribute(
      "aCenter",
      new THREE.BufferAttribute(aCenter, 3)
    );
  }
  // 追踪鼠标速度
  trackMouseSpeed() {
    // https://stackoverflow.com/questions/6417036/track-mouse-speed-with-js
    let lastMouseX = -1;
    let lastMouseY = -1;
    let mouseSpeed = 0;
    window.addEventListener("mousemove", (e) => {
      const mousex = e.pageX;
      const mousey = e.pageY;
      if (lastMouseX > -1) {
        mouseSpeed = Math.max(
          Math.abs(mousex - lastMouseX),
          Math.abs(mousey - lastMouseY)
        );
        this.mouseSpeed = mouseSpeed / 100;
      }
      lastMouseX = mousex;
      lastMouseY = mousey;
    });
    document.addEventListener("mouseleave", () => {
      this.mouseSpeed = 0;
    });
  }
  // 使用PCFSoft阴影
  usePCFSoftShadowMap() {
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  // 使用VSM阴影
  useVSMShadowMap() {
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
  }
  // 将相机的方向设为z轴
  setCameraUpZ() {
    this.camera.up.set(0, 0, 1);
  }
  // 获取viewport
  getViewport() {
    const { camera } = this;
    const position = new THREE.Vector3();
    const target = new THREE.Vector3();
    const distance = camera.getWorldPosition(position).distanceTo(target);
    const fov = ((camera as any).fov * Math.PI) / 180; // convert vertical fov to radians
    const h = 2 * Math.tan(fov / 2) * distance; // visible height
    const w = h * (window.innerWidth / window.innerHeight);
    const viewport = { width: w, height: h };
    this.viewport = viewport;
  }
}

class PhysicsBase extends Base {
  world!: CANNON.World;
  gravity!: CANNON.Vec3;
  meshPhysicsObjs!: MeshPhysicsObject[];
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
