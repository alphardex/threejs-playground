<template>
  <div
    class="
      nav-menu
      fixed
      z-2
      w-full
      max-w-full
      flex
      items-center
      text-white
      bg-black-transparent-1
    "
    v-if="navItems && navItems.length"
  >
    <div
      class="nav-menu-item flex items-center justify-center cursor-pointer"
      v-for="(item, i) in navItems"
      :key="i"
      @click="emitNavigate(item.img)"
      :class="{ active: sceneId === item.img }"
    >
      <div
        class="
          nav-menu-item-wrapper
          relative
          border-2 border-solid border-white
        "
      >
        <img
          class="nav-menu-item-img"
          :src="require(`../assets/panorama/thumbs/${item.img}.jpg`)"
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
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "NavMenu",
  emits: ["navigate"],
  props: {
    navItems: Array,
  },
  setup(props, { emit }) {
    const route = useRoute();
    const sceneId = computed(() => route.query.scene || "ruhu");
    const emitNavigate = (scene: string) => {
      emit("navigate", scene);
    };
    return {
      emitNavigate,
      sceneId,
    };
  },
});
</script>
