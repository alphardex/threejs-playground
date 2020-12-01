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
      const stack = new Stack(".stack");
      stack.init();
    });
  },
});
</script>

<style lang="scss" scoped>
.stack {
  width: 100%;
  height: 100%;
}
</style>