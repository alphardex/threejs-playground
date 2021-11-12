import * as THREE from "three";
import ProjectedMaterial, {
  allocateProjectionData,
} from "three-projected-material";
import { Base } from "@/commons/base";
import { projectTexUrl } from "@/consts/texProjection";
import { array2Point, point2ThreeVector, poisson } from "@/utils/math";

class TexProjection extends Base {
  clock: THREE.Clock;
  projectCamera: THREE.PerspectiveCamera;
  instancedIco: THREE.InstancedMesh;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 3);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createProjectedMaterial();
    this.createIcoInstance();
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
      instanced: true,
    });
    return projectedMaterial;
  }
  // 创建实例化的二十面体
  createIcoInstance(count = 1000) {
    const points = poisson({
      range: [1, 1],
      minRadius: 2,
      maxRadius: 100,
    });
    // center points
    points.forEach((p) => {
      p[0] -= 0.5;
      p[1] -= 0.5;
      p[0] *= 3;
      p[1] *= 3;
    });
    const positions = points.map((p) => point2ThreeVector(array2Point(p)));

    const geometry = new THREE.IcosahedronGeometry(0.1);
    const material = this.createProjectedMaterial();
    const instancedIco = new THREE.InstancedMesh(geometry, material, count);

    allocateProjectionData(geometry, positions.length);

    for (let i = 0; i < count; i++) {
      const scaleValue = THREE.MathUtils.randFloat(1, 2) * 0.36;
      const position = positions[i];
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3(scaleValue, scaleValue, scaleValue);
      const matrix = new THREE.Matrix4();
      matrix.compose(position, quaternion, scale);
      instancedIco.setMatrixAt(i, matrix);

      material.projectInstanceAt(i, instancedIco, matrix);
    }
    this.instancedIco = instancedIco;
    this.scene.add(instancedIco);
  }
  // 创建光源
  createLight() {
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(0, 5, 10);
    this.scene.add(dirLight);

    const ambiLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambiLight);
  }
}

export default TexProjection;
