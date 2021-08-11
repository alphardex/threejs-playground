<template>
  <div class="ray-marching-fire w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import RayMarchingFire from "@/scenes/rayMarchingFire";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "RayMarchingFire",
  setup() {
    const start = () => {
      const rayMarchingFire = new RayMarchingFire(".ray-marching-fire", false);
      rayMarchingFire.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
