<template>
  <div class="backdrop flex-center" v-show="!status.loadComplete">
    <div class="flex flex-col items-center space-y-4">
      <div class="loader"></div>
      <div class="text-white text-sm">资源加载中</div>
    </div>
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
      },
    });
    const start = async () => {
      const bellStrike = new BellStrike(".bell-strike", false);
      bellStrike.init();
      while (!bellStrike.status.loadComplete) {
        state.status = bellStrike.status;
        await ky.sleep(100);
        if (bellStrike.status.loadComplete) {
          state.status = bellStrike.status;
          break;
        }
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
