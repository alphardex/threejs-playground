<template>
  <div class="noise-marble w-screen h-screen bg-white-grad-1"></div>
</template>

<script lang="ts">
import NoiseMarble from "@/scenes/noiseMarble";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "NoiseMarble",
  setup() {
    const start = () => {
      const noiseMarble = new NoiseMarble(".noise-marble", false);
      noiseMarble.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
