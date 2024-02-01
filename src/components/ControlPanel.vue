<template>
  <div style="width: 210px">
    <div class="grid grid-nogutter">
      <div class="col-4" style="transform: rotate(-90deg)">
        <DirectionArrow
          v-if="isWheels"
          v-on:click="speedUp()"
          class="pi pi-forward"
        />
        <DirectionArrow v-else class="pi" />
      </div>
      <div class="col-4">
        <DirectionArrow v-on:click="forward()" class="pi pi-arrow-up" />
      </div>
      <DirectionArrow class="pi" />
    </div>

    <div class="grid grid-nogutter">
      <div class="col-4">
        <DirectionArrow v-on:click="left()" class="pi pi-arrow-left" />
      </div>
      <div class="col-4">
        <DirectionArrow
          v-if="isWheels"
          v-on:click="stop()"
          class="pi pi-stop-circle"
        />
        <DirectionArrow v-else class="pi" />
      </div>
      <div class="col-4">
        <DirectionArrow v-on:click="right()" class="pi pi-arrow-right" />
      </div>
    </div>

    <div class="grid grid-nogutter">
      <div class="col-4" style="transform: rotate(-90deg)">
        <DirectionArrow
          v-if="isWheels"
          v-on:click="speedDown()"
          class="pi pi-backward"
        />
        <DirectionArrow v-else class="pi" />
      </div>
      <div class="col-4">
        <DirectionArrow v-on:click="backward()" class="pi pi-arrow-down" />
      </div>
      <div class="col-4">
        <DirectionArrow
          v-if="isWheels"
          v-on:click="forceStop()"
          class="pi pi-power-off"
        />
        <DirectionArrow v-else class="pi" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DirectionArrow from "./DirectionArrow.vue";
import ControlServiceInterface from "@/services/ControlServiceInterface";

export default defineComponent({
  components: {
    DirectionArrow,
  },

  props: {
    service: {
      type: Object as () => ControlServiceInterface,
      required: true,
    },
    isWheels: {
      type: Boolean,
      default: true,
    },
  },

  methods: {
    forward(): void {
      this.service.forward();
    },

    backward(): void {
      this.service.backward();
    },

    left(): void {
      this.service.left();
    },

    right(): void {
      this.service.right();
    },

    stop(): void {
      this.service.stop();
    },

    forceStop(): void {
      this.service.forceStop();
    },

    speedUp(): void {
      this.service.speedUp();
    },

    speedDown(): void {
      this.service.speedDown();
    },
  },
});
</script>
