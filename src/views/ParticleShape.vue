<template>
  <div class="particle-shape w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import ParticleShape from "@/scenes/particleShape";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "ParticleShape",
  setup() {
    const start = () => {
      const particleShape = new ParticleShape(".particle-shape", false);
      particleShape.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
