<template>
  <div class="noise-material w-full h-full bg-white-1"></div>
</template>

<script lang="ts">
import NoiseMaterial from "@/scenes/noiseMaterial";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "NoiseMaterial",
  setup() {
    const start = () => {
      const noiseMaterial = new NoiseMaterial(".noise-material", false);
      noiseMaterial.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
