<template>
  <div class="stack"></div>
</template>

<script lang="ts">
import { Stack } from "@/scenes";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Stack",
  setup() {
    onMounted(() => {
      const stack = new Stack(".stack", true);
      stack.init();
      stack.start();
    });
  },
});
</script>

<style lang="scss" scoped>
.stack {
  width: 100%;
  height: 100%;
  background: var(--blue-grad-1);
}
</style>