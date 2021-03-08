<template>
  <div class="absolute w-screen h-screen flex-center opacity-0">
    <img
      src="../assets/particle-explode/1.jpg"
      class="w-60 cursor-pointer"
      alt=""
    />
  </div>
  <div class="particle-explode w-full h-full bg-black"></div>
</template>

<script lang="ts">
import ParticleExplode from "@/scenes/particleExplode";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "ParticleExplode",
  setup() {
    const start = () => {
      const particleExplode = new ParticleExplode(".particle-explode", true);
      particleExplode.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
