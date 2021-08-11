<template>
  <div class="liquid-crystal w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import LiquidCrystal from "@/scenes/liquidCrystal";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "LiquidCrystal",
  setup() {
    const start = () => {
      const liquidCrystal = new LiquidCrystal(".liquid-crystal", false);
      liquidCrystal.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
