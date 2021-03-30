<template>
  <div class="sunshine-simulation w-full h-full bg-blue-2"></div>
  <div class="fixed top-4 h-center" v-if="status">
    <span>当前时间：</span>
    <span>{{ status.currentSunPos.time }}</span>
  </div>
</template>

<script lang="ts">
import SunshineSimulation from "@/scenes/sunshineSimulation";
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import ky from "kyouka";

export default defineComponent({
  name: "SunshineSimulation",
  setup() {
    const state = reactive<any>({
      status: null,
    });
    const start = async () => {
      const sunshineSimulation = new SunshineSimulation(
        ".sunshine-simulation",
        true
      );
      sunshineSimulation.init();
      while (sunshineSimulation) {
        state.status = { ...sunshineSimulation.status };
        await ky.sleep(1);
      }
    };
    onMounted(() => {
      start();
    });
    return { ...toRefs(state) };
  },
});
</script>

<style lang="scss" scoped></style>
