<template>
  <div class="wavin-flag w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import WavinFlag from "@/scenes/wavinFlag";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "WavinFlag",
  setup() {
    const start = () => {
      const wavinFlag = new WavinFlag(".wavin-flag", false);
      wavinFlag.init();
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
