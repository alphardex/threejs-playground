<template>
  <div class="template w-screen h-screen bg-black overflow-hidden"></div>
</template>

<script lang="ts">
import Template from "@/scenes/template";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Template",
  setup() {
    const start = () => {
      const template = new Template(".template", false);
      template.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
