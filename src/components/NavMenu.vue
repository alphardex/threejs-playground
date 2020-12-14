<template>
  <div
    class="nav-menu fixed z-1 w-full max-w-full flex items-center text-white bg-black-transparent-1"
    v-if="navItems && navItems.length"
  >
    <div
      class="nav-menu-item flex items-center justify-center"
      v-for="(item, i) in navItems"
      :key="i"
    >
      <div
        class="nav-menu-item-wrapper relative border-2 border-solid border-white"
      >
        <img
          class="nav-menu-item-img"
          :src="require(`../assets/thumbs/${item.img}.jpg`)"
          alt=""
        />
        <div
          class="absolute bottom-0 w-full text-center bg-black-transparent-2"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NavMenu",
  props: {
    navItems: Array,
  },
});
</script>
