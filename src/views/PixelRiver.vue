<template>
  <div class="pixel-river w-screen h-screen bg-black">
    <div class="absolute w-screen h-screen flex-center">
      <div class="flex items-center space-x-40">
        <img src="../assets/pixel-river/1.jpg" alt="" class="w-100" />
        <img src="../assets/pixel-river/2.jpg" alt="" class="w-100" />
        <img src="../assets/pixel-river/3.jpg" alt="" class="w-100" />
      </div>
    </div>
  </div>
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

<style lang="scss" scoped>
img {
  opacity: 0;
}
</style>
