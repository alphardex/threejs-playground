<template>
  <div class="float-bubbles w-full h-full"></div>
</template>

<script lang="ts">
import FloatBubbles from "@/scenes/floatBubbles";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "FloatBubbles",
  setup() {
    const start = () => {
      const floatBubbles = new FloatBubbles(".float-bubbles", false);
      floatBubbles.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
