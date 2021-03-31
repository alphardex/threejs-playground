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
      console.log(sunshineSimulation);
      state.sunshineSimulation = sunshineSimulation;
    };
    const updateSunPos = () => {
      if (state.sunshineSimulation) {
        const { currentSunshineInfoId } = state;
        state.sunshineSimulation.setSunshineInfoById(currentSunshineInfoId);
        state.sunshineSimulation.setSunPosition();
      }
    };
    watchEffect(() => {
      updateSunPos();
    });
    onMounted(() => {
      start();
    });
    return { ...toRefs(state) };
  },
});
</script>

<style lang="scss" scoped></style>
