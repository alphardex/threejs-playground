<template>
  <div class="relative w-screen h-screen">
    <div
      class="status title h-center shadow-in"
      :class="{ 'opacity-0': status.gamestart }"
      v-if="status"
    >
      STACK
    </div>
    <div
      class="status start h-center fade-in pointer-events-none"
      :class="{ 'opacity-0': status.gamestart }"
      v-if="status && !status.gameover && !status.gamestart"
    >
      Tap to start
    </div>
    <div
      class="status retry h-center fade-in cursor-pointer"
      v-if="status && status.gameover"
      @click="restartGame"
    >
      Try Again
    </div>
    <div class="status score h-center" v-if="status && status.gamestart">
      {{ status.level - 1 }}
    </div>
    <div class="status high-score" v-if="highScore">
      {{ highScore }}
    </div>
    <div class="stack absolute w-full h-full bg-blue-grad-1"></div>
  </div>
</template>

<script lang="ts">
import Stack from "@/scenes/stack";
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import ky from "kyouka";

interface State {
  stack: Stack | null;
  status: Record<string, any> | null;
  highScore: number;
}

export default defineComponent({
  name: "Stack",
  setup() {
    const state = reactive<State>({
      stack: null,
      status: null,
      highScore: 0,
    });
    const startGame = async () => {
      const stack = new Stack(".stack", false);
      stack.init();
      state.stack = stack;
      state.status = stack.status;
      state.highScore = Number(localStorage.getItem("high-score"));
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
.status {
  position: absolute;
  z-index: 1;
  color: white;
  white-space: nowrap;
  transition: 0.3s;
}

.title,
.score {
  top: 6vh;
  font-size: 70px;
}

.start,
.retry {
  top: 25vh;
  font-size: 28px;
}

.high-score {
  top: 3vh;
  right: 3vw;
  font-size: 24px;
}
</style>
