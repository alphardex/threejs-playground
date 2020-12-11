<template>
  <router-view />
</template>

<script lang="ts">
import "@alphardex/aqua.css/dist/aqua.sp.min.css";
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style lang="scss">
body {
  height: 100vh;
  margin: 0;
  background: white;
}

// colors

:root {
  --blue-grad-1: linear-gradient(
    -225deg,
    #473b7b 0%,
    #3584a7 51%,
    #30d2be 100%
  );
}

// reset

a {
  -webkit-tap-highlight-color: transparent;
}

* {
  border-width: 0;
}

input,
select {
  outline: none !important;
  appearance: none !important;
}

// utils

.opacity-0 {
  opacity: 0 !important;
}

// common

#app {
  width: 100%;
  height: 100%;
}

// animations

.shadow-in {
  animation: shadow-in 1s linear;
}

@keyframes shadow-in {
  from {
    text-shadow: 0 0 1rem white, 2rem -2rem 1rem white, 2rem 2rem 1rem white,
      -2rem 2rem 1rem white, -2rem -2rem 1rem white;
    opacity: 0;
  }

  to {
    text-shadow: 0 0 0 white;
    opacity: 1;
  }
}

.fade-in {
  animation: fade-in 0.6s both;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
