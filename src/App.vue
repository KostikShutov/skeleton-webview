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

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@1,700&display=swap");
body {
  font-family: "Roboto", sans-serif;
}
</style>

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
          label: "Ручное управление",
          icon: "pi pi-fw pi-car",
          url: "/",
        },
        {
          label: "Управление по траектории",
          icon: "pi pi-fw pi-compass",
          url: "/generator",
        },
        {
          label: "Конфигурация",
          icon: "pi pi-fw pi-book",
          url: "/config",
        },
        {
          label: "Загрузка файлов",
          icon: "pi pi-fw pi-upload",
          url: "/upload",
        },
        {
          label: "Очередь команд",
          icon: "pi pi-fw pi-th-large",
          url: "/timeline",
        },
      ],
    };
  },
};
</script>
