<template>
  <div class="cloudy-sky w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import CloudySky from "@/scenes/cloudySky";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "CloudySky",
  setup() {
    const start = () => {
      const cloudySky = new CloudySky(".cloudy-sky", false);
      cloudySky.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
