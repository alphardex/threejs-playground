<template>
  <div class="cylinder-orbit-text w-screen h-screen bg-blue-1"></div>
</template>

<script lang="ts">
import CylinderOrbitText from "@/scenes/cylinderOrbitText";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "CylinderOrbitText",
  setup() {
    const start = () => {
      const cylinderOrbitText = new CylinderOrbitText(
        ".cylinder-orbit-text",
        false
      );
      cylinderOrbitText.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
