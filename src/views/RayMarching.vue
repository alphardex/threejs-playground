<template>
  <div class="ray-marching w-screen h-screen bg-blue-grad-1"></div>
</template>

<script lang="ts">
import RayMarching from "@/scenes/rayMarching";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "RayMarching",
  setup() {
    const start = () => {
      const rayMarching = new RayMarching(".ray-marching", false);
      rayMarching.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
