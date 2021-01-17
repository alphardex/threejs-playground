import * as THREE from "three";

declare module "@alphardex/aqua.sp/dist/aqua.sp.min.css";

export interface NavItem {
  to: Path;
  text: string;
}

export interface Path {
  name?: string;
  path?: string;
  query?: Record<string, any>;
}

export interface MeshObject {
  geometry?: THREE.Geometry;
  material?: THREE.Material;
  position?: THREE.Vector3;
}
