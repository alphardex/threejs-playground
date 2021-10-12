<template>
  <div
    class="unroll-images fixed z-0 w-screen h-screen pointer-events-none"
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
import UnrollImages from "@/scenes/unrollImages";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "UnrollImages",
  setup() {
    const start = async () => {
      const unrollImages = new UnrollImages(".unroll-images", false);
      await unrollImages.init();
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
    cursor: pointer;
  }
}

::-webkit-scrollbar {
  display: none;
}
</style>
