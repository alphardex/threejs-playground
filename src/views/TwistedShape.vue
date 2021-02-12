<template>
  <div class="twisted-shape w-full h-full bg-blue-grad-1"></div>
</template>

<script lang="ts">
import TwistedShape from "@/scenes/twistedShape";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "WavinFlag",
  setup() {
    const start = () => {
      const twistedShape = new TwistedShape(".twisted-shape", false);
      twistedShape.init();
    };
    onMounted(() => {
      start();
    });
    return {
      start,
    };
  },
});
</script>

<style lang="scss" scoped></style>
