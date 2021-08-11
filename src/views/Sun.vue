<template>
  <div class="sun w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import Sun from "@/scenes/sun";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Sun",
  setup() {
    const start = () => {
      const sun = new Sun(".sun", false);
      sun.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
