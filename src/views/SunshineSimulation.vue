<template>
  <div class="sunshine-simulation w-full h-full bg-blue-2"></div>
  <div class="fixed top-4 h-center" v-if="status">
    <div>
      <span>当前时间：</span>
      <span>{{ currentSunshineInfo.time }}</span>
    </div>
    <div>
      <input
        type="range"
        class="form-control-range"
        :max="status.sunshineInfoTotal.length - 1"
        v-model.number="currentSunshineInfoId"
      />
    </div>
  </div>
</template>

<script lang="ts">
import SunshineSimulation from "@/scenes/sunshineSimulation";
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  watchEffect,
} from "vue";

interface State {
  status: any;
  currentSunshineInfoId: number;
  sunshineSimulation: SunshineSimulation | null;
}

export default defineComponent({
  name: "SunshineSimulation",
  setup() {
    const state = reactive<State>({
      status: null,
      currentSunshineInfoId: 0,
      sunshineSimulation: null,
    });
    const currentSunshineInfo = computed(() => {
      return state.status
        ? state.status.sunshineInfoTotal[state.currentSunshineInfoId]
        : null;
    });
    const moveSunToOnePos = (currentSunshineInfo: any) => {
      if (currentSunshineInfo) {
        const { pos } = currentSunshineInfo;
        state.sunshineSimulation.setSunPosition(pos);
      }
    };
    watchEffect(() => {
      moveSunToOnePos(currentSunshineInfo.value);
    });
    const start = async () => {
      const sunshineSimulation = new SunshineSimulation(
        ".sunshine-simulation",
        true
      );
      sunshineSimulation.init();
      state.sunshineSimulation = sunshineSimulation;
      state.status = { ...sunshineSimulation.status };
    };
    onMounted(() => {
      start();
    });
    return { ...toRefs(state), currentSunshineInfo };
  },
});
</script>

<style lang="scss" scoped></style>
