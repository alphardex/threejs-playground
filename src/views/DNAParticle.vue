<template>
  <div class="dna-particle w-screen h-screen bg-black overflow-hidden"></div>
</template>

<script lang="ts">
import DNAParticle from "@/scenes/DNAParticle";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "DNAParticle",
  setup() {
    const start = () => {
      const dnaParticle = new DNAParticle(".dna-particle", false);
      dnaParticle.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
