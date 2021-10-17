import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";
// @ts-ignore
import floatBubblesNoiseVertexShader from "../shaders/floatBubbles/vertex/noise.glsl";
// @ts-ignore
import floatBubblesUniformsVertexShader from "../shaders/floatBubbles/vertex/uniforms.glsl";
// @ts-ignore
import floatBubblesVertexShader from "../shaders/floatBubbles/vertex/vertex.glsl";
import { bumpMapUrl, cubeMapUrls } from "@/consts/floatBubbles";

class FloatBubbles extends Base {
  clock!: THREE.Clock;
  floatBubblesMaterial!: THREE.MeshPhysicalMaterial;
  uniforms!: any;
  envMap!: THREE.Texture;
  bubble!: THREE.Mesh;
  bubbles!: THREE.Mesh[];
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 3);
    this.uniforms = {
      uTime: {
        value: 0,
      },
      uDistortion: {
        value: 0.4,
      },
      uRadius: {
        value: 1,
      },
      uVelocity: {
        value: 0.5,
      },
    };
    this.bubbles = [];
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createFloatBubblesMaterial();
    this.createBg();
    this.createBubble();
    this.createBubbles();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建材质
  createFloatBubblesMaterial() {
    const bumpMap = new THREE.TextureLoader().load(bumpMapUrl);
    const envMap = new THREE.CubeTextureLoader().load(cubeMapUrls);
    this.envMap = envMap;
    const floatBubblesMaterial = new THREE.MeshPhysicalMaterial({
      roughness: 0,
      metalness: 1,
      clearcoat: 1,
      clearcoatRoughness: 1,
      envMap,
      bumpMap,
      bumpScale: 0.005,
    });
    floatBubblesMaterial.onBeforeCompile = (shader) => {
      this.modifyShader(shader);
    };
    this.floatBubblesMaterial = floatBubblesMaterial;
  }
  // 修改shader
  modifyShader(shader: THREE.Shader) {
    shader.uniforms = { ...shader.uniforms, ...this.uniforms };
    shader.vertexShader = `
    ${floatBubblesUniformsVertexShader}
    ${floatBubblesNoiseVertexShader}
    ${shader.vertexShader}
    `;
    const BEGIN_VERTEX_SHADER = "#include <begin_vertex>";
    const MODIFIED_BEGIN_VERTEX_SHADER = `
  ${floatBubblesVertexShader}`;
    shader.vertexShader = shader.vertexShader.replace(
      BEGIN_VERTEX_SHADER,
      MODIFIED_BEGIN_VERTEX_SHADER
    );
  }
  // 创建背景
  createBg() {
    this.scene.background = this.envMap;
  }
  // 创建泡泡
  createBubble() {
    const geometry = new THREE.IcosahedronBufferGeometry(1, 4);
    const material = this.floatBubblesMaterial;
    const bubble = this.createMesh({
      geometry,
      material,
    });
    this.bubble = bubble;
  }
  // 创建一群泡泡
  createBubbles(count = 64) {
    for (let i = 0; i < count; i++) {
      const bubble = this.bubble.clone();
      bubble.position.x = 4 * ky.randomNumberInRange(-6, 6);
      bubble.position.y = 4 * ky.randomNumberInRange(-5, 5);
      bubble.position.z = 4 * ky.randomNumberInRange(-5, -1);
      const bubbleScale = ky.randomNumberInRange(0, 1.5);
      bubble.scale.set(bubbleScale, bubbleScale, bubbleScale);
      this.scene.add(bubble);
      this.bubbles.push(bubble);
    }
  }
  // 动画
  update() {
    const elapsedTime = this.clock.getElapsedTime();
    const mousePos = this.mouseTracker.mousePos;
    if (this.floatBubblesMaterial) {
      this.uniforms.uTime.value = elapsedTime;
      this.bubble.rotation.z = elapsedTime / 5;
      this.bubble.rotation.x = THREE.MathUtils.lerp(
        this.bubble.rotation.x,
        mousePos.y * Math.PI,
        0.1
      );
      this.bubble.rotation.y = THREE.MathUtils.lerp(
        this.bubble.rotation.y,
        mousePos.x * Math.PI,
        0.1
      );
      this.bubbles.forEach((bubble) => {
        bubble.position.y += ky.randomNumberInRange(0.02, 0.06);
        if (bubble.position.y > 20) {
          bubble.position.y = -20;
        }
        bubble.rotation.x += 0.04;
        bubble.rotation.y += 0.04;
        bubble.rotation.z += 0.02;
      });
    }
  }
}

export default FloatBubbles;
