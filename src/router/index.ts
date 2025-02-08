import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Generator from "../views/Generator.vue";
import Config from "../views/Config.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Ручное управление",
    component: Home,
  },
  {
    path: "/generator",
    name: "Управление по траектории",
    component: Generator,
  },
  {
    path: "/config",
    name: "Конфигурация",
    component: Config,
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
