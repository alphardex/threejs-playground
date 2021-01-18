import C from "cannon";
import * as THREE from "three";

class MeshPhysicsObject {
  mesh!: THREE.Mesh | THREE.Object3D;
  body!: C.Body;
  copyPosition!: boolean;
  copyQuaternion!: boolean;
  constructor(mesh: THREE.Mesh | THREE.Object3D, body: C.Body, copyPosition = true, copyQuaternion = true) {
    this.mesh = mesh;
    this.body = body;
    this.copyPosition = copyPosition;
    this.copyQuaternion = copyQuaternion;
  }
}

export { MeshPhysicsObject };
