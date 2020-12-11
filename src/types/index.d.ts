import { Color } from "three";

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

export interface Cube {
  width?: number;
  height?: number;
  depth?: number;
  x?: number;
  y?: number;
  z?: number;
  color?: string | Color;
}
