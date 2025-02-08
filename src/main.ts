import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import Card from "primevue/card";
import Image from "primevue/image";
import Badge from "primevue/badge";
import InlineMessage from "primevue/inlinemessage";
import Knob from "primevue/knob";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import Dropdown from "primevue/dropdown";
import Tag from "primevue/tag";
import Menubar from "primevue/menubar";
import { createStore } from "vuex";
import State from "@/store/State";
import SocketService from "@/services/SocketService";
import { createYmaps } from "vue-yandex-maps";

import "primeflex/primeflex.css";
import "primevue/resources/themes/lara-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

const store = createStore({
  state(): State {
    return {
      ok: false,
      minAngle: 0,
      maxAngle: 0,
      currentAngle: 0,
      minSpeed: 0,
      maxSpeed: 0,
      currentSpeed: 0,
      latitude: 55.755819,
      longitude: 37.617644,
    };
  },
  mutations: {
    setOk(state: State, ok: boolean): void {
      state.ok = ok;
    },

    setMinAngle(state: State, minAngle: number): void {
      state.minAngle = minAngle;
    },

    setMaxAngle(state: State, maxAngle: number): void {
      state.maxAngle = maxAngle;
    },

    setCurrentAngle(state: State, currentAngle: number): void {
      state.currentAngle = currentAngle;
    },

    setMinSpeed(state: State, minSpeed: number): void {
      state.minSpeed = minSpeed;
    },

    setMaxSpeed(state: State, maxSpeed: number): void {
      state.maxSpeed = maxSpeed;
    },

    setCurrentSpeed(state: State, currentSpeed: number): void {
      state.currentSpeed = currentSpeed;
    },

    setLatitude(state: State, latitude: number): void {
      state.latitude = latitude;
    },

    setLongitude(state: State, longitude: number): void {
      state.longitude = longitude;
    },
  },
});

setInterval(() => {
  SocketService.socket
    .timeout(1000)
    .emit("state", (err: unknown, json: string) => {
      if (err) {
        store.state.ok = false;

        console.log("No socket connection");
        console.error(err);

        return;
      }

      const state: State = JSON.parse(json);

      store.state.ok = state.ok;
      store.state.minAngle = state.minAngle;
      store.state.maxAngle = state.maxAngle;
      store.state.currentAngle = state.currentAngle;
      store.state.minSpeed = state.minSpeed;
      store.state.maxSpeed = state.maxSpeed;
      store.state.currentSpeed = state.currentSpeed;

      if (state.latitude > 0 && state.longitude > 0) {
        store.state.latitude = state.latitude;
        store.state.longitude = state.longitude;
      }

      console.log(state);
    });
}, 2000);

createApp(App)
  .use(router)
  .use(PrimeVue)
  .use(store)
  .use(
    createYmaps({
      apikey: process.env.VUE_APP_YANDEX_MAP_KEY,
    }),
  )
  .component("Card", Card)
  .component("Image", Image)
  .component("Badge", Badge)
  .component("InlineMessage", InlineMessage)
  .component("Knob", Knob)
  .component("DataTable", DataTable)
  .component("Column", Column)
  .component("Textarea", Textarea)
  .component("Button", Button)
  .component("InputNumber", InputNumber)
  .component("Dropdown", Dropdown)
  .component("Tag", Tag)
  .component("Menubar", Menubar)
  .mount("#app");
