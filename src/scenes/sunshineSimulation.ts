import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
import SunCalc from "suncalc";

class SunshineSimulation extends Base {
  clock!: THREE.Clock;
  dirLight!: THREE.DirectionalLight;
  sunshineTimes!: any;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(8, 12, 4);
    this.params = {
      coord: { lat: 120.75224, lng: 31.65381 },
      date: new Date("2021-03-29"),
      interval: 60, // 经过时间，1分钟为基础单位
      freq: 1000, // 更新频率，1毫秒为基础单位
      timeScale: 0.01, // 时间变化幅度
    };
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
    this.getSunshineInfoOneDay();
    this.moveSun();
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
    const dirLight = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 1);
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
    const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.4);
    this.scene.add(ambiLight);
  }
  // 获取全天光照信息
  getSunshineInfoOneDay() {
    const { params } = this;
    const { coord, date } = params;
    const { lat, lng } = coord;
    const sunshineTimes = SunCalc.getTimes(date, lat, lng);
    this.sunshineTimes = sunshineTimes;
    return sunshineTimes;
  }
  // 获取某时某点的光照信息
  getSunshineInfoOneTime(date = new Date(), coord: any) {
    const { lat, lng } = coord;
    const sunshinePos = SunCalc.getPosition(date, lat, lng);
    const sunshinePosCalc = this.calcSunPos(sunshinePos);
    const sunshineInfo = {
      sunshinePos,
      sunshinePosCalc,
    };
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
  setSunPosition(sunshineInfo: any) {
    const { sunshinePosCalc } = sunshineInfo;
    const { x, y, z } = sunshinePosCalc;
    this.dirLight.position.set(x, y + 1, z);
    this.dirLight.position.multiplyScalar(50);
  }
  // 移动太阳
  async moveSun() {
    const { params, sunshineTimes } = this;
    const { interval, freq, timeScale } = params;
    const { sunrise, sunset } = sunshineTimes;
    let currentTime = sunrise;
    while (currentTime <= sunset) {
      currentTime = ky.addMinutesToDate(currentTime, interval * timeScale);
      console.log(currentTime);
      const sunshineInfo = this.getSunshineInfoOneTime(
        currentTime,
        this.params.coord
      );
      this.setSunPosition(sunshineInfo);
      await ky.sleep(freq * timeScale);
    }
  }
}

export default SunshineSimulation;
