<template>
  <div class="line-wave w-full h-full bg-black"></div>
</template>

<script lang="ts">
import LineWave from "@/scenes/lineWave";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "LineWave",
  setup() {
    const start = () => {
      const lineWave = new LineWave(".line-wave", false);
      lineWave.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
