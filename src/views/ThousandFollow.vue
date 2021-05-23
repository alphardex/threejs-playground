<template>
  <div class="thousand-follow w-full h-full bg-black"></div>
</template>

<script lang="ts">
import ThousandFollow from "@/scenes/thousandFollow";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "ThousandFollow",
  setup() {
    const start = () => {
      const thousandFollow = new ThousandFollow(".thousand-follow", false);
      thousandFollow.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
