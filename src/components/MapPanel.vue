<template>
  <YandexMap v-model="map" :settings="settings" width="100%" height="400px">
    <YandexMapDefaultSchemeLayer />
    <YandexMapDefaultFeaturesLayer />
    <YandexMapMarker :settings="{ coordinates: coordinates }">
      <div class="marker" />
    </YandexMapMarker>
  </YandexMap>
</template>

<style lang="stylus" scoped>
.marker
  position: relative
  width: 20px
  height: 20px
  background: #ff0000
  border-radius: 50%
  border: 2px solid #fff
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5)
  text-align: center
  color: #fff
  font-weight: bold
  line-height: 20px
</style>

<script lang="ts">
import { defineComponent } from "vue";
import { shallowRef } from "vue";
import type { YMap } from "@yandex/ymaps3-types";
import {
  YandexMap,
  YandexMapMarker,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
} from "vue-yandex-maps";

export default defineComponent({
  components: {
    YandexMap,
    YandexMapMarker,
    YandexMapDefaultSchemeLayer,
    YandexMapDefaultFeaturesLayer,
  },
  setup() {
    const map = shallowRef<null | YMap>(null);

    return {
      map,
    };
  },
  computed: {
    settings() {
      return {
        location: {
          center: this.coordinates,
          zoom: 15,
        },
      };
    },
    coordinates() {
      return [this.longitude, this.latitude];
    },
    latitude() {
      return this.$store.state.latitude;
    },
    longitude() {
      return this.$store.state.longitude;
    },
  },
});
</script>
