<template>
  <div class="vue-logo w-full h-full bg-white"></div>
</template>

<script lang="ts">
import VueLogo from "@/scenes/vueLogo";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "VueLogo",
  setup() {
    const start = () => {
      const vueLogo = new VueLogo(".vue-logo", false);
      vueLogo.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
