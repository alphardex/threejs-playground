<template>
  <div class="twisted-colorful-sphere w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import TwistedColorfulSphere from "@/scenes/twistedColorfulSphere";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Base",
  setup() {
    const start = () => {
      const twistedColorfulSphere = new TwistedColorfulSphere(
        ".twisted-colorful-sphere",
        false
      );
      twistedColorfulSphere.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
