<template>
  <div class="bell-strike w-full h-full bg-blue-grad-1"></div>
</template>

<script lang="ts">
import BellStrike from "@/scenes/bellStrike";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "BellStrike",
  setup() {
    const start = () => {
      const bellStrike = new BellStrike(".bell-strike", true);
      bellStrike.init();
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

<style lang="scss" scoped></style>s
