<template>
  <div class="noise-wave w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import NoiseWave from "@/scenes/noiseWave";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "NoiseWave",
  setup() {
    const start = () => {
      const noiseWave = new NoiseWave(".noise-wave", false);
      noiseWave.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
