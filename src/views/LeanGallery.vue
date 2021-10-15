<template>
  <div
    class="lean-gallery fixed z-0 inset-0 w-screen h-screen pointer-events-none"
  ></div>
  <main class="lean-gallery-dom w-screen h-screen">
    <div>
      <div class="flex-center flex-wrap" v-for="n in 6" :key="n">
        <div class="m-4">
          <img class="w-180 h-90" src="../assets/lean-gallery/1.jpg" alt="" />
        </div>
        <div class="m-4">
          <img class="w-180 h-90" src="../assets/lean-gallery/2.jpg" alt="" />
        </div>
        <div class="m-4">
          <img class="w-180 h-90" src="../assets/lean-gallery/3.jpg" alt="" />
        </div>
        <div class="m-4">
          <img class="w-180 h-90" src="../assets/lean-gallery/4.jpg" alt="" />
        </div>
      </div>
      <div class="h-20"></div>
    </div>
  </main>
</template>

<script lang="ts">
import LeanGallery from "@/scenes/leanGallery";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "LeanGallery",
  setup() {
    const start = () => {
      const leanGallery = new LeanGallery(".lean-gallery", false);
      leanGallery.init();
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
