<template>
  <main class="overflow-hidden">
    <div data-scroll>
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
      <div class="relative w-screen h-screen flex-center">
        <img
          class="w-240 h-120 opacity-0"
          src="../assets/twisted-gallery/3.jpg"
          alt=""
        />
      </div>
      <div class="relative w-screen h-screen flex-center">
        <img
          class="w-240 h-120 opacity-0"
          src="../assets/twisted-gallery/4.jpg"
          alt=""
        />
      </div>
      <div class="relative w-screen h-screen flex-center">
        <img
          class="w-240 h-120 opacity-0"
          src="../assets/twisted-gallery/5.jpg"
          alt=""
        />
      </div>
      <div class="relative w-screen h-screen flex-center">
        <img
          class="w-240 h-120 opacity-0"
          src="../assets/twisted-gallery/6.jpg"
          alt=""
        />
      </div>
    </div>
  </main>
  <div class="twisted-gallery fixed -z-1 inset-0 w-screen h-screen"></div>
</template>

<script lang="ts">
import TwistedGallery from "@/scenes/twistedGallery";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "TwistedGallery",
  setup() {
    const start = () => {
      const twistedGallery = new TwistedGallery(".twisted-gallery", true);
      twistedGallery.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style scoped></style>
