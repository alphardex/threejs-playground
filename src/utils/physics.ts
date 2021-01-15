import C from "cannon";
import { Mesh, Vector3 } from "three";

class MeshPhysicsObject {
  body!: C.Body;
  mesh!: Mesh;
  constructor(body: C.Body, mesh: Mesh) {
    this.body = body;
    this.mesh = mesh;
  }
}

export { MeshPhysicsObject };
