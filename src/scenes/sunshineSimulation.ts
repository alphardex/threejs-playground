import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import templateVertexShader from "../shaders/template/vertex.glsl";
// @ts-ignore
import templateFragmentShader from "../shaders/template/fragment.glsl";
import SunCalc from "suncalc";

class SunshineSimulation extends Base {
  clock!: THREE.Clock;
  templateMaterial!: THREE.ShaderMaterial;
  sunshineInfo!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createSunshineSimulationMaterial();
    this.createMesh({});
    this.getSunshineInfo({ lat: 120.75224, lng: 31.65381 });
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createSunshineSimulationMaterial() {
    const templateMaterial = new THREE.ShaderMaterial({
      vertexShader: templateVertexShader,
      fragmentShader: templateFragmentShader,
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
      },
    });
    this.templateMaterial = templateMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100);
    const material = this.templateMaterial;
    this.createMesh({
      geometry,
      material,
    });
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
  // 获取光照信息
  getSunshineInfo(coord: any) {
    const { lat, lng } = coord;
    const times = SunCalc.getTimes(new Date(), lat, lng);
    const sunriseStr = `${times.sunrise.getHours()}:${times.sunrise.getMinutes()}`;
    const sunrisePos = SunCalc.getPosition(times.sunrise, lat, lng);
    const sunshineInfo = {
      times,
      sunriseStr,
      sunrisePos,
    };
    this.sunshineInfo = sunshineInfo;
    console.log(sunshineInfo);
    return sunshineInfo;
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.templateMaterial) {
      this.templateMaterial.uniforms.uTime.value = elapsedTime;
      this.templateMaterial.uniforms.uMouse.value = mousePos;
    }
  }
}

export default SunshineSimulation;
