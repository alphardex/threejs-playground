<template>
  <div class="distort-image w-full h-full bg-black"></div>
</template>

<script lang="ts">
import DistortImage from "@/scenes/distortImage";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "DistortImage",
  setup() {
    const start = () => {
      const distortImage = new DistortImage(".distort-image", true);
      distortImage.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
