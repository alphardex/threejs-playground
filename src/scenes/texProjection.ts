import * as THREE from "three";
import ProjectedMaterial from "three-projected-material";
import { Base } from "@/commons/base";
import { projectTexUrl } from "@/consts/texProjection";

class TexProjection extends Base {
  clock: THREE.Clock;
  projectCamera: THREE.PerspectiveCamera;
  projectedMaterial: ProjectedMaterial;
  box: THREE.Mesh;
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
    this.createProjectCamera();
    this.createProjectedMaterial();
    this.createBox();
    this.doProject();
    this.createLight();
    this.mouseTracker.trackMousePos();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  //创建投影相机
  createProjectCamera() {
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 3);
    camera.position.set(-1, 1.2, 1.5);
    camera.lookAt(0, 0, 0);
    this.projectCamera = camera;

    const helper = new THREE.CameraHelper(camera);
    this.scene.add(helper);
  }
  // 创建投影材质
  createProjectedMaterial() {
    const projectedMaterial = new ProjectedMaterial({
      camera: this.projectCamera,
      texture: new THREE.TextureLoader().load(projectTexUrl),
    });
    this.projectedMaterial = projectedMaterial;
  }
  // 创建方块
  createBox() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = this.projectedMaterial;
    const box = this.createMesh({
      geometry,
      material,
    });
    this.box = box;
  }
  // 投影
  doProject() {
    this.projectedMaterial.project(this.box);
  }
  // 动画
  update() {
    this.box.rotation.y -= 0.005;
  }
}

export default TexProjection;
