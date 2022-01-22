<template>
  <div class="grid grid-nogutter">
    <div class="col-12 md:col-7 border-1 surface-border p-2">
      <MonitorPanel />
    </div>
    <div class="col-12 md:col-5 border-1 surface-border p-2">
      <StatusPanel />
    </div>
  </div>

  <div class="grid grid-nogutter">
    <div class="col-12 md:col-6 border-1 surface-border p-2">
      <div class="flex justify-content-center w-full mb-2">
        <InlineMessage severity="info">Колеса</InlineMessage>
      </div>
      <div class="flex justify-content-center w-full">
        <ControlPanel :service="wheels" />
      </div>
    </div>
    <div class="col-12 md:col-6 border-1 surface-border p-2">
      <div class="flex justify-content-center w-full mb-2">
        <InlineMessage severity="info">Камера</InlineMessage>
      </div>
      <div class="flex justify-content-center w-full">
        <ControlPanel :service="camera" :withStop="false" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MonitorPanel from "@/components/MonitorPanel.vue";
import StatusPanel from "@/components/StatusPanel.vue";
import ControlPanel from "@/components/ControlPanel.vue";
import CameraControlService from "@/services/CameraControlService";
import WheelsControlService from "@/services/WheelsControlService";

export default defineComponent({
  components: {
    MonitorPanel,
    StatusPanel,
    ControlPanel,
  },
  data(): { camera: CameraControlService; wheels: WheelsControlService } {
    return {
      camera: new CameraControlService(),
      wheels: new WheelsControlService(),
    };
  },
});
</script>
