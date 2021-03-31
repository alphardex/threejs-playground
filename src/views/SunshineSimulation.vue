<template>
  <div class="sunshine-simulation w-full h-full bg-blue-2"></div>
  <div class="fixed top-4 h-center" v-if="status">
    <div>
      <span>当前时间：</span>
      <span>{{ currentSunPos.time }}</span>
    </div>
    <div>
      <input
        type="range"
        class="form-control-range"
        :max="status.sunPosTotal.length - 1"
        v-model.number="currentPosId"
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
import ky from "kyouka";

interface State {
  status: any;
  currentPosId: number;
  sunshineSimulation: SunshineSimulation | null;
}

export default defineComponent({
  name: "SunshineSimulation",
  setup() {
    const state = reactive<State>({
      status: null,
      currentPosId: 0,
      sunshineSimulation: null,
    });
    const currentSunPos = computed(() => {
      return state.status ? state.status.sunPosTotal[state.currentPosId] : null;
    });
    const moveSunToOnePos = (currentSunPos: any) => {
      if (currentSunPos) {
        const { pos } = currentSunPos;
        state.sunshineSimulation.setSunPosition(pos);
      }
    };
    watchEffect(() => {
      moveSunToOnePos(currentSunPos.value);
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
    return { ...toRefs(state), currentSunPos };
  },
});
</script>

<style lang="scss" scoped></style>
