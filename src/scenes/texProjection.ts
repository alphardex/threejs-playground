import * as THREE from "three";
import ProjectedMaterial from "three-projected-material";
import { Base } from "@/commons/base";
import { projectTexUrl } from "@/consts/texProjection";
import { array2Point, point2ThreeVector, poisson } from "@/utils/math";

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
  createIcos(count = 300) {
    const icoGroup = new THREE.Group();
    const points = poisson({
      range: [1, 1],
      minRadius: 4,
      maxRadius: 36,
    });
    // center points
    points.forEach((p) => {
      p[0] -= 0.5;
      p[1] -= 0.5;
      p[0] *= 1.5;
      p[1] *= 1.5;
    });
    const positions = points.map((p) => point2ThreeVector(array2Point(p)));
    for (let i = 0; i < count; i++) {
      const scaleValue = THREE.MathUtils.randFloat(0.5, 0.75);
      const position = positions[i];
      const scale = new THREE.Vector3(scaleValue, scaleValue, scaleValue);
      const geometry = new THREE.IcosahedronGeometry(0.1);
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
