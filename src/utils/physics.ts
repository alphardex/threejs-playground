import C from "cannon";
import * as THREE from "three";

class MeshPhysicsObject {
  body!: C.Body;
  mesh!: THREE.Mesh;
  constructor(body: C.Body, mesh: THREE.Mesh) {
    this.body = body;
    this.mesh = mesh;
  }
}

export { MeshPhysicsObject };
