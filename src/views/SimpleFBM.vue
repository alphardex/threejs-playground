<template>
  <div class="simple-fbm w-full h-full bg-black"></div>
</template>

<script lang="ts">
import SimpleFBM from "@/scenes/simpleFBM";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "SimpleFBM",
  setup() {
    const start = () => {
      const simpleFBM = new SimpleFBM(".simple-fbm", false);
      simpleFBM.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
