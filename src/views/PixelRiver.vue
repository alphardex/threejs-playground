<template>
  <div
    class="pixel-river fixed z-0 w-screen h-screen pointer-events-none"
  ></div>
  <div class="bg-black">
    <div class="h-20"></div>
    <div class="h-100"></div>
    <div class="h-40"></div>
    <div class="gallery place-items-center">
      <div v-for="n in 9" :key="n">
        <img
          :src="require(`../assets/pixel-river/${n}.jpg`)"
          alt=""
          class="w-100 block"
        />
      </div>
    </div>
    <div class="h-20"></div>
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

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(45ch, 1fr));
  gap: 12rem 4rem;
}
</style>
