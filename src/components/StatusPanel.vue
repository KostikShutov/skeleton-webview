<template>
  <div class="flex-column">
    <div class="flex justify-content-center align-items-center mb-2">
      <Badge
        :severity="$store.state.ok ? 'success' : 'danger'"
        class="mr-2"
      ></Badge>
      <span>{{
        $store.state.ok ? "Успешное подключение" : "Ошибка подключения"
      }}</span>
    </div>
    <div>
      <div class="flex justify-content-center align-items-center mb-2">
        <span>Скорость:</span>
      </div>
      <Knob
        class="flex justify-content-center align-items-center"
        v-model="$store.state.currentSpeed"
        :min="$store.state.minSpeed"
        :max="$store.state.maxSpeed"
      />
    </div>
    <div>
      <div class="flex justify-content-center align-items-center mb-2">
        <span>Угол колес:</span>
      </div>
      <Knob
        class="flex justify-content-center align-items-center"
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

export default defineComponent({
  methods: {
    onChange(): void {
      console.log(this.$store.state.currentAngle);
    },
  },
});
</script>
