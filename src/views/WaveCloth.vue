<template>
  <div class="wave-cloth w-full h-full bg-blue-grad-3"></div>
</template>

<script lang="ts">
import WaveCloth from "@/scenes/waveCloth";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "WaveCloth",
  setup() {
    const start = () => {
      const waveCloth = new WaveCloth(".wave-cloth", false);
      waveCloth.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
