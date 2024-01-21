<template>
  <div style="width: 210px">
    <div class="grid grid-nogutter">
      <div class="col-4 col-offset-4">
        <DirectionArrow v-on:click="forward()" class="pi pi-arrow-up" />
      </div>
    </div>

    <div class="grid grid-nogutter">
      <div class="col-4">
        <DirectionArrow v-on:click="left()" class="pi pi-arrow-left" />
      </div>
      <div class="col-4">
        <DirectionArrow
          v-if="withStop"
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
      <div class="col-4 col-offset-4">
        <DirectionArrow v-on:click="backward()" class="pi pi-arrow-down" />
      </div>
      <div class="col-4">
        <DirectionArrow
          v-if="withStop"
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
    withStop: {
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
  },

  created(): void {
    window.addEventListener("keypress", (event: KeyboardEvent) => {
      const keys = this.service.getKeys();

      switch (event.key) {
        case keys.forward:
          this.forward();
          break;
        case keys.backward:
          this.backward();
          break;
        case keys.left:
          this.left();
          break;
        case keys.right:
          this.right();
          break;
        case keys.stop:
          if (this.withStop) {
            this.stop();
          }
          break;
      }
    });
  },
});
</script>
