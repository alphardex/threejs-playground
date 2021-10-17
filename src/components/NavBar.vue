<template>
  <nav class="fixed z-5 bottom-0 flex w-full">
    <router-link
      :to="item.to"
      class="flex-1 p-3 text-center"
      v-for="(item, i) in navItems"
      :key="i"
      >{{ item.text }}</router-link
    >
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NavBar",
  props: {
    navItems: Array,
  },
});
</script>
