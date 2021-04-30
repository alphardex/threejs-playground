<template>
  <div class="squeeshy-blob w-full h-full bg-white"></div>
</template>

<script lang="ts">
import SqueeshyBlob from "@/scenes/squeeshyBlob";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "SqueeshyBlob",
  setup() {
    const start = () => {
      const squeeshyBlob = new SqueeshyBlob(".squeeshy-blob", false);
      squeeshyBlob.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
