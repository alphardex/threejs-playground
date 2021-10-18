import * as THREE from "three";
import { MouseTracker } from "./dom";

class RaycastSelector {
  scene: THREE.Scene;
  camera: THREE.Camera;
  raycaster: THREE.Raycaster;
  mouseTracker: MouseTracker;
  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.mouseTracker = new MouseTracker();
    this.mouseTracker.trackMousePos();
  }
  // 获取点击物
  getInterSects(
    targets: THREE.Object3D[] = this.scene.children
  ): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouseTracker.mousePos, this.camera);
    const intersects = this.raycaster.intersectObjects(targets, true);
    return intersects;
  }
  // 获取第一个选中物
  getFirstIntersect(targets: THREE.Object3D[] = this.scene.children) {
    const intersects = this.getInterSects(targets);
    const intersect = intersects[0];
    if (!intersect || !intersect.face) {
      return null;
    }
    return intersect;
  }
  // 选中点击物时
  onChooseIntersect(target: THREE.Object3D) {
    const intersect = this.getFirstIntersect();
    if (!intersect) {
      return null;
    }
    const object = intersect.object;
    return target === object ? intersect : null;
  }
  // 高亮选中物
  highlightIntersect(color = "#ff0000") {
    document.addEventListener("click", () => {
      const intersect = this.getFirstIntersect();
      if (!intersect) {
        return null;
      }
      const object = intersect.object as THREE.Mesh;
      const material = object.material as any;
      console.log(object.name);
      if (!material.isHighlighted) {
        material.isHighlighted = true;
        material.originColor = new THREE.Color(
          material.color.r,
          material.color.g,
          material.color.b
        );
        material.color.set(color);
      } else {
        material.isHighlighted = false;
        material.color.set(material.originColor);
      }
    });
  }
}

export { RaycastSelector };
