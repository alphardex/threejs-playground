<template>
  <nav class="menu fixed hv-center z-5">
    <ul class="menu-list text-center space-y-12 text-9xl opacity-0">
      <li class="menu-list-item"><a href="#">Home</a></li>
      <li class="menu-list-item"><a href="#">Archives</a></li>
      <li class="menu-list-item"><a href="#">About</a></li>
    </ul>
  </nav>
  <div class="stage w-full h-full bg-blue-grad-1"></div>
</template>

<script lang="ts">
import { Menu } from "@/scenes";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "Menu",
  setup() {
    const start = () => {
      const menu = new Menu(".stage", true);
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
</style>