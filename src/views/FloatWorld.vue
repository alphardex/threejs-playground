<template>
  <div class="float-world w-full h-full bg-blue-grad-1"></div>
</template>

<script lang="ts">
import FloatWorld from "@/scenes/floatWorld";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "FloatWorld",
  setup() {
    const start = () => {
      const floatWorld = new FloatWorld(".float-world", false);
      floatWorld.init();
    };
    onMounted(() => {
      start();
    });
    return {
      start,
    };
  },
});
</script>

<style lang="scss" scoped></style>
