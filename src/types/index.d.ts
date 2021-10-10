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
  geometry?: THREE.Geometry | THREE.BufferGeometry;
  material?: THREE.Material;
  position?: THREE.Vector3;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface SunshineInfo {
  time: string;
  pos: SunshinePos;
}

export interface SunshinePos {
  sunshinePos: any;
  sunshinePosCalc: Point3D;
}

export interface Scroll {
  current: number;
  target: number;
  ease: number;
  last: number;
  delta: number;
  direction: "up" | "down" | "";
}
