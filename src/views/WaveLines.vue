<template>
  <div class="wave-lines w-full h-full bg-black"></div>
</template>

<script lang="ts">
import WaveLines from "@/scenes/waveLines";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "WaveLines",
  setup() {
    const start = () => {
      const waveLines = new WaveLines(".wave-lines", false);
      waveLines.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
