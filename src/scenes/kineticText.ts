import * as THREE from "three";
import ky from "kyouka";
import * as dat from "dat.gui";
import { Base } from "./base";

class KineticText extends Base {
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
  }
  // 初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createLight();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
}

export default KineticText;
