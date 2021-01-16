import C from "cannon";
import * as THREE from "three";

class MeshPhysicsObject {
  body!: C.Body;
  mesh!: THREE.Mesh | THREE.Object3D;
  constructor(body: C.Body, mesh: THREE.Mesh | THREE.Object3D) {
    this.body = body;
    this.mesh = mesh;
  }
}

export { MeshPhysicsObject };
