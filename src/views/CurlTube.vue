<template>
  <div class="curl-tube w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import CurlTube from "@/scenes/curlTube";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "CurlTube",
  setup() {
    const start = () => {
      const curlTube = new CurlTube(".curl-tube", false);
      curlTube.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
