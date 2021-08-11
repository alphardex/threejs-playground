<template>
  <div class="ray-marching-playground w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import RayMarchingPlayground from "@/scenes/rayMarchingPlayground";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "RayMarchingPlayground",
  setup() {
    const start = () => {
      const rayMarchingPlayground = new RayMarchingPlayground(
        ".ray-marching-playground",
        false
      );
      rayMarchingPlayground.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
