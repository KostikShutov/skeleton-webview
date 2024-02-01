<template>
  <div class="grid grid-nogutter">
    <div
      class="flex justify-content-center align-items-center col-12 md:col-6 border-1 surface-border p-2"
    >
      <MonitorPanel />
    </div>
    <div class="col-12 md:col-2 border-1 surface-border p-2">
      <StatusPanel />
    </div>
    <div
      class="flex justify-content-center align-items-center col-12 md:col-4 border-1 surface-border p-2"
    >
      <MapPanel />
    </div>
  </div>

  <div class="grid grid-nogutter border-1 surface-border">
    <div class="col-12 md:col-4 border-1 surface-border">
      <div class="flex flex-row">
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
    <div class="col-12 md:col-8 border-1 surface-border p-2">
      <GeneratorPanel />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MonitorPanel from "@/components/MonitorPanel.vue";
import StatusPanel from "@/components/StatusPanel.vue";
import ControlPanel from "@/components/ControlPanel.vue";
import GeneratorPanel from "@/components/GeneratorPanel.vue";
import MapPanel from "@/components/MapPanel.vue";
import CameraControlService from "@/services/CameraControlService";
import WheelsControlService from "@/services/WheelsControlService";

export default defineComponent({
  components: {
    MonitorPanel,
    StatusPanel,
    ControlPanel,
    GeneratorPanel,
    MapPanel,
  },
  data(): { camera: CameraControlService; wheels: WheelsControlService } {
    return {
      camera: new CameraControlService(),
      wheels: new WheelsControlService(),
    };
  },
});
</script>
