<template>
  <div class="pixel-river w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import PixelRiver from "@/scenes/pixelRiver";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "PixelRiver",
  setup() {
    const start = () => {
      const pixelRiver = new PixelRiver(".pixel-river", false);
      pixelRiver.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
