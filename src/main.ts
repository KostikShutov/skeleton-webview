import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import Card from "primevue/card";
import Image from "primevue/image";
import Badge from "primevue/badge";
import Slider from "primevue/slider";
import InlineMessage from "primevue/inlinemessage";
import Knob from "primevue/knob";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import Dropdown from "primevue/dropdown";
import Tag from "primevue/tag";
import { createStore } from "vuex";
import State from "@/store/State";
import SocketService from "@/services/SocketService";

import "primeflex/primeflex.css";
import "primevue/resources/themes/lara-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

const store = createStore({
  state(): State {
    return {
      minAngle: 0,
      maxAngle: 0,
      currentAngle: 0,
      minSpeed: 0,
      maxSpeed: 0,
      currentSpeed: 0,
    };
  },
  mutations: {
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
  },
});

SocketService.socket
  .timeout(1000)
  .emit("state", (err: unknown, json: string) => {
    if (err) {
      console.log("No socket connection");
      console.error(err);

      return;
    }

    const state: State = JSON.parse(json);

    store.state.minAngle = state.minAngle;
    store.state.maxAngle = state.maxAngle;
    store.state.currentAngle = state.currentAngle;
    store.state.minSpeed = state.minSpeed;
    store.state.maxSpeed = state.maxSpeed;
    store.state.currentSpeed = state.currentSpeed;

    console.log(state);
  });

createApp(App)
  .use(router)
  .use(PrimeVue)
  .use(store)
  .component("Card", Card)
  .component("Image", Image)
  .component("Badge", Badge)
  .component("Slider", Slider)
  .component("InlineMessage", InlineMessage)
  .component("Knob", Knob)
  .component("DataTable", DataTable)
  .component("Column", Column)
  .component("Textarea", Textarea)
  .component("Button", Button)
  .component("InputNumber", InputNumber)
  .component("Dropdown", Dropdown)
  .component("Tag", Tag)
  .mount("#app");
