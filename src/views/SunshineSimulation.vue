<template>
  <div class="sunshine-simulation w-full h-full bg-blue-2"></div>
  <div class="fixed top-4 h-center" v-if="sunshineSimulation">
    <div>
      <span>当前时间：</span>
      <span>{{ sunshineSimulation.currentSunshineInfo.time }}</span>
    </div>
    <div>
      <input
        type="range"
        class="form-control-range"
        :max="sunshineSimulation.sunshineInfoTotal.length - 1"
        v-model.number="currentSunshineInfoId"
      />
    </div>
  </div>
</template>

<script lang="ts">
import SunshineSimulation from "@/scenes/sunshineSimulation";
import { defineComponent, onMounted, reactive, toRefs, watchEffect } from "vue";
import ky from "kyouka";

interface State {
  sunshineSimulation: SunshineSimulation | null;
  currentSunshineInfoId: number;
}

export default defineComponent({
  name: "SunshineSimulation",
  setup() {
    const state = reactive<State>({
      sunshineSimulation: null,
      currentSunshineInfoId: 0,
    });
    const start = async () => {
      const sunshineSimulation = new SunshineSimulation(
        ".sunshine-simulation",
        true
      );
      sunshineSimulation.init();
      state.sunshineSimulation = sunshineSimulation;
    };
    const updateSunPos = () => {
      if (state.sunshineSimulation) {
        const { currentSunshineInfoId } = state;
        state.sunshineSimulation.currentSunshineInfoId = currentSunshineInfoId;
        state.sunshineSimulation.setSunshineInfoById();
        state.sunshineSimulation.setSunPosition();
        console.log(state.sunshineSimulation);
      }
    };
    const moveSun = async () => {
      const { sunshineSimulation } = state;
      const { sunshineInfoTotal, params } = sunshineSimulation;
      const { freq, timeScale } = params;
      while (state.currentSunshineInfoId < sunshineInfoTotal.length - 1) {
        state.currentSunshineInfoId += 1;
        await ky.sleep(freq * timeScale);
      }
    };
    watchEffect(() => {
      updateSunPos();
    });
    onMounted(() => {
      start();
      moveSun();
    });
    return { ...toRefs(state) };
  },
});
</script>

<style lang="scss" scoped></style>
