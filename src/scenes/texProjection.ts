import * as THREE from "three";
import ProjectedMaterial from "three-projected-material";
import { Base } from "@/commons/base";
import { projectTexUrl } from "@/consts/texProjection";

class TexProjection extends Base {
  clock: THREE.Clock;
  projectCamera: THREE.PerspectiveCamera;
  icoGroup: THREE.Group;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 2);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createProjectedMaterial();
    this.createIcos();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  // 创建投影材质
  createProjectedMaterial() {
    const projectedMaterial = new ProjectedMaterial({
      camera: this.camera,
      texture: new THREE.TextureLoader().load(projectTexUrl),
    });
    return projectedMaterial;
  }
  // 创建多个二十面体
  createIcos(count = 100) {
    const icoGroup = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.randFloat(-1, 1);
      const y = THREE.MathUtils.randFloat(-1, 1);
      const z = 0;
      const scaleValue = THREE.MathUtils.randFloat(0.5, 1);
      const position = new THREE.Vector3(x, y, z);
      const scale = new THREE.Vector3(scaleValue, scaleValue, scaleValue);
      const geometry = new THREE.IcosahedronGeometry(0.25);
      const material = this.createProjectedMaterial();
      const ico = new THREE.Mesh(geometry, material);
      ico.position.copy(position);
      ico.scale.copy(scale);
      material.project(ico);
      icoGroup.add(ico);
    }
    this.icoGroup = icoGroup;
    this.scene.add(icoGroup);
  }
}

export default TexProjection;
