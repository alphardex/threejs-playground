import C from "cannon";
import * as THREE from "three";

class MeshPhysicsObject {
  mesh!: THREE.Mesh | THREE.Object3D;
  body!: C.Body;
  constructor(mesh: THREE.Mesh | THREE.Object3D, body: C.Body) {
    this.mesh = mesh;
    this.body = body;
  }
}

export { MeshPhysicsObject };
