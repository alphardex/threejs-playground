<template>
  <router-view />
</template>

<script lang="ts">
import "@alphardex/aqua.css/dist/aqua.sp.min.css";
import { defineComponent } from "vue";
import MockServer from "@/mock/index";
import VConsole from "vconsole";
import { isDevMode } from "./consts";

export default defineComponent({
  setup() {
    if (isDevMode) {
      const mockServer = new MockServer();
      mockServer.start();
    }
    new VConsole();
  },
});
</script>

<style lang="scss">
body {
  height: 100vh;
  margin: 0;
  font-size: 4vw;
  background: white;
}

// colors

:root {
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

// sweetalert2

.alert-title {
  font-size: 3.8vw !important;
  font-weight: normal !important;
  white-space: nowrap !important;
}

.alert-popup {
  max-width: 72vw !important;
}

// utils

// common

#app {
  width: 100%;
  height: 100%;
}
</style>
