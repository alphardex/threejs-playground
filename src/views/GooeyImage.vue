<template>
  <div
    class="gooey-image fixed z-0 w-screen h-screen pointer-events-none"
  ></div>
  <div class="bg-black">
    <div class="relative w-screen h-screen flex-center" v-for="n in 2" :key="n">
      <img
        class="w-240 h-120"
        :src="require(`../assets/pixel-river/${n}.jpg`)"
        :data-inner="require(`../assets/pixel-river/${2 + 1 - n}.jpg`)"
        alt=""
      />
    </div>
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

::-webkit-scrollbar {
  display: none;
}
</style>
