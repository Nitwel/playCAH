<template>
    <router-view />
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
</script>

<style lang="scss">
body {
  margin: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  --white: white;
  --black: black;
  --light-grey: #EBEBEB;
  --grey: #CFCFCF;
  --dark-grey: #646464;
  --green: #8CBC91;
  --gold: #EBD129;
  --silver: #B5B5B5;
  --bronze: #D28410;
  --red: #FF5151;
}

#app {
  overflow: hidden;
  width: 100%;
  height: 100%;
}

* {
  box-sizing: border-box;
}

</style>