import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import gridIcosahedronShapeVertexShader from "../shaders/gridIcosahedron/shape/vertex.glsl";
// @ts-ignore
import gridIcosahedronShapeFragmentShader from "../shaders/gridIcosahedron/shape/fragment.glsl";
// @ts-ignore
import gridIcosahedronEdgeVertexShader from "../shaders/gridIcosahedron/edge/vertex.glsl";
// @ts-ignore
import gridIcosahedronEdgeFragmentShader from "../shaders/gridIcosahedron/edge/fragment.glsl";
// @ts-ignore
import gridIcosahedronPostprocessingVertexShader from "../shaders/gridIcosahedron/postprocessing/vertex.glsl";
// @ts-ignore
import gridIcosahedronPostprocessingFragmentShader from "../shaders/gridIcosahedron/postprocessing/fragment.glsl";
import { gridIcosahedronTextureUrl } from "@/consts/gridIcosahedron";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import gsap from "gsap";

class GridIcosahedron extends Base {
  clock!: THREE.Clock;
  gridIcosahedronShapeMaterial!: THREE.ShaderMaterial;
  gridIcosahedronEdgeMaterial!: THREE.ShaderMaterial;
  customPass!: ShaderPass;
  params!: any;
  mouseSpeed!: number;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
    this.params = {
      uNoiseDensity: 0,
    };
    this.mouseSpeed = 0;
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createGridIcosahedronShapeMaterial();
    this.createGridIcosahedronEdgeMaterial();
    this.createIcoShape();
    this.createIcoEdge();
    this.createPostprocessingEffect();
    this.createLight();
    this.trackMouseSpeed();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建图形材质
  createGridIcosahedronShapeMaterial() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(gridIcosahedronTextureUrl);
    texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
    const gridIcosahedronShapeMaterial = new THREE.ShaderMaterial({
      vertexShader: gridIcosahedronShapeVertexShader,
      fragmentShader: gridIcosahedronShapeFragmentShader,
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
        uTexture: {
          value: texture,
        },
        uRefractionStrength: {
          value: 0.2,
        },
        uNoiseDensity: {
          value: this.params.uNoiseDensity,
        },
      },
    });
    this.gridIcosahedronShapeMaterial = gridIcosahedronShapeMaterial;
  }
  // 创建边框材质
  createGridIcosahedronEdgeMaterial() {
    const gridIcosahedronEdgeMaterial = new THREE.ShaderMaterial({
      vertexShader: gridIcosahedronEdgeVertexShader,
      fragmentShader: gridIcosahedronEdgeFragmentShader,
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
        uWidth: {
          value: 2,
        },
        uNoiseDensity: {
          value: this.params.uNoiseDensity,
        },
      },
    });
    this.gridIcosahedronEdgeMaterial = gridIcosahedronEdgeMaterial;
  }
  // 创建二十面体图形
  createIcoShape() {
    const geometry = new THREE.IcosahedronBufferGeometry(1, 1);
    const material = this.gridIcosahedronShapeMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 创建二十面体边框
  createIcoEdge() {
    const geometry = new THREE.IcosahedronBufferGeometry(1.001, 1);
    this.getBaryCoord(geometry);
    const material = this.gridIcosahedronEdgeMaterial;
    this.createMesh({
      geometry,
      material,
    });
  }
  // 获取重心坐标系
  getBaryCoord(bufferGeometry: THREE.BufferGeometry) {
    // https://gist.github.com/mattdesl/e399418558b2b52b58f5edeafea3c16c
    const length = bufferGeometry.attributes.position.array.length;
    const count = length / 3;
    const bary = [];
    for (let i = 0; i < count; i++) {
      bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
    }
    const aCenter = new Float32Array(bary);
    bufferGeometry.setAttribute(
      "aCenter",
      new THREE.BufferAttribute(aCenter, 3)
    );
  }
  // 创建后期处理特效
  createPostprocessingEffect() {
    const composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);
    const customPass = new ShaderPass({
      vertexShader: gridIcosahedronPostprocessingVertexShader,
      fragmentShader: gridIcosahedronPostprocessingFragmentShader,
      uniforms: {
        tDiffuse: {
          value: null,
        },
        uTime: {
          value: 0,
        },
        uRGBShift: {
          value: 0.3,
        },
      },
    });
    customPass.renderToScreen = true;
    composer.addPass(customPass);
    this.composer = composer;
    this.customPass = customPass;
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mousePos;
    const mouseSpeed = this.mouseSpeed * 5;
    if (this.gridIcosahedronShapeMaterial) {
      this.gridIcosahedronShapeMaterial.uniforms.uTime.value = elapsedTime;
      this.gridIcosahedronShapeMaterial.uniforms.uMouse.value = mousePos;
      this.scene.rotation.x = elapsedTime / 15;
      this.scene.rotation.y = elapsedTime / 15;
      gsap.to(this.gridIcosahedronShapeMaterial.uniforms.uNoiseDensity, {
        value: mouseSpeed,
        duration: 2,
      });
      gsap.to(this.gridIcosahedronEdgeMaterial.uniforms.uNoiseDensity, {
        value: mouseSpeed,
        duration: 2,
      });
    }
    if (this.customPass) {
      this.customPass.uniforms.uTime.value = elapsedTime;
      gsap.to(this.customPass.uniforms.uRGBShift, {
        value: mouseSpeed / 10,
        duration: 2,
      });
    }
  }
  // 追踪鼠标速度
  trackMouseSpeed() {
    // https://stackoverflow.com/questions/6417036/track-mouse-speed-with-js
    let lastMouseX = -1;
    let lastMouseY = -1;
    let mouseSpeed = 0;
    window.addEventListener("mousemove", (e) => {
      const mousex = e.pageX;
      const mousey = e.pageY;
      if (lastMouseX > -1) {
        mouseSpeed = Math.max(
          Math.abs(mousex - lastMouseX),
          Math.abs(mousey - lastMouseY)
        );
        this.mouseSpeed = mouseSpeed / 100;
      }
      lastMouseX = mousex;
      lastMouseY = mousey;
    });
    document.addEventListener("mouseleave", () => {
      this.mouseSpeed = 0;
    });
  }
}

export default GridIcosahedron;
