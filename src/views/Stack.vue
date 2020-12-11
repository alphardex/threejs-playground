<template>
  <div class="relative w-full h-full" @click="closeTitle">
    <div
      class="absolute h-center top-6 z-1 text-2xl text-white shadow-in transition-all duration-300"
      :class="{ 'opacity-0': hideTitle }"
    >
      STACK
    </div>
    <div class="stack"></div>
  </div>
</template>

<script lang="ts">
import { Stack } from "@/scenes";
import { defineComponent, onMounted, reactive, toRefs } from "vue";

interface State {
  stack: Stack | null;
  hideTitle: boolean;
}

export default defineComponent({
  name: "Stack",
  setup() {
    const state = reactive<State>({
      stack: null,
      hideTitle: false,
    });
    const closeTitle = () => {
      state.hideTitle = true;
    };
    onMounted(() => {
      const stack = new Stack(".stack", false);
      stack.init();
      state.stack = stack;
    });
    return {
      ...toRefs(state),
      closeTitle,
    };
  },
});
</script>

<style lang="scss" scoped>
.stack {
  position: absolute;
  width: 100%;
  height: 100%;
  background: var(--blue-grad-1);
}
</style>