<template>
  <div class="relative w-screen h-screen">
    <div
      class="backdrop z-5 flex-center bg-transparent pointer-events-none duration-600"
      :class="{ 'opacity-0': status.loadComplete }"
    >
      <div class="flex flex-col items-center space-y-4">
        <img src="../assets/bell-strike/loading.gif" class="w-75" alt="" />
      </div>
    </div>
    <img
      src="../assets/bell-strike/hint.png"
      class="absolute z-1 right-0 top-58vh w-30 transition-opacity duration-300 pointer-events-none blink-1"
      v-if="status.showTip && !status.startStrike"
    />
    <div class="bell-strike w-full h-full bg-temple"></div>
  </div>
</template>

<script lang="ts">
import BellStrike from "@/scenes/bellStrike";
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import ky from "kyouka";

interface State {
  status: Record<string, any>;
}

export default defineComponent({
  name: "BellStrike",
  setup() {
    const state = reactive<State>({
      status: {
        loadComplete: false,
        showTip: false,
        startWish: false,
      },
    });
    const start = async () => {
      const bellStrike = new BellStrike(".bell-strike", true);
      bellStrike.init();
      while (!state.status.startWish) {
        state.status = bellStrike.status;
        await ky.sleep(100);
      }
    };
    onMounted(async () => {
      await start();
    });
    return {
      ...toRefs(state),
      start,
    };
  },
});
</script>

<style lang="scss" scoped>
.bg-temple {
  background: url("../assets/bell-strike/bg.png") 0 0 / 100% no-repeat;
}
</style>
