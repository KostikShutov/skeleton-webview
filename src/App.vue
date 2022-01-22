<template>
  <Menubar :model="items">
    <template #start>
      <img
        alt="logo"
        :src="require('@/assets/water.jpg')"
        height="40"
        class="mr-2"
      />
    </template>
  </Menubar>
  <Card class="mt-2">
    <template #title>{{ $route.name }}</template>
    <template #content>
      <router-view />
    </template>
  </Card>
</template>

<style lang="stylus">
#app
  font-family Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  height: 100%
</style>

<script lang="ts">
export default {
  data(): { items: Array<{ label: string; icon: string; url: string }> } {
    return {
      items: [
        {
          label: "Главная",
          icon: "pi pi-fw pi-car",
          url: "/",
        },
        {
          label: "Генератор",
          icon: "pi pi-fw pi-compass",
          url: "/generator",
        },
      ],
    };
  },
};
</script>
