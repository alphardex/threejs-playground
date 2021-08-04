<template>
  <div class="bouncy-balloon w-full h-full bg-white-grad-1"></div>
</template>

<script lang="ts">
import BouncyBalloon from "@/scenes/bouncyBalloon";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "BouncyBalloon",
  setup() {
    const start = () => {
      const bouncyBalloon = new BouncyBalloon(".bouncy-balloon", false);
      bouncyBalloon.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
