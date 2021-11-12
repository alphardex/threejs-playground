import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "@/commons/base";
import liquidCrystalVertexShader from "../shaders/liquidCrystal/vertex.glsl";
import liquidCrystalFragmentShader from "../shaders/liquidCrystal/fragment.glsl";
import ThinFilmFresnelMap from "@/libs/ThinFilmFresnelMap";

class LiquidCrystal extends Base {
  clock!: THREE.Clock;
  liquidCrystalMaterial!: THREE.ShaderMaterial;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 25);
    this.params = {
      timeScale: 0.1,
      iriBoost: 8,
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createLiquidCrystalMaterial();
    this.createSphere();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建液晶材质
  createLiquidCrystalMaterial() {
    const liquidCrystalMaterial = new THREE.ShaderMaterial({
      vertexShader: liquidCrystalVertexShader,
      fragmentShader: liquidCrystalFragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: {
          value: 0,
        },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uMouse: {
          value: new THREE.Vector2(0, 0),
        },
        // https://tympanus.net/codrops/2020/09/30/creating-mirrors-in-react-three-fiber-and-three-js/
        uIriMap: {
          value: new ThinFilmFresnelMap(1000, 1.2, 3.2, 64).texture,
        },
        uIriBoost: {
          value: this.params.iriBoost,
        },
      },
    });
    this.liquidCrystalMaterial = liquidCrystalMaterial;
  }
  // 创建球体
  createSphere() {
    const geometry = new THREE.SphereBufferGeometry(10, 64, 64);
    const material = this.liquidCrystalMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const time = elapsedTime * this.params.timeScale;
    const mousePos = this.mouseTracker.mousePos;
    if (this.liquidCrystalMaterial) {
      this.liquidCrystalMaterial.uniforms.uTime.value = time;
      this.liquidCrystalMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default LiquidCrystal;
