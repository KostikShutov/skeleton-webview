<template>
  <div class="grid grid-nogutter">
    <div
      class="flex justify-content-center align-items-center col-6 border-1 surface-border p-2"
    >
      <MonitorPanel />
    </div>
    <div
      class="flex justify-content-center align-items-center col-6 border-1 surface-border p-2"
    >
      <MapPanel />
    </div>
  </div>
  <div class="grid grid-nogutter border-1 surface-border">
    <div class="col-12 border-1 surface-border">
      <div class="flex flex-row justify-content-left align-items-center">
        <div class="p-2">
          <StatusPanel />
        </div>
        <div class="p-2">
          <div class="flex justify-content-center w-full mb-2">
            <InlineMessage severity="info">Колеса</InlineMessage>
          </div>
          <div class="flex justify-content-center w-full">
            <ControlPanel :service="wheels" />
          </div>
        </div>
        <div class="p-2">
          <div class="flex justify-content-center w-full mb-2">
            <InlineMessage severity="info">Камера</InlineMessage>
          </div>
          <div class="flex justify-content-center w-full">
            <ControlPanel :service="camera" :isWheels="false" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SocketService from "@/services/SocketService";
import State from "@/store/State";
import MonitorPanel from "@/components/MonitorPanel.vue";
import StatusPanel from "@/components/StatusPanel.vue";
import ControlPanel from "@/components/ControlPanel.vue";
import MapPanel from "@/components/MapPanel.vue";
import CameraControlService from "@/services/CameraControlService";
import WheelsControlService from "@/services/WheelsControlService";

export default defineComponent({
  components: {
    MonitorPanel,
    StatusPanel,
    ControlPanel,
    MapPanel,
  },
  data(): { camera: CameraControlService; wheels: WheelsControlService } {
    return {
      camera: new CameraControlService(),
      wheels: new WheelsControlService(),
    };
  },
  mounted() {
    SocketService.socket.on("getCommand", (data) => {
      try {
        const parsedData: { id: string; status: string; state: State } =
          JSON.parse(data);

        this.$store.commit("setCurrentAngle", parsedData.state.currentAngle);
        this.$store.commit("setCurrentSpeed", parsedData.state.currentSpeed);
        console.log(parsedData);
      } catch (error) {
        console.error("Invalid json from get command event:", data);
      }
    });
  },
});
</script>
