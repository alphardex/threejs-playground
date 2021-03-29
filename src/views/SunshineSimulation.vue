<template>
  <div class="sunshine-simulation w-full h-full bg-blue-2"></div>
</template>

<script lang="ts">
import SunshineSimulation from "@/scenes/sunshineSimulation";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "SunshineSimulation",
  setup() {
    const start = () => {
      const sunshineSimulation = new SunshineSimulation(
        ".sunshine-simulation",
        true
      );
      sunshineSimulation.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
