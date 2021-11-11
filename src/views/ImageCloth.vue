<template>
  <div
    class="image-cloth fixed z-0 w-screen h-screen pointer-events-none"
  ></div>
  <main class="overflow-hidden">
    <div class="bg-black" data-scroll>
      <div class="relative w-screen h-screen flex-center">
        <img
          class="w-240 h-120 opacity-0"
          src="../assets/twisted-gallery/1.jpg"
          alt=""
        />
      </div>
      <div class="relative w-screen h-screen flex-center">
        <img
          class="w-240 h-120 opacity-0"
          src="../assets/twisted-gallery/2.jpg"
          alt=""
        />
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import ImageCloth from "@/scenes/imageCloth";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "ImageCloth",
  setup() {
    const start = () => {
      const imageCloth = new ImageCloth(".image-cloth", false);
      imageCloth.init();
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

::-webkit-scrollbar {
  display: none;
}
</style>
