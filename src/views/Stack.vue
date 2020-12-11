<template>
  <div class="relative w-full h-full">
    <div
      class="absolute h-center top-6 z-1 text-2xl text-white shadow-in transition-all duration-300"
      :class="{ 'opacity-0': stack.gamestart.value }"
      v-if="stack"
    >
      STACK
    </div>
    <div
      class="absolute h-center top-6 z-1 text-2xl text-white transition-all duration-300"
      v-if="stack && stack.gamestart.value"
    >
      {{ stack.level }}
    </div>
    <div class="stack"></div>
  </div>
</template>

<script lang="ts">
import { Stack } from "@/scenes";
import { defineComponent, onMounted, reactive, toRefs } from "vue";

interface State {
  stack: Stack | null;
}

export default defineComponent({
  name: "Stack",
  setup() {
    const state = reactive<State>({
      stack: null,
    });
    onMounted(async () => {
      const stack = new Stack(".stack", false);
      stack.init();
      state.stack = stack;
    });
    return {
      ...toRefs(state),
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