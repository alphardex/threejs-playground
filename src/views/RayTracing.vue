<template>
  <div class="ray-tracing w-full h-full bg-black"></div>
</template>

<script lang="ts">
import RayTracing from "@/scenes/rayTracing";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "RayTracing",
  setup() {
    const start = () => {
      const rayTracing = new RayTracing(".ray-tracing", false);
      rayTracing.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
