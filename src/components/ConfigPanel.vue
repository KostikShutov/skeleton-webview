<template>
  <div class="button-container">
    <span class="p-float-label">
      <Textarea v-model="inputConfigAsXml" autoResize rows="5" cols="40" />
      <label>Конфиг [xml]</label>
    </span>
  </div>
  <div class="button-container mt-3">
    <Button
      label="Отправить конфиг"
      icon="pi pi-check"
      @click.prevent="sendConfig()"
    />
    <Button
      class="ml-3"
      label="Посмотреть конфиг"
      icon="pi pi-search"
      @click.prevent="getConfig()"
    />
  </div>
  <h3 class="text-center">Конфигурация</h3>
  <pre><code>{{ outputConfigAsXml }}</code></pre>
</template>

<style scoped>
.button-container {
  display: flex;
  flex-direction: row;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import SocketService from "@/services/SocketService";

export default defineComponent({
  data(): {
    inputConfigAsXml: string;
    outputConfigAsXml: string;
  } {
    return {
      inputConfigAsXml: "",
      outputConfigAsXml: "",
    };
  },
  methods: {
    sendConfig(): void {
      SocketService.socket.emit("uploadConfig", {
        xml: this.inputConfigAsXml,
      });
    },
    getConfig(): void {
      SocketService.socket
        .timeout(1000)
        .emit("getConfig", (err: unknown, json: string) => {
          if (err) {
            console.log("Can not get config");
            console.error(err);

            return;
          }

          this.outputConfigAsXml = JSON.parse(json).xml;
        });
    },
  },
});
</script>
