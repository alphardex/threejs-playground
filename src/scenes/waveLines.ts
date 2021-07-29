import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import waveLinesVertexShader from "../shaders/waveLines/vertex.glsl";
// @ts-ignore
import waveLinesFragmentShader from "../shaders/waveLines/fragment.glsl";

class WaveLines extends Base {
  clock!: THREE.Clock;
  waveLinesMaterial!: THREE.ShaderMaterial;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.perspectiveCameraParams = {
      fov: 75,
      near: 0.01,
      far: 10000,
    };
    this.cameraPosition = new THREE.Vector3(0, 0, 7.5);
    this.params = {
      color: "#71FFFF",
    };
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createWaveLinesMaterial();
    this.createLines();
    this.createLight();
    this.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建形状
  createLineGeometry({ pointCount = 128, lineCount = 32 }) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointCount * lineCount * 3);
    let k = 0;
    for (let i = 0; i < lineCount; i++) {
      for (let j = 0; j < pointCount; j++) {
        positions[k + 0] = j / (pointCount - 1);
        positions[k + 1] = 0;
        positions[k + 2] = (i - lineCount / 2) / (lineCount - 1);
        k += 3;
      }
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }
  // 创建材质
  createWaveLinesMaterial() {
    const waveLinesMaterial = new THREE.ShaderMaterial({
      vertexShader: waveLinesVertexShader,
      fragmentShader: waveLinesFragmentShader,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
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
        uLineLength: {
          value: 24,
        },
        uLineSpace: {
          value: 5.12,
        },
        uLineThickness: {
          value: 0.03,
        },
        uLineUvScale: {
          value: 15,
        },
        uNoiseAmount: {
          value: 2,
        },
        uNoiseScale: {
          value: new THREE.Vector2(5.3, 3.46),
        },
        uPointSize: {
          value: 25,
        },
        uCycle: {
          value: 0,
        },
        uCurveOffset: {
          value: -0.5,
        },
        uColor: {
          value: new THREE.Color(this.params.color),
        },
      },
    });
    this.waveLinesMaterial = waveLinesMaterial;
  }
  // 创建线条
  createLines() {
    const geometry = this.createLineGeometry({});
    const material = this.waveLinesMaterial;
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    const cycle = ((elapsedTime / 240) % 1) * Math.PI * 2;
    if (this.waveLinesMaterial) {
      this.waveLinesMaterial.uniforms.uTime.value = elapsedTime;
      this.waveLinesMaterial.uniforms.uMouse.value = mousePos;
      this.waveLinesMaterial.uniforms.uCycle.value = cycle;
    }
  }
}

export default WaveLines;
