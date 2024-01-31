<template>
  <Card class="mt-2">
    <template #title>
      <div class="flex align-items-center">
        <img
          alt="logo"
          :src="require('@/assets/water.jpg')"
          height="40"
          class="mr-2"
        />
        <span>{{ $route.name }}</span>
      </div></template
    >
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
export default {};
</script>
