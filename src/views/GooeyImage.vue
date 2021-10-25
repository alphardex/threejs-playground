<template>
  <div
    class="gooey-image fixed z-0 w-screen h-screen pointer-events-none"
  ></div>
  <div class="bg-black">
    <div class="h-20"></div>
    <div class="gallery">
      <img
        :src="require(`../assets/pixel-river/${n}.jpg`)"
        alt=""
        class="gallery-item"
        v-for="n in 9"
        :key="n"
      />
    </div>
    <div class="h-20"></div>
  </div>
</template>

<script lang="ts">
import GooeyImage from "@/scenes/gooeyImage";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "GooeyImage",
  setup() {
    const start = () => {
      const gooeyImage = new GooeyImage(".gooey-image", false);
      gooeyImage.init();
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
  place-items: center;

  &-item {
    display: block;
    width: 25rem;
  }
}

::-webkit-scrollbar {
  display: none;
}
</style>
