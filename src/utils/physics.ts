import * as THREE from "three";
import * as CANNON from "cannon-es";

class MeshPhysicsObject {
  mesh!: THREE.Mesh | THREE.Object3D;
  body!: CANNON.Body;
  copyPosition!: boolean;
  copyQuaternion!: boolean;
  constructor(mesh: THREE.Mesh | THREE.Object3D, body: CANNON.Body, copyPosition = true, copyQuaternion = true) {
    this.mesh = mesh;
    this.body = body;
    this.copyPosition = copyPosition;
    this.copyQuaternion = copyQuaternion;
  }
}

export { MeshPhysicsObject };
