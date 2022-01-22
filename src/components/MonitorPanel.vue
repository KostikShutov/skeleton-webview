<template>
  <Image
    v-if="isLoaded"
    :src="streamSrc"
    imageClass="w-full h-20rem"
    imageStyle="object-fit: contain"
    @error="pictureLoadingError"
  />
  <Image
    v-else
    :src="errorSrc"
    imageClass="w-full h-20rem"
    imageStyle="object-fit: contain"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data(): { streamSrc: string; errorSrc: string; isLoaded: boolean } {
    return {
      streamSrc: process.env.VUE_APP_VIDEO_HOST,
      errorSrc: require("@/assets/no-camera.png"),
      isLoaded: true,
    };
  },
  methods: {
    pictureLoadingError(): void {
      this.isLoaded = false;
    },
  },
});
</script>
