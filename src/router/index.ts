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
import SunshineSimulation from "../views/SunshineSimulation.vue";
import RayMarchingBall from "../views/RayMarchingBall.vue";
import HyperbolicHelicoid from "../views/HyperbolicHelicoid.vue";
import RayTracing from "../views/RayTracing.vue";
import SpikyBlob from "../views/SpikyBlob.vue";
import ParticleShape from "../views/ParticleShape.vue";
import FloatBubbles from "../views/FloatBubbles.vue";
import NoiseMaterial from "../views/NoiseMaterial.vue";
import NoiseWave from "../views/NoiseWave.vue";
import CurlTube from "../views/CurlTube.vue";
import ThousandFollow from "../views/ThousandFollow.vue";
import LiquidCrystal from "../views/LiquidCrystal.vue";
import VueLogo from "../views/VueLogo.vue";
import CylinderOrbitText from "../views/CylinderOrbitText.vue";
import FBOParticles from "../views/FBOParticles.vue";
import LeanGallery from "../views/LeanGallery.vue";
import CloudySky from "../views/CloudySky.vue";
import SimpleFBM from "../views/SimpleFBM.vue";
import RayMarchingPlayground from "../views/RayMarchingPlayground.vue";
import RayMarchingFire from "../views/RayMarchingFire.vue";
import BouncyBalloon from "../views/BouncyBalloon.vue";
import NakedEye from "../views/NakedEye.vue";
import WaveCloth from "../views/WaveCloth.vue";
import DominosEffect from "../views/DominosEffect.vue";
import NoiseMarble from "../views/NoiseMarble.vue";
import MorphParticles from "../views/MorphParticles.vue";
import ShapeTransition from "../views/ShapeTransition.vue";
import TimeTravel from "../views/TimeTravel.vue";
import PixelRiver from "../views/PixelRiver.vue";
import ImagePlane from "../views/ImagePlane.vue";
import UnrollImages from "../views/UnrollImages.vue";
import ImageRipple from "../views/ImageRipple.vue";
import FloatPaper from "../views/FloatPaper.vue";

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
    path: "/sunshine-simulation",
    name: "SunshineSimulation",
    component: SunshineSimulation,
  },
  {
    path: "/ray-marching-ball",
    name: "RayMarchingBall",
    component: RayMarchingBall,
  },
  {
    path: "/hyperbolic-helicoid",
    name: "HyperbolicHelicoid",
    component: HyperbolicHelicoid,
  },
  {
    path: "/ray-tracing",
    name: "RayTracing",
    component: RayTracing,
  },
  {
    path: "/spiky-blob",
    name: "SpikyBlob",
    component: SpikyBlob,
  },
  {
    path: "/particle-shape",
    name: "ParticleShape",
    component: ParticleShape,
  },
  {
    path: "/float-bubbles",
    name: "FloatBubbles",
    component: FloatBubbles,
  },
  {
    path: "/noise-material",
    name: "NoiseMaterial",
    component: NoiseMaterial,
  },
  {
    path: "/noise-wave",
    name: "NoiseWave",
    component: NoiseWave,
  },
  {
    path: "/curl-tube",
    name: "CurlTube",
    component: CurlTube,
  },
  {
    path: "/thousand-follow",
    name: "ThousandFollow",
    component: ThousandFollow,
  },
  {
    path: "/liquid-crystal",
    name: "LiquidCrystal",
    component: LiquidCrystal,
  },
  {
    path: "/vue-logo",
    name: "VueLogo",
    component: VueLogo,
  },
  {
    path: "/cylinder-orbit-text",
    name: "CylinderOrbitText",
    component: CylinderOrbitText,
  },
  {
    path: "/fbo-particles",
    name: "FBOParticles",
    component: FBOParticles,
  },
  {
    path: "/lean-gallery",
    name: "LeanGallery",
    component: LeanGallery,
  },
  {
    path: "/cloudy-sky",
    name: "CloudySky",
    component: CloudySky,
  },
  {
    path: "/simple-fbm",
    name: "SimpleFBM",
    component: SimpleFBM,
  },
  {
    path: "/ray-marching-playground",
    name: "RayMarchingPlayground",
    component: RayMarchingPlayground,
  },
  {
    path: "/ray-marching-fire",
    name: "RayMarchingFire",
    component: RayMarchingFire,
  },
  {
    path: "/bouncy-balloon",
    name: "BouncyBalloon",
    component: BouncyBalloon,
  },
  {
    path: "/naked-eye",
    name: "NakedEye",
    component: NakedEye,
  },
  {
    path: "/wave-cloth",
    name: "WaveCloth",
    component: WaveCloth,
  },
  {
    path: "/dominos-effect",
    name: "DominosEffect",
    component: DominosEffect,
  },
  {
    path: "/noise-marble",
    name: "NoiseMarble",
    component: NoiseMarble,
  },
  {
    path: "/morph-particles",
    name: "MorphParticles",
    component: MorphParticles,
  },
  {
    path: "/shape-transition",
    name: "ShapeTransition",
    component: ShapeTransition,
  },
  {
    path: "/time-travel",
    name: "TimeTravel",
    component: TimeTravel,
  },
  {
    path: "/pixel-river",
    name: "PixelRiver",
    component: PixelRiver,
  },
  {
    path: "/image-plane",
    name: "ImagePlane",
    component: ImagePlane,
  },
  {
    path: "/unroll-images",
    name: "UnrollImages",
    component: UnrollImages,
  },
  {
    path: "/image-ripple",
    name: "ImageRipple",
    component: ImageRipple,
  },
  {
    path: "/float-paper",
    name: "FloatPaper",
    component: FloatPaper,
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
