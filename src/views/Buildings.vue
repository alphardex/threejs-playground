<template>
  <div class="buildings"></div>
</template>

<script lang="ts">
import { Buildings } from "@/scenes";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Buildings",
  setup() {
    const start = () => {
      const buildings = new Buildings(".buildings", true);
      buildings.init();
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

<style lang="scss" scoped>
.buildings {
  width: 100%;
  height: 100%;
  background: white;
}
</style>