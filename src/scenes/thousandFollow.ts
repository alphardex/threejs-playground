import * as THREE from "three";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import thousandFollowVertexShader from "../shaders/thousandFollow/vertex.glsl";
// @ts-ignore
import thousandFollowFragmentShader from "../shaders/thousandFollow/fragment.glsl";
import {
  thousandFollowFontConfig,
  thousandFollowFontUrl,
} from "@/consts/thousandFollow";
import { createText, loadFont } from "@/utils/misc";

class ThousandFollow extends Base {
  clock!: THREE.Clock;
  scatterMaterial!: THREE.ShaderMaterial;
  planeScene!: THREE.Scene;
  planeMaterial!: THREE.ShaderMaterial;
  textMaterial!: THREE.ShaderMaterial;
  plane!: THREE.Mesh;
  mousePosOnPlane!: THREE.Vector3;
  colorParams!: any;
  params!: any;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 1.2);
    this.colorParams = {
      // palette: https://colorhunt.co/palette/167893
      planeColor: "#1b262c",
      spotLightColor: "#3282b8",
      textColor: "#3282b8",
    };
    this.params = {
      scatterDivider: 150,
      scatterPow: 0.6,
      planeScatterDivider: 50,
      textScatterDivider: 5,
      useFresnel: 1,
    };
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createScatterMaterial();
    this.createPlaneScene();
    this.createPlaneMaterial();
    this.createPlane();
    this.createRaycaster();
    this.trackMouseOnPlane();
    this.createTextMaterial();
    await this.createMainText("1000");
    // this.createOrbitControls();
    // this.createDebugPanel();
    this.addListeners();
    this.setLoop();
  }
  // 创建散射光材质
  createScatterMaterial() {
    const scatterMaterial = new THREE.ShaderMaterial({
      vertexShader: thousandFollowVertexShader,
      fragmentShader: thousandFollowFragmentShader,
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
        uSpotLight: {
          value: new THREE.Vector3(0, 0, 0),
        },
        uScatterDivider: {
          value: this.params.scatterDivider,
        },
        uScatterPow: {
          value: this.params.scatterPow,
        },
        uIsPlane: {
          value: 0,
        },
        uIsText: {
          value: 0,
        },
        uPlaneColor: {
          value: new THREE.Color(this.colorParams.planeColor),
        },
        uSpotColor: {
          value: new THREE.Color(this.colorParams.spotLightColor),
        },
        uTextColor: {
          value: new THREE.Color(this.colorParams.textColor),
        },
        uUseFresnel: {
          value: this.params.useFresnel,
        },
      },
    });
    this.scatterMaterial = scatterMaterial;
  }
  // 创建平面场景，作为底层的渲染
  createPlaneScene() {
    this.renderer.autoClear = false;
    const planeScene = new THREE.Scene();
    this.planeScene = planeScene;
  }
  // 创建平面材质
  createPlaneMaterial() {
    const planeMaterial = this.scatterMaterial.clone();
    planeMaterial.uniforms.uScatterDivider.value =
      this.params.planeScatterDivider;
    planeMaterial.uniforms.uIsPlane.value = 1;
    this.planeMaterial = planeMaterial;
  }
  // 创建平面
  createPlane() {
    const geometry = new THREE.PlaneBufferGeometry(100, 100);
    const material = this.planeMaterial;
    const plane = this.createMesh(
      {
        geometry,
        material,
      },
      this.planeScene
    );
    this.plane = plane;
  }
  // 追踪鼠标在平面上的位置
  trackMouseOnPlane() {
    window.addEventListener("mousemove", (e) => {
      const target = this.onChooseIntersect(this.plane, this.planeScene);
      if (target) {
        this.mousePosOnPlane = target.point;
      }
    });
  }
  // 创建文字材质
  createTextMaterial() {
    const textMaterial = this.scatterMaterial.clone();
    textMaterial.uniforms.uScatterDivider.value =
      this.params.textScatterDivider;
    textMaterial.uniforms.uIsText.value = 1;
    this.textMaterial = textMaterial;
  }
  // 创建文字
  async createMainText(text: string) {
    const font = await loadFont(thousandFollowFontUrl);
    const config = {
      font,
      ...thousandFollowFontConfig,
    };
    const material = this.textMaterial;
    const mesh = createText(text, config, material);
    mesh.geometry.center();
    this.scene.add(mesh);
  }
  // 动画
  update() {
    if (this.planeMaterial && this.mousePosOnPlane) {
      this.planeMaterial.uniforms.uSpotLight.value = this.mousePosOnPlane;
    }
    if (this.textMaterial && this.mousePosOnPlane) {
      this.textMaterial.uniforms.uSpotLight.value = this.mousePosOnPlane;
    }
    if (this.mousePosOnPlane) {
      this.scene.rotation.x = this.mousePosOnPlane.y / 3;
      this.scene.rotation.y = this.mousePosOnPlane.x / 3;
    }
    this.renderPlaneScene();
  }
  // 先渲染平面层，再渲染主层，使两者叠加
  renderPlaneScene() {
    if (this.planeScene) {
      this.renderer.clear();
      this.renderer.render(this.planeScene, this.camera);
      this.renderer.clearDepth();
    }
  }
  // 创建调试面板
  createDebugPanel() {
    const gui = new dat.GUI({ width: 300 });
    const textUniforms = this.textMaterial.uniforms;
    const planeUniforms = this.planeMaterial.uniforms;
    gui.addColor(this.colorParams, "planeColor").onFinishChange((value) => {
      planeUniforms.uPlaneColor.value.set(value);
    });
    gui.addColor(this.colorParams, "textColor").onFinishChange((value) => {
      textUniforms.uTextColor.value.set(value);
    });
    gui.addColor(this.colorParams, "spotLightColor").onFinishChange((value) => {
      planeUniforms.uSpotColor.value.set(value);
    });
  }
}

export default ThousandFollow;
