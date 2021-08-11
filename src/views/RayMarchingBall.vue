<template>
  <div class="ray-marching-ball w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import RayMarchingBall from "@/scenes/rayMarchingBall";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "RayMarchingBall",
  setup() {
    const start = () => {
      const rayMarchingBall = new RayMarchingBall(".ray-marching-ball", false);
      rayMarchingBall.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
