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
      offsetX: 0,
      offsetY: 0,
      repeatX: 10,
      repeatY: 4,
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
    this.runTravelAnimation();
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
    this.timeTravelMaterial = timeTravelMaterial;
  }
  // 创建管道
  createTube() {
    const points = [...ky.range(0, 5)].map((item, i) => {
      return new THREE.Vector3(0, 0, (3 * i) / 4);
    });
    points[4].y = -0.05;
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
  // 更新管道状态
  updateTube() {
    const timeTravelMaterial = this.timeTravelMaterial;
    const params = this.params;
    const { offsetX, offsetY, repeatX, repeatY } = params;
    if (timeTravelMaterial) {
      timeTravelMaterial.map.offset.set(offsetX, offsetY);
      timeTravelMaterial.map.repeat.set(repeatX, repeatY);
    }
  }
  // 运行穿梭动画
  runTravelAnimation() {
    const t = gsap.timeline({ repeat: -1 });
    t.to(this.params, {
      offsetX: 8,
      duration: 12,
      ease: "power2.inOut",
    })
      .to(
        this.params,
        {
          repeatX: 0.3,
          duration: 4,
          ease: "power1.inOut",
        },
        0
      )
      .to(
        this.params,
        {
          repeatX: 10,
          duration: 6,
          ease: "power2.inOut",
        },
        "-=5"
      );
  }
  // 动画
  update() {
    this.updateTube();
  }
}

export default TimeTravel;
