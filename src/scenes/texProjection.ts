import * as THREE from "three";
import ProjectedMaterial, {
  allocateProjectionData,
} from "three-projected-material";
import { Base } from "@/commons/base";
import { projectTexUrl } from "@/consts/texProjection";
import { array2Point, point2ThreeVector, poisson } from "@/utils/math";
import gsap from "gsap";
import ky from "kyouka";

interface InstanceDatum {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
}

class TexProjection extends Base {
  clock: THREE.Clock;
  projectCamera: THREE.PerspectiveCamera;
  instancedIco: THREE.InstancedMesh;
  instanceData: InstanceDatum[];
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.clock = new THREE.Clock();
    this.cameraPosition = new THREE.Vector3(0, 0, 3);
    this.instanceData = [];
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createProjectedMaterial();
    this.createIcoInstance();
    this.createLight();
    this.staggerMoveZ();
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
    instancedIco.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    allocateProjectionData(geometry, positions.length);

    for (let i = 0; i < count; i++) {
      const scaleValue = THREE.MathUtils.randFloat(1, 2) * 0.36;
      const position = positions[i];
      const rotation = new THREE.Euler();
      const quaternion = new THREE.Quaternion().setFromEuler(rotation);
      const scale = new THREE.Vector3(scaleValue, scaleValue, scaleValue);
      const instanceDatum = {
        position,
        rotation,
        scale,
      };
      this.instanceData.push(instanceDatum);

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
  // 动画
  update() {
    const dummy = new THREE.Object3D();

    const { instancedIco, instanceData } = this;
    instancedIco.instanceMatrix.needsUpdate = true;
    const { count } = instancedIco;
    for (let i = 0; i < count; i++) {
      const instanceDatum = instanceData[i];
      const { position, rotation, scale } = instanceDatum;
      dummy.position.copy(position);
      dummy.quaternion.setFromEuler(rotation);
      dummy.scale.copy(scale);
      dummy.updateMatrix();
      instancedIco.setMatrixAt(i, dummy.matrix);
    }
  }
  // 交错z轴移动
  staggerMoveZ() {
    const { instanceData } = this;
    const positions = ky.pluck(instanceData, "position");
    gsap.fromTo(
      positions,
      {
        z: 3,
      },
      { z: 0, duration: 1, stagger: 0.005 }
    );
  }
}

export default TexProjection;
