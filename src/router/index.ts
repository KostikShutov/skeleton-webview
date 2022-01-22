import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Generator from "../views/Generator.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Главная",
    component: Home,
  },
  {
    path: "/generator",
    name: "Генератор",
    component: Generator,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  document.title = String(to.name || "Webview");
});

export default router;
