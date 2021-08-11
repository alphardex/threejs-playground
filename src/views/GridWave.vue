<template>
  <div class="grid-wave w-screen h-screen bg-blue-1"></div>
</template>

<script lang="ts">
import GridWave from "@/scenes/gridWave";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Grid",
  setup() {
    const start = () => {
      const gridWave = new GridWave(".grid-wave", false);
      gridWave.init();
    };
    onMounted(() => {
      start();
    });
    return {
      start,
    };
  },
});
</script>

<style lang="scss" scoped></style>
