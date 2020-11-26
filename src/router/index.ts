import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import NotFound from "../views/NotFound.vue";
import Starter from "../views/Starter.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/main.html",
    name: "Home",
    component: Home,
  },
  {
    path: "/starter.html",
    name: "Starter",
    component: Starter,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, left: 0 };
  },
});

export default router;
