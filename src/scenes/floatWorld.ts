import * as THREE from "three";
import ky from "kyouka";
import { floatWorldFontConfig, floatWorldFontUrl } from "@/consts/floatWorld";
import { Base } from "@/commons/base";
import { CinematicCamera } from "three/examples/jsm/cameras/CinematicCamera.js";
import { calcAspect } from "@/utils/dom";
import { loadFont } from "@/utils/loader";
import { createText } from "@/utils/misc";

class FloatWorld extends Base {
  meshes!: THREE.Mesh[];
  radius!: number;
  theta!: number;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.cameraPosition = new THREE.Vector3(2, 1, 15);
    this.meshes = [];
    this.radius = 15;
    this.theta = 0;
  }
  // 初始化
  async init() {
    this.createScene();
    this.createCinematicCamera();
    this.createRenderer();
    await this.createFloatText();
    this.createFloatObjects();
    this.createLight();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建相机
  createCinematicCamera() {
    const { perspectiveCameraParams, cameraPosition, lookAtPosition } = this;
    const { fov, near, far } = perspectiveCameraParams;
    const aspect = calcAspect(this.container!);
    const camera = new CinematicCamera(fov, aspect, near, far);
    camera.position.copy(cameraPosition);
    camera.lookAt(lookAtPosition);
    this.camera = camera;
  }
  // 创建文字
  async createFloatText() {
    const font = await loadFont(floatWorldFontUrl);
    const config = {
      font,
      ...floatWorldFontConfig,
    };
    const mesh = createText(
      "alphardex CSS Mahoutsukai",
      config,
      new THREE.MeshNormalMaterial()
    );
    mesh.geometry.center();
    this.scene.add(mesh);
  }
  // 创建漂浮物
  createFloatObjects(count = 160) {
    const geometries = [
      new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45),
      new THREE.BoxBufferGeometry(0.5, 0.5, 0.5, 25, 25, 25),
    ];
    const material = new THREE.MeshNormalMaterial();
    for (let i = 0; i < count; i++) {
      const geometry = ky.sample(geometries);
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
  // 动画
  update() {
    const { camera, scene, radius } = this;
    this.theta += 0.25;
    camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(this.theta));
    camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(this.theta));
    camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(this.theta));
    camera.lookAt(scene.position);
    camera.updateMatrixWorld();
  }
}

export default FloatWorld;
