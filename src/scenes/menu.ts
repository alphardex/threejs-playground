import * as THREE from "three";
import C from "cannon";
import ky from "kyouka";
import { MeshPhysicsObject } from "@/utils/physics";
import { PhysicsBase } from "./base";
import { menuFontConfig, menuFontUrl } from "@/consts/menu";

class LetterObject extends MeshPhysicsObject {
  xOffset!: number;
  size!: THREE.Vector3;
  text!: string;
  constructor(
    mesh: THREE.Mesh,
    body: C.Body,
    xOffset: number,
    size: THREE.Vector3,
    text = ""
  ) {
    super(mesh, body);
    this.xOffset = xOffset;
    this.size = size;
    this.text = text;
  }
}

class Menu extends PhysicsBase {
  meshPhysicsObjs!: LetterObject[];
  menuItems!: Element[];
  margin!: number;
  offset!: number;
  groundMat!: C.Material;
  letterMat!: C.Material;
  constructor(sel: string, debug: boolean) {
    super(sel, debug);
    this.cameraPosition = new THREE.Vector3(-10, 10, 10);
    this.orthographicCameraParams = {
      zoom: 15,
      near: -1,
      far: 100,
    };
    this.updateOrthographicCameraParams();
    this.gravity = new C.Vec3(0, -50, 0);
    this.margin = 6;
    const menuItems = Array.from(
      document.querySelectorAll(".menu-list-item a")
    ).reverse();
    this.menuItems = menuItems;
    this.offset = menuItems.length * this.margin * 0.5;
    this.meshPhysicsObjs = [];
  }
  async init() {
    this.createWorld();
    this.createScene();
    this.createOrthographicCamera();
    this.createRenderer();
    this.createLight();
    this.createContactMaterial();
    await this.createMenu();
    this.createFog();
    this.createRaycaster();
    this.addListeners();
    this.setLoop();
  }
  // 创建雾
  createFog() {
    const fog = new THREE.Fog(0x202533, -1, 200);
    this.scene.fog = fog;
  }
  // 创建光
  createLight() {
    const ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);
    const foreLight = new THREE.DirectionalLight(0xffffff, 0.5);
    foreLight.position.set(5, 5, 20);
    this.scene.add(foreLight);
    const backLight = new THREE.DirectionalLight(0xffffff, 1);
    backLight.position.set(-5, -5, -10);
    this.scene.add(backLight);
  }
  // 创建菜单
  async createMenu() {
    const font = await this.loadFont(menuFontUrl);
    this.menuItems.forEach((item, i) => {
      this.createGround(i);
      const word = new THREE.Group();
      const { textContent } = item;
      let letterXOffset = 0;
      Array.from(textContent!).forEach((letter) => {
        const config = {
          font,
          ...menuFontConfig,
        };
        const { mesh, size } = this.createText(
          letter,
          config,
          THREE.MeshPhongMaterial,
          new THREE.Color("#31C9BB")
        );
        letterXOffset += size.x;
        const letterYOffset =
          (this.menuItems.length - i - 1) * this.margin - this.offset;
        const halfExtents = new C.Vec3().copy(size as any).scale(0.5);
        const mass = 1 / textContent!.length;
        const position = new C.Vec3(letterXOffset, letterYOffset, 0);
        const material = this.letterMat;
        const bodyOptions = { mass, position, material };
        const bodyOffset = mesh.geometry.boundingSphere!.center as any;
        const body = this.createBody(
          new C.Box(halfExtents),
          new C.Body(bodyOptions),
          bodyOffset
        );
        const letterObj = new LetterObject(
          mesh,
          body,
          letterXOffset,
          size,
          letter
        );
        this.meshPhysicsObjs.push(letterObj);
        (mesh as any).body = body;
        (mesh as any).size = size;
        word.add(mesh);
      });
      word.children.forEach((letter: any) => {
        letter.body.position.x -= letter.size.x + letterXOffset * 0.5;
      });
      this.scene.add(word);
    });
    this.createConstraints();
  }
  // 创建地面
  createGround(i: number) {
    const halfExtents = new C.Vec3(50, 0.1, 50);
    const mass = 0;
    const position = new C.Vec3(0, i * this.margin - this.offset, 0);
    const material = this.groundMat;
    const bodyOptions = { mass, position, material };
    this.createBody(new C.Box(halfExtents), new C.Body(bodyOptions));
  }
  // 监听事件
  addListeners() {
    this.onResize();
    this.onMousemove();
    this.onClick();
  }
  // 监听点击
  onClick() {
    document.addEventListener("click", () => {
      this.raycaster.setFromCamera(this.mousePos, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.scene.children,
        true
      );
      if (!ky.isEmpty(intersects)) {
        const obj = intersects[0];
        if (!obj.face) {
          return;
        }
        const { object, face } = obj;
        const impulse = new THREE.Vector3()
          .copy(face!.normal)
          .negate()
          .multiplyScalar(25);
        this.meshPhysicsObjs.forEach((letterObj) => {
          const { mesh, body } = letterObj;
          if (mesh !== object) {
            return;
          }
          body.applyLocalImpulse(impulse as any, new C.Vec3());
        });
      }
    });
  }
  // 添加约束条件
  createConstraints() {
    let prevWordLength = 0;
    this.menuItems.forEach((menuItem, j) => {
      const word = menuItem.textContent!;
      const prevWord = j >= 1 ? this.menuItems[j - 1].textContent! : "";
      prevWordLength += prevWord.length;
      for (let i = 0; i < word.length; i++) {
        const letterIdx = prevWordLength + i;
        const nextLetterIdx =
          i === word.length - 1 ? null : prevWordLength + i + 1;
        if (!nextLetterIdx) {
          continue;
        }
        const letterObj = this.meshPhysicsObjs[letterIdx];
        const nextLetterObj = this.meshPhysicsObjs[nextLetterIdx];
        // 支点A为第二个字母的原点
        const c = new C.ConeTwistConstraint(
          letterObj.body,
          nextLetterObj.body,
          {
            pivotA: new C.Vec3(letterObj.size.x, 0, 0),
            pivotB: new C.Vec3(0, 0, 0),
          }
        );
        c.collideConnected = true;
        this.world.addConstraint(c);
      }
    });
  }
  // 创建联系材质
  createContactMaterial() {
    const groundMat = new C.Material("ground");
    const letterMat = new C.Material("letter");
    const contactMat = new C.ContactMaterial(groundMat, letterMat, {
      friction: 0.01,
    });
    this.world.addContactMaterial(contactMat);
    this.groundMat = groundMat;
    this.letterMat = letterMat;
  }
}

export default Menu;
