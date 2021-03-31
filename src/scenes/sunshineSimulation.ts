import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
import SunCalc from "suncalc";
import { SunshineInfo, SunshinePos } from "@/types";

class SunshineSimulation extends Base {
  clock!: THREE.Clock;
  dirLight!: THREE.DirectionalLight;
  sunshineTimes!: any;
  sunshineInfoTotal!: SunshineInfo[];
  currentSunshineInfo!: SunshineInfo;
  currentSunshineInfoId!: number;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.perspectiveCameraParams = {
      fov: 75,
      near: 0.1,
      far: 1000,
    };
    this.cameraPosition = new THREE.Vector3(0, -250, 400);
    this.params = {
      coord: { lat: 34.827203, lng: 117.348048 },
      date: new Date(),
      interval: 1, // 经过时间，1分钟为基础单位
      freq: 1000, // 更新频率，1毫秒为基础单位
      timeScale: 0.01, // 时间变化幅度
      radius: 250,
      radiusScale: 2,
      useHelper: false,
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
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
    this.getAllSunshineData();
    this.setSunshineInfoById();
    this.updateCameraPositionNoon();
  }
  // 使用VSM阴影
  useVSMShadowMap() {
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
  }
  // 创建地面
  createGround() {
    const geometry = new THREE.PlaneGeometry(400, 400);
    const material = new THREE.MeshPhongMaterial({
      color: 0x999999,
      specular: 0x111111,
      side: THREE.DoubleSide,
    });
    const mesh = this.createMesh({
      geometry,
      material,
    });
    mesh.receiveShadow = true;
  }
  // 创建大楼
  createBuilding() {
    const geometry = new THREE.BoxBufferGeometry(50, 50, 200);
    const position = new THREE.Vector3(0, 0, 100);
    const mesh = this.createMesh({ geometry, position });
    mesh.receiveShadow = true;
    mesh.castShadow = true;
  }
  // 创建太阳光
  createSunLight() {
    const dirLight = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 1);
    dirLight.position.set(-483, 53, 150);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 10000;
    const d = this.params.radius;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0001;
    this.dirLight = dirLight;
    this.scene.add(dirLight);
    if (this.params.useHelper) {
      const dirLightHelper = new THREE.DirectionalLightHelper(dirLight);
      this.scene.add(dirLightHelper);
      const dirLightShadowHelper = new THREE.CameraHelper(
        dirLight.shadow.camera
      );
      this.scene.add(dirLightShadowHelper);
    }
    const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.4);
    this.scene.add(ambiLight);
  }
  // 获取光照全部数据
  getAllSunshineData() {
    this.getSunshineTimesOneDay();
    this.getAllSunshineInfo();
  }
  // 获取全天的光照时间
  getSunshineTimesOneDay() {
    const { params } = this;
    const { coord, date } = params;
    const { lat, lng } = coord;
    const sunshineTimes = SunCalc.getTimes(date, lat, lng);
    this.sunshineTimes = sunshineTimes;
    return sunshineTimes;
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
  // 获取某时某点的光照位置
  getSunshinePosOneTime(date = new Date(), coord: any) {
    const { lat, lng } = coord;
    const sunshinePos = SunCalc.getPosition(date, lat, lng);
    const sunshinePosCalc = this.calcSunPos(sunshinePos);
    const sunshineInfo = {
      sunshinePos,
      sunshinePosCalc,
    };
    return sunshineInfo;
  }
  // 获取全天的光照信息（信息包括时间和位置）
  getAllSunshineInfo() {
    const sunshineInfoTotal = [];
    const { params, sunshineTimes } = this;
    const { interval, coord } = params;
    const { sunrise, sunset } = sunshineTimes;
    let currentTime = sunrise;
    while (currentTime <= sunset) {
      currentTime = ky.addMinutesToDate(currentTime, interval);
      const time = `${currentTime.getHours()}:${currentTime.getMinutes()}`;
      const pos = this.getSunshinePosOneTime(currentTime, coord);
      sunshineInfoTotal.push({
        pos,
        time,
      });
    }
    this.sunshineInfoTotal = sunshineInfoTotal;
  }
  // 将相机位置设为中午时的光照位置
  updateCameraPositionNoon() {
    const { sunshineInfoTotal } = this;
    const middleId = Math.floor(sunshineInfoTotal.length / 2);
    const noonPos = sunshineInfoTotal[middleId].pos;
    const { sunshinePosCalc } = noonPos;
    const { x, y, z } = sunshinePosCalc;
    this.camera.position.set(x, y, z);
    this.camera.position.multiplyScalar(
      this.params.radius * this.params.radiusScale
    );
  }
  // 将太阳光位置设置为光照位置
  setSunPosition(pos: SunshinePos = this.currentSunshineInfo.pos) {
    const { sunshinePosCalc } = pos;
    const { x, y, z } = sunshinePosCalc;
    this.dirLight.position.set(x, y, z);
    this.dirLight.position.multiplyScalar(
      this.params.radius * this.params.radiusScale
    );
  }
  // 根据ID设置当前的光照信息
  setSunshineInfoById(id: number = this.currentSunshineInfoId) {
    const { sunshineInfoTotal } = this;
    const currentSunshineInfo = sunshineInfoTotal[id];
    this.currentSunshineInfo = currentSunshineInfo;
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
  }
  // 状态
  get status() {
    const { sunshineInfoTotal } = this;
    let sunriseTime = "";
    let sunsetTime = "";
    if (!ky.isEmpty(sunshineInfoTotal)) {
      const length = sunshineInfoTotal.length - 1;
      sunriseTime = sunshineInfoTotal[0].time;
      sunsetTime = sunshineInfoTotal[length].time;
    }
    return {
      sunriseTime,
      sunsetTime,
    };
  }
}

export default SunshineSimulation;
