<template>
  <div class="relative w-screen h-screen">
    <div
      class="absolute h-center top-6 z-1 text-2xl text-white shadow-in transition-all duration-300"
      :class="{ 'opacity-0': status.gamestart }"
      v-if="status"
    >
      STACK
    </div>
    <div
      class="absolute h-center top-15 z-1 text text-white fade-in transition-all duration-300"
      style="animation-delay: 0.6s"
      :class="{ 'opacity-0': status.gamestart }"
      v-if="status"
    >
      Tap to start
    </div>
    <div
      class="absolute h-center top-6 z-1 text-2xl text-white transition-all duration-300"
      v-if="status && status.gamestart"
    >
      {{ status.level - 1 }}
    </div>
    <div class="stack"></div>
  </div>
</template>

<script lang="ts">
import { Stack } from "@/scenes";
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import ky from "kyouka";

interface State {
  stack: Stack | null;
  status: Record<string, any> | null;
}

export default defineComponent({
  name: "Stack",
  setup() {
    const state = reactive<State>({
      stack: null,
      status: null,
    });
    onMounted(async () => {
      const stack = new Stack(".stack", false);
      stack.init();
      state.stack = stack;
      state.status = stack.status;
      while (!state.status.gameover) {
        state.status = state!.stack.status;
        await ky.sleep(100);
      }
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