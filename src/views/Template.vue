<template>
  <div class="template w-full h-full bg-blue-grad-1"></div>
</template>

<script lang="ts">
import Template from "@/scenes/template";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Base",
  setup() {
    const start = () => {
      const template = new Template(".template", true);
      template.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
