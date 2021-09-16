import * as THREE from "three";
import ky from "kyouka";
import gsap from "gsap";
import { Base } from "./base";
import { tunnelTexture } from "@/consts/timeTravel";

class TimeTravel extends Base {
  clock!: THREE.Clock;
  timeTravelMaterial!: THREE.MeshBasicMaterial;
  params!: any;
  curve!: THREE.CatmullRomCurve3;
  tubeMesh!: THREE.Mesh;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.perspectiveCameraParams = {
      fov: 15,
      near: 0.01,
      far: 1000,
    };
    this.cameraPosition = new THREE.Vector3(0, 0, 0.35);
    this.params = {
      speed: 0.02,
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.rotateCamera();
    this.createRenderer();
    this.createTimeTravelMaterial();
    this.createTube();
    this.createLight();
    this.trackMousePos();
    this.addListeners();
    this.setLoop();
  }
  // 旋转相机
  rotateCamera() {
    this.camera.rotation.y = ky.deg2rad(180);
  }
  // 创建光照
  createLight() {
    const dirLight = new THREE.DirectionalLight(new THREE.Color("white"), 0.8);
    this.scene.add(dirLight);
    const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x887979, 0.8);
    this.scene.add(hemiLight);
  }
  // 创建材质
  createTimeTravelMaterial() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(tunnelTexture);
    const timeTravelMaterial = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: texture,
    });
    timeTravelMaterial.map.wrapS = timeTravelMaterial.map.wrapT =
      THREE.MirroredRepeatWrapping;
    timeTravelMaterial.map.repeat.set(10, 4);
    this.timeTravelMaterial = timeTravelMaterial;
  }
  // 创建管道
  createTube() {
    const points = [...ky.range(0, 5)].map((item, i) => {
      return new THREE.Vector3(0, 0, (3 * i) / 4);
    });
    const curve = new THREE.CatmullRomCurve3(points);
    this.curve = curve;
    const geometry = new THREE.TubeBufferGeometry(curve, 80, 0.02, 60, false);
    const material = this.timeTravelMaterial;
    const mesh = this.createMesh({
      geometry,
      material,
    });
    this.tubeMesh = mesh;
  }
  // 管道运动
  moveTube() {
    const speed = this.params.speed;
    if (this.timeTravelMaterial) {
      this.timeTravelMaterial.map.offset.x += speed;
    }
  }
  // 动画
  update() {
    this.moveTube();
  }
}

export default TimeTravel;
