<template>
  <div class="hyperbolic-helicoid w-full h-full bg-blue-grad-2"></div>
</template>

<script lang="ts">
import HyperbolicHelicoid from "@/scenes/hyperbolicHelicoid";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "HyperbolicHelicoid",
  setup() {
    const start = () => {
      const hyperbolicHelicoid = new HyperbolicHelicoid(
        ".hyperbolic-helicoid",
        false
      );
      hyperbolicHelicoid.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
