import * as THREE from "three";
import ky from "kyouka";
import { Base } from "./base";

class Buildings extends Base {
  ground!: THREE.Mesh;
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createOrbitControls();
    this.createGround();
    this.createBuildingGroup();
    this.createLight();
    this.createFog();
    this.addListeners();
    this.setLoop();
  }
  // 创建地面
  createGround() {
    const geometry = new THREE.BoxGeometry(20, 0.1, 20);
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color("#1a3d4d"),
    });
    const ground = this.createMesh({
      geometry,
      material,
    });
    this.ground = ground;
  }
  // 创建楼层
  createBuilding(cube: any) {
    const { height, x, z } = cube;
    const geometry = new THREE.BoxBufferGeometry(0.25, height, 0.25);
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color("#26c6da"),
    });
    const position = new THREE.Vector3(x, 0, z);
    this.createMesh(
      {
        geometry,
        material,
        position,
      },
      this.ground
    );
  }
  // 创建楼层群
  createBuildingGroup(count = 1000) {
    for (let i = 0; i < count; i++) {
      const height = ky.randomNumberInRange(0.25, 5);
      const x = Number(ky.randomNumberInRange(-10, 10).toFixed(2));
      const z = Number(ky.randomNumberInRange(-10, 10).toFixed(2));
      this.createBuilding({ height, x, z });
    }
  }
  // 创建光源
  createLight() {
    const light1 = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 1);
    light1.position.set(1.5, 2, 1);
    this.scene.add(light1);
    const light2 = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 0.5);
    light2.position.set(-1.5, 2, 1);
    this.scene.add(light2);
  }
  // 创建雾
  createFog() {
    const fog = new THREE.FogExp2("#ffffff", 0.1);
    this.scene.fog = fog;
  }
  // 动画
  update() {
    const x = 1 - this.ground.rotation.y;
    const y = 1 - this.camera.position.z;
    const d = ky.distance({ x, y }, { x: 0, y: 0 });
    if (d > 0) {
      this.ground.rotation.y += x * 0.001;
      this.camera.position.z += y * 0.001;
    }
  }
}

export default Buildings;
