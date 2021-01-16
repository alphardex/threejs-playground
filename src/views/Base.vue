<template>
  <div class="base w-full h-full bg-blue-grad-1"></div>
</template>

<script lang="ts">
import { Base } from "@/scenes/base";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Base",
  setup() {
    const start = () => {
      const base = new Base(".base", true);
      base.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
