<template>
  <nav class="nav">
    <router-link
      :to="item.to"
      class="nav-item"
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
    navItems: Array
  }
});
</script>
