<template>
  <div class="spiky-blob w-full h-full bg-white"></div>
</template>

<script lang="ts">
import SpikyBlob from "@/scenes/spikyBlob";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "SpikyBlob",
  setup() {
    const start = () => {
      const spikyBlob = new SpikyBlob(".spiky-blob", false);
      spikyBlob.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
