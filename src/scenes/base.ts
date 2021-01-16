import * as THREE from "three";
import C from "cannon";
import { Cube } from "@/types";
import { calcAspect } from "@/utils/math";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { getNormalizedMousePos } from "@/utils/dom";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Object3D } from "three";

class Base {
  debug: boolean;
  container: HTMLElement | null;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
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
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createBox({});
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
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
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
  // 创建方块
  createBox(cube: Cube, container: THREE.Scene | THREE.Mesh = this.scene) {
    const {
      width = 1,
      height = 1,
      depth = 1,
      color = new THREE.Color("#d9dfc8"),
      x = 0,
      y = 0,
      z = 0,
      material = THREE.MeshBasicMaterial,
    } = cube;
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new material({ color, flatShading: true });
    const box = new THREE.Mesh(geo, mat);
    box.position.x = x;
    box.position.y = y;
    box.position.z = z;
    container.add(box);
    return box;
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
  // 加载模型
  loadModel(url: string): Promise<Object3D> {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          this.scene.add(model);
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
    this.mousePos = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();
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
  // 监听移动
  onMousemove() {
    window.addEventListener("mousemove", (e: MouseEvent) => {
      const { x, y } = getNormalizedMousePos(e);
      this.mousePos.x = x;
      this.mousePos.y = y;
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
  constructor(sel: string, debug = false) {
    super(sel, debug);
    this.gravity = new C.Vec3(0, 0, 0);
  }
  // 创建物理世界
  createPhysicsWorld() {
    const { gravity } = this;
    const world = new C.World();
    world.gravity.set(gravity.x, gravity.y, gravity.z);
    this.world = world;
  }
  // 创建物理盒子
  createPhysicsBox(
    halfExtents: C.Vec3,
    bodyOptions: C.IBodyOptions,
    bodyOffset: C.Vec3 = new C.Vec3(0, 0, 0)
  ) {
    const shape = new C.Box(halfExtents);
    const body = new C.Body(bodyOptions);
    body.addShape(shape, bodyOffset);
    this.world.addBody(body);
    return body;
  }
}

export { Base, PhysicsBase };
