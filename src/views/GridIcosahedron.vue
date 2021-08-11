<template>
  <div class="grid-icosahedron w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import GridIcosahedron from "@/scenes/gridIcosahedron";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "GridIcosahedron",
  setup() {
    const start = () => {
      const gridIcosahedron = new GridIcosahedron(".grid-icosahedron", false);
      gridIcosahedron.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
