<template>
  <div class="starter"></div>
</template>

<script lang="ts">
import { Starter } from "@/scenes";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Starter",
  setup() {
    onMounted(() => {
      const starter = new Starter(".starter");
      starter.init();
    });
  },
});
</script>

<style lang="scss" scoped>
.starter {
  width: 100%;
  height: 100%;
}
</style>