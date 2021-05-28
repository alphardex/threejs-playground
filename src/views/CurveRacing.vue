<template>
  <div class="curve-racing w-full h-full bg-blue-3"></div>
</template>

<script lang="ts">
import CurveRacing from "@/scenes/curveRacing";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "CurveRacing",
  setup() {
    const start = () => {
      const curveRacing = new CurveRacing(".curve-racing", false);
      curveRacing.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
