<template>
  <div class="backdrop flex-center" v-if="!status.loadComplete">
    <div class="flex flex-col items-center space-y-4">
      <div class="loader"></div>
      <div class="text-white text-sm">资源加载中</div>
    </div>
  </div>
  <div
    class="absolute z-1 bottom-6 h-center font-bold transition-opacity duration-300"
    :class="{ 'opacity-0': !status.showTip }"
  >
    点击木棒即可撞钟
  </div>
  <div class="bell-strike w-full h-full bg-blue-grad-1"></div>
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
      },
    });
    const start = async () => {
      const bellStrike = new BellStrike(".bell-strike", false);
      bellStrike.init();
      while (!state.status.showTip) {
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

<style lang="scss" scoped></style>s
