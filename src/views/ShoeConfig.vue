<template>
  <div class="shoe-config w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import ShoeConfig from "@/scenes/shoeConfig";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "ShoeConfig",
  setup() {
    const start = () => {
      const shoeConfig = new ShoeConfig(".shoe-config", false);
      shoeConfig.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
