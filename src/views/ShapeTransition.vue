<template>
  <div class="shape-transition w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import ShapeTransition from "@/scenes/shapeTransition";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "ShapeTransition",
  setup() {
    const start = () => {
      const shapeTransition = new ShapeTransition(".shape-transition", false);
      shapeTransition.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
