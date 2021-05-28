import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import gsap from "gsap";
import { Flow } from "three/examples/jsm/modifiers/CurveModifier.js";
import { Base } from "./base";
// @ts-ignore
import curveRacingVertexShader from "../shaders/curveRacing/vertex.glsl";
// @ts-ignore
import curveRacingFragmentShader from "../shaders/curveRacing/fragment.glsl";

class CurveRacing extends Base {
  clock!: THREE.Clock;
  curveRacingMaterial!: THREE.ShaderMaterial;
  player!: THREE.Mesh;
  curve!: THREE.CatmullRomCurve3;
  flow!: Flow;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 1, 0);
    this.orthographicCameraParams = {
      zoom: 10,
      near: -100,
      far: 1000,
    };
    this.updateOrthographicCameraParams();
  }
  // 初始化
  init() {
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createCurveRacingMaterial();
    this.createPlayer();
    this.createCurvePath();
    this.createFlow();
    this.createLight();
    this.trackMousePos();
    // this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createCurveRacingMaterial() {
    const curveRacingMaterial = new THREE.ShaderMaterial({
      vertexShader: curveRacingVertexShader,
      fragmentShader: curveRacingFragmentShader,
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
    this.curveRacingMaterial = curveRacingMaterial;
  }
  // 创建玩家
  createPlayer() {
    const player = this.createMesh({});
    this.player = player;
  }
  // 创建曲线路径
  createCurvePath() {
    const coords = [
      { x: 5, y: 0, z: -5 },
      { x: 5, y: 0, z: 5 },
      { x: -5, y: 0, z: 5 },
      { x: -5, y: 0, z: -5 },
    ];
    const points = coords.map(
      (coord) => new THREE.Vector3(coord.x, coord.y, coord.z)
    );
    const curve = new THREE.CatmullRomCurve3(points, true);
    this.curve = curve;
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(50)),
      new THREE.MeshBasicMaterial({ color: "#749ACA" })
    );
    this.scene.add(line);
  }
  // 创建路线
  createFlow() {
    const flow = new Flow(this.player);
    flow.updateCurve(0, this.curve);
    this.scene.add(flow.object3D);
    this.flow = flow;
  }
  // 玩家沿着路线移动
  movePlayerAlongFlow() {
    if (this.flow) {
      this.flow.moveAlongCurve(0.001);
    }
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    if (this.curveRacingMaterial) {
      this.curveRacingMaterial.uniforms.uTime.value = elapsedTime;
      this.curveRacingMaterial.uniforms.uMouse.value = mousePos;
      this.movePlayerAlongFlow();
    }
  }
}

export default CurveRacing;
