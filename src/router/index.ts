import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import NotFound from "../views/NotFound.vue";
import Template from "../views/Template.vue";
import Base from "../views/Base.vue";
import Stack from "../views/Stack.vue";
import Panorama from "../views/Panorama.vue";
import Buildings from "../views/Buildings.vue";
import Menu from "../views/Menu.vue";
import BellStrike from "../views/BellStrike.vue";
import FloatWorld from "../views/FloatWorld.vue";
import GridWave from "../views/GridWave.vue";
import WavinFlag from "../views/WavinFlag.vue";
import TwistedShape from "../views/TwistedShape.vue";
import TravellingParticles from "../views/TravellingParticles.vue";
import KineticText from "../views/KineticText.vue";
import LineWave from "../views/LineWave.vue";
import RayMarching from "../views/RayMarching.vue";
import DistortImage from "../views/DistortImage.vue";
import TwistedGallery from "../views/TwistedGallery.vue";
import TwistedColorfulSphere from "../views/TwistedColorfulSphere.vue";
import ParticleExplode from "../views/ParticleExplode.vue";
import GridIcosahedron from "../views/GridIcosahedron.vue";
import Sun from "../views/Sun.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/template",
    name: "Template",
    component: Template,
  },
  {
    path: "/base",
    name: "Base",
    component: Base,
  },
  {
    path: "/stack",
    name: "Stack",
    component: Stack,
  },
  {
    path: "/panorama",
    name: "Panorama",
    component: Panorama,
  },
  {
    path: "/buildings",
    name: "Buildings",
    component: Buildings,
  },
  {
    path: "/menu",
    name: "Menu",
    component: Menu,
  },
  {
    path: "/bell-strike",
    name: "BellStrike",
    component: BellStrike,
  },
  {
    path: "/float-world",
    name: "FloatWorld",
    component: FloatWorld,
  },
  {
    path: "/grid-wave",
    name: "GridWave",
    component: GridWave,
  },
  {
    path: "/wavin-flag",
    name: "WavinFlag",
    component: WavinFlag,
  },
  {
    path: "/twisted-shape",
    name: "TwistedShape",
    component: TwistedShape,
  },
  {
    path: "/travelling-particles",
    name: "TravellingParticles",
    component: TravellingParticles,
  },
  {
    path: "/kinetic-text",
    name: "KineticText",
    component: KineticText,
  },
  {
    path: "/line-wave",
    name: "LineWave",
    component: LineWave,
  },
  {
    path: "/ray-marching",
    name: "RayMarching",
    component: RayMarching,
  },
  {
    path: "/distort-image",
    name: "DistortImage",
    component: DistortImage,
  },
  {
    path: "/twisted-gallery",
    name: "TwistedGallery",
    component: TwistedGallery,
  },
  {
    path: "/twisted-colorful-sphere",
    name: "TwistedColorfulSphere",
    component: TwistedColorfulSphere,
  },
  {
    path: "/particle-explode",
    name: "ParticleExplode",
    component: ParticleExplode,
  },
  {
    path: "/grid-icosahedron",
    name: "GridIcosahedron",
    component: GridIcosahedron,
  },
  {
    path: "/sun",
    name: "Sun",
    component: Sun,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, left: 0 };
  },
});

export default router;
