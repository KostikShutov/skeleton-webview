<template>
  <button />
</template>

<style lang="stylus" scoped>
button
  outline: none;
  cursor: pointer
  text-align: center
  background: grey
  color: white
  width: 70px
  height: 70px
  font-size: 2rem
  border-right: 10px solid darken(grey, 20)
  border-bottom: 10px solid darken(grey, 20)
  border-left: 10px solid darken(grey, 15)
  border-top: 10px solid darken(grey, 10)
  display: inline-block
  transition: all .05s linear
  user-select: none
  padding: 0
  &:active
    border-bottom: 8px solid darken(grey, 20)
    text-shadow: 0 0 10px white, 0 0 10px white, 0 0 20px white
    transform: translate(0, 2px)
</style>

<script lang="ts">
export default {};
</script>
