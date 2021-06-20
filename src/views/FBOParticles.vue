<template>
  <div class="fbo-particles w-full h-full bg-white"></div>
</template>

<script lang="ts">
import FBOParticles from "@/scenes/FBOParticles";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "FBOParticles",
  setup() {
    const start = () => {
      const fboParticles = new FBOParticles(".fbo-particles", false);
      fboParticles.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
