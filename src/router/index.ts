import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import NotFound from "../views/NotFound.vue";
import Base from "../views/Base.vue";
import Stack from "../views/Stack.vue";
import Panorama from "../views/Panorama.vue";
import Buildings from '../views/Buildings.vue';
import Menu from '../views/Menu.vue';
import BellStrike from '../views/BellStrike.vue';
import FloatWorld from '../views/FloatWorld.vue';
import GridWave from '../views/GridWave.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
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
    path: '/buildings',
    name: 'Buildings',
    component: Buildings
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Menu
  },
  {
    path: '/bell-strike',
    name: 'BellStrike',
    component: BellStrike
  },
  {
    path: '/float-world',
    name: 'FloatWorld',
    component: FloatWorld
  },
  {
    path: '/grid-wave',
    name: 'GridWave',
    component: GridWave
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
