<template>
  <div class="grid-wave w-full h-full bg-blue-1"></div>
</template>

<script lang="ts">
import GridWave from "@/scenes/gridwave";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Grid",
  setup() {
    const start = () => {
      const gridWave = new GridWave(".grid-wave", true);
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
