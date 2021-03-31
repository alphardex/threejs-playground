<template>
  <div class="sunshine-simulation w-full h-full bg-blue-2"></div>
  <div class="fixed top-4 h-center space-y-2" v-if="sunshineSimulation">
    <div>
      <span>当前时间：</span>
      <span v-if="sunshineSimulation.currentSunshineInfo">
        {{ sunshineSimulation.currentSunshineInfo.time }}
      </span>
    </div>
    <div class="flex items-center space-x-4">
      <div>{{ sunshineSimulation.status.sunriseTime }}</div>
      <input
        type="range"
        class="form-control-range"
        :max="sunshineSimulation.sunshineInfoTotal.length - 1"
        v-model.number="currentSunshineInfoId"
      />
      <div>{{ sunshineSimulation.status.sunsetTime }}</div>
    </div>
    <div>
      <input type="date" class="form-control" v-model="currentDate" />
    </div>
    <div class="form-check">
      <input type="checkbox" class="form-switch" id="pause" v-model="pause" />
      <label for="pause" class="form-check-label">暂停</label>
    </div>
  </div>
</template>

<script lang="ts">
import SunshineSimulation from "@/scenes/sunshineSimulation";
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  watchEffect,
  computed,
} from "vue";
import ky from "kyouka";

interface State {
  sunshineSimulation: SunshineSimulation | null;
  currentSunshineInfoId: number;
  currentDate: string;
  pause: boolean;
}

export default defineComponent({
  name: "SunshineSimulation",
  setup() {
    const state = reactive<State>({
      sunshineSimulation: null,
      currentSunshineInfoId: 0,
      currentDate: "2021-03-31",
      pause: false,
    });
    const sunshineInfoTotalLength = computed(() => {
      return state.sunshineSimulation
        ? state.sunshineSimulation.sunshineInfoTotal.length - 1
        : 0;
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
      }
    };
    const updateDate = () => {
      if (state.sunshineSimulation) {
        const { currentDate } = state;
        state.sunshineSimulation.params.date = new Date(currentDate);
        state.sunshineSimulation.getAllSunshineData();
      }
    };
    const moveSun = async () => {
      const { sunshineSimulation } = state;
      const { params } = sunshineSimulation;
      const { freq, timeScale } = params;
      while (state.currentSunshineInfoId <= sunshineInfoTotalLength.value + 1) {
        if (!state.pause) {
          state.currentSunshineInfoId += 1;
        }
        if (state.currentSunshineInfoId === sunshineInfoTotalLength.value + 1) {
          state.currentSunshineInfoId = 0;
        }
        await ky.sleep(freq * timeScale);
      }
    };
    watchEffect(() => {
      updateSunPos();
      updateDate();
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
