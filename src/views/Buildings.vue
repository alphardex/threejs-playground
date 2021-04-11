<template>
  <div class="buildings w-full h-full bg-white"></div>
</template>

<script lang="ts">
import Buildings from "@/scenes/buildings";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Buildings",
  setup() {
    const start = () => {
      const buildings = new Buildings(".buildings", false);
      buildings.init();
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
