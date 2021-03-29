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
  dirLight!: THREE.DirectionalLight;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 5, 15);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.enableShadow();
    this.createSunshineSimulationMaterial();
    this.createGround();
    this.createBuilding();
    this.getSunshineInfo(new Date(), { lat: 120.75224, lng: 31.65381 });
    this.createSunLight();
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
    const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.4);
    this.scene.add(ambiLight);
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
  // 获取某时某点的光照信息
  getSunshineInfo(date = new Date(), coord: any) {
    const { lat, lng } = coord;
    const times = SunCalc.getTimes(date, lat, lng);
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
