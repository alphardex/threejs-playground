<template>
  <div class="morph-particles w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import MorphParticles from "@/scenes/morphParticles";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "MorphParticles",
  setup() {
    const start = () => {
      const morphParticles = new MorphParticles(".morph-particles", false);
      morphParticles.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
