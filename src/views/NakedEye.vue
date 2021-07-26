<template>
  <div class="naked-eye w-full h-full bg-black"></div>
</template>

<script lang="ts">
import NakedEye from "@/scenes/nakedEye";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "NakedEye",
  setup() {
    const start = () => {
      const nakedEye = new NakedEye(".naked-eye", false);
      nakedEye.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
