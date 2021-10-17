import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import cloudySkyVertexShader from "../shaders/cloudySky/vertex.glsl";
// @ts-ignore
import cloudySkyFragmentShader from "../shaders/cloudySky/fragment.glsl";

class CloudySky extends Base {
  clock!: THREE.Clock;
  cloudySkyMaterial!: THREE.ShaderMaterial;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1);
    this.params = {
      velocity: 5,
      skyColor: "#324678",
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createCloudySkyMaterial();
    this.createPlane();
    this.createLight();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createCloudySkyMaterial() {
    const cloudySkyMaterial = new THREE.ShaderMaterial({
      vertexShader: cloudySkyVertexShader,
      fragmentShader: cloudySkyFragmentShader,
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
        uVelocity: {
          value: this.params.velocity,
        },
        uSkyColor: {
          value: new THREE.Color(this.params.skyColor),
        },
      },
    });
    this.cloudySkyMaterial = cloudySkyMaterial;
    this.shaderMaterial = cloudySkyMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(2, 2, 100, 100);
    const material = this.cloudySkyMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    if (this.cloudySkyMaterial) {
      this.cloudySkyMaterial.uniforms.uTime.value = elapsedTime;
    }
  }
}

export default CloudySky;
