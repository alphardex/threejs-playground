<template>
  <div class="starter"></div>
</template>

<script lang="ts">
import { Base } from "@/scenes";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Starter",
  setup() {
    onMounted(() => {
      const starter = new Base(".starter", true);
      starter.init();
    });
  },
});
</script>

<style lang="scss" scoped>
.starter {
  width: 100%;
  height: 100%;
  background: var(--blue-grad-1);
}
</style>