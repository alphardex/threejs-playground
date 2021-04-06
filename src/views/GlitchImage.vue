<template>
  <div class="glitch-image w-full h-full bg-black"></div>
</template>

<script lang="ts">
import GlitchImage from "@/scenes/glitchImage";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "GlitchImage",
  setup() {
    const start = () => {
      const glitchImage = new GlitchImage(".glitch-image", true);
      glitchImage.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
