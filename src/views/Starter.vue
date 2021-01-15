<template>
  <div class="starter w-full h-full bg-blue-grad-1"></div>
</template>

<script lang="ts">
import { Base } from "@/scenes";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Starter",
  setup() {
    const start = () => {
      const starter = new Base(".starter", true);
      starter.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
