<template>
  <div class="dominos-effect w-screen h-screen bg-white-2"></div>
</template>

<script lang="ts">
import DominosEffect from "@/scenes/dominosEffect";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "DominosEffect",
  setup() {
    const start = () => {
      const dominosEffect = new DominosEffect(".dominos-effect", false);
      dominosEffect.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
