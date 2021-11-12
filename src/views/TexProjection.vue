<template>
  <div class="tex-projection w-screen h-screen bg-black overflow-hidden"></div>
</template>

<script lang="ts">
import TexProjection from "@/scenes/texProjection";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "TexProjection",
  setup() {
    const start = () => {
      const texProjection = new TexProjection(".tex-projection", false);
      texProjection.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
