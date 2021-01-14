<template>
  <div class="menu"></div>
</template>

<script lang="ts">
import { Menu } from "@/scenes";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Menu",
  setup() {
    const start = () => {
      const menu = new Menu(".menu", true);
      menu.init();
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
.menu {
  width: 100%;
  height: 100%;
  background: var(--blue-grad-1);
}
</style>