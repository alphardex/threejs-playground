import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import NotFound from "../views/NotFound.vue";
import Starter from "../views/Starter.vue";
import Stack from "../views/Stack.vue";
import Panorama from "../views/Panorama.vue";
import Buildings from '../views/Buildings.vue';
import Menu from '../views/Menu.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/starter",
    name: "Starter",
    component: Starter,
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
