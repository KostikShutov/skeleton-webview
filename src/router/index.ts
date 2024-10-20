import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Generator from "../views/Generator.vue";
import Config from "../views/Config.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Управление беспилотным наземным аппаратом",
    component: Home,
  },
  {
    path: "/generator",
    name: "Автономное управление",
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
