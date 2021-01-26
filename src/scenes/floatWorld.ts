import * as THREE from "three";
import ky from "kyouka";
import { floatWorldFontConfig, floatWorldFontUrl } from "@/consts/floatWorld";
import { Base } from "./base";

class FloatWorld extends Base {
  meshes!: THREE.Mesh[];
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.meshes = [];
  }
  // 初始化
  async init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    await this.createFloatText();
    this.createFloatObjects();
    this.createLight();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建文字
  async createFloatText() {
    const font = await this.loadFont(floatWorldFontUrl);
    const config = {
      font,
      ...floatWorldFontConfig,
    };
    const mesh = this.createText(
      "Hello three.js",
      config,
      new THREE.MeshNormalMaterial()
    );
    mesh.geometry.center();
    this.scene.add(mesh);
  }
  // 创建漂浮物
  createFloatObjects(count = 100) {
    const geometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45);
    const material = new THREE.MeshNormalMaterial();
    for (let i = 0; i < count; i++) {
      const donut = this.createMesh({
        geometry,
        material,
      });
      const pos = new THREE.Vector3(
        ky.randomNumberInRange(-0.5, 0.5) * 10,
        ky.randomNumberInRange(-0.5, 0.5) * 10,
        ky.randomNumberInRange(-0.5, 0.5) * 10
      );
      const rot = new THREE.Vector2(
        ky.randomNumberInRange(0, 1) * ky.deg2rad(180),
        ky.randomNumberInRange(0, 1) * ky.deg2rad(180)
      );
      const scaleNumber = ky.randomNumberInRange(0, 1);
      const scale = new THREE.Vector3(scaleNumber, scaleNumber, scaleNumber);
      donut.position.copy(pos);
      donut.rotation.set(rot.x, rot.y, 0);
      donut.scale.copy(scale);
    }
  }
}

export default FloatWorld;
