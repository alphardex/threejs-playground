<template>
  <div class="kinetic-text w-full h-full bg-black"></div>
</template>

<script lang="ts">
import KineticText from "@/scenes/kineticText";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "KineticText",
  setup() {
    const start = () => {
      const kineticText = new KineticText(".kinetic-text", true);
      kineticText.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
