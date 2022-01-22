<template>
  <div class="flex-column">
    <div class="mb-3">
      <Badge :severity="status" class="mr-2"></Badge>
      <span>{{ text }}</span>
    </div>
    <div class="mb-3">
      <div class="mb-2">
        <span>Скорость:</span>
      </div>
      <Slider
        v-model="$store.state.currentSpeed"
        :min="$store.state.minSpeed"
        :max="$store.state.maxSpeed"
      />
    </div>
    <div>
      <div clss="mb-2">
        <span>Угол колес:</span>
      </div>
      <Knob
        v-model="$store.state.currentAngle"
        :min="$store.state.minAngle"
        :max="$store.state.maxAngle"
        @change="onChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SocketService from "@/services/SocketService";

export default defineComponent({
  data(): { status: string; text: string; angle: string } {
    return {
      status: "",
      text: "",
      angle: "-",
    };
  },
  methods: {
    setError(): void {
      this.status = "danger";
      this.text = "Ошибка подключения к серверу";
    },

    setSuccess(): void {
      this.status = "success";
      this.text = "Подключение к серверу успешно";
    },

    startTimer(): void {
      setInterval(() => {
        SocketService.socket.timeout(1000).emit("health", (err: unknown) => {
          err ? this.setError() : this.setSuccess();
          this.$forceUpdate();
        });
      }, 2000);
    },

    onChange(): void {
      console.log(this.$store.state.currentAngle);
    },
  },
  created(): void {
    this.setError();
    this.startTimer();
  },
});
</script>
