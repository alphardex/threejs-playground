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
  sunshineInfo!: any;
  dirLight!: THREE.DirectionalLight;
  dirGroup!: THREE.Group;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(8, 6, 4);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.enableShadow();
    this.useVSMShadowMap();
    this.createGround();
    this.createBuilding();
    this.createSunLight();
    this.getSunshineInfo(new Date(), { lat: 120.75224, lng: 31.65381 });
    this.setSunPosition();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 使用VSM
  useVSMShadowMap() {
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
  }
  // 创建地面
  createGround() {
    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.MeshPhongMaterial({
      color: 0x999999,
      shininess: 0,
      specular: 0x111111,
      side: THREE.DoubleSide,
    });
    const mesh = this.createMesh({
      geometry,
      material,
    });
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
  }
  // 创建大楼
  createBuilding() {
    const geometry = new THREE.BoxBufferGeometry(2, 4, 2);
    const position = new THREE.Vector3(0, 2, 0);
    const mesh = this.createMesh({ geometry, position });
    mesh.receiveShadow = true;
    mesh.castShadow = true;
  }
  // 创建太阳光
  createSunLight() {
    const dirLight = new THREE.DirectionalLight(
      new THREE.Color("#ffffff"),
      0.5
    );
    dirLight.position.set(3, 12, 17);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.camera.right = 17;
    dirLight.shadow.camera.left = -17;
    dirLight.shadow.camera.top = 17;
    dirLight.shadow.camera.bottom = -17;
    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512;
    dirLight.shadow.radius = 4;
    dirLight.shadow.bias = -0.0005;
    this.dirLight = dirLight;
    this.scene.add(dirLight);
    const dirGroup = new THREE.Group();
    dirGroup.add(dirLight);
    this.dirGroup = dirGroup;
    this.scene.add(dirGroup);
    const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.4);
    this.scene.add(ambiLight);
  }
  // 获取某时某点的光照信息
  getSunshineInfo(date = new Date(), coord: any) {
    const { lat, lng } = coord;
    const times = SunCalc.getTimes(date, lat, lng);
    const sunriseStr = `${times.sunrise.getHours()}:${times.sunrise.getMinutes()}`;
    const sunrisePos = SunCalc.getPosition(times.sunrise, lat, lng);
    const sunrisePosCalc = this.calcSunPos(sunrisePos);
    const sunsetStr = `${times.sunset.getHours()}:${times.sunset.getMinutes()}`;
    const sunsetPos = SunCalc.getPosition(times.sunset, lat, lng);
    const sunsetPosCalc = this.calcSunPos(sunsetPos);
    const sunshineInfo = {
      times,
      sunriseStr,
      sunrisePos,
      sunrisePosCalc,
      sunsetStr,
      sunsetPos,
      sunsetPosCalc,
    };
    this.sunshineInfo = sunshineInfo;
    console.log(sunshineInfo);
    return sunshineInfo;
  }
  // 计算太阳位置
  calcSunPos(pos: any) {
    const { azimuth, altitude } = pos;
    const z = Math.sin(altitude);
    const L = Math.sqrt(1 - z ** 2);
    const x = -L * Math.sin(azimuth);
    const y = -L * Math.cos(azimuth);
    return { L, x, y, z };
  }
  // 设置太阳位置
  setSunPosition() {
    const { sunshineInfo } = this;
    const { sunrisePosCalc } = sunshineInfo;
    const { x, y, z } = sunrisePosCalc;
    this.dirLight.position.set(x, y, z);
  }
  // 动画
  update() {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    // const { dirLight, dirGroup } = this;
    // dirGroup.rotation.y += 0.7 * delta;
    // dirLight.position.z = 17 + Math.sin(elapsedTime * 0.001) * 5;
  }
}

export default SunshineSimulation;
