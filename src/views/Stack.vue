<template>
  <div class="relative w-screen h-screen">
    <div
      class="title absolute h-center z-1 text-white shadow-in transition-all duration-300 whitespace-no-wrap"
      :class="{ 'opacity-0': status.gamestart }"
      v-if="status"
    >
      STACK
    </div>
    <div
      class="start absolute h-center z-1 text-white fade-in transition-all duration-300 cursor-pointer whitespace-no-wrap"
      style="animation-delay: 0.6s"
      :class="{ 'opacity-0': status.gamestart }"
      v-if="status"
    >
      Tap to start
    </div>
    <div
      class="retry absolute h-center z-1 text-white fade-in transition-all duration-300 cursor-pointer whitespace-no-wrap"
      v-if="status && status.gameover"
      @click="restartGame"
    >
      Try Again
    </div>
    <div
      class="score absolute h-center z-1 text-white transition-all duration-300 whitespace-no-wrap"
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
    const startGame = async () => {
      const stack = new Stack(".stack", false);
      stack.init();
      state.stack = stack;
      state.status = stack.status;
      while (!state.status.gameover) {
        state.status = state!.stack.status;
        await ky.sleep(100);
      }
    };
    const restartGame = async () => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.remove();
      }
      state.stack = null;
      state.status = null;
      await startGame();
    };
    onMounted(async () => {
      await startGame();
    });
    return {
      ...toRefs(state),
      restartGame,
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

.title,
.score {
  font-size: 70px;
  top: 6vh;
}

.start,
.retry {
  font-size: 32px;
  top: 20vh;
}
</style>
