<template>
  <div class="sunshine-simulation w-full h-full bg-blue-2"></div>
  <div class="fixed top-4 h-center space-y-2" v-if="sunshineSimulation">
    <div class="flex items-center space-x-4">
      <div>{{ sunshineSimulation.status.sunriseTime }}</div>
      <input
        type="range"
        class="form-control-range"
        :max="sunshineSimulation.sunshineInfoTotal.length - 1"
        v-model.number="currentSunshineInfoId"
      />
      <div>{{ sunshineSimulation.status.sunsetTime }}</div>
      <div class="form-check">
        <input type="checkbox" class="hidden" id="pause" v-model="pause" />
        <label for="pause" class="cursor-pointer">
          <i class="gg gg-play-button-o" v-if="pause"></i>
          <i class="gg gg-play-pause-o" v-else></i>
        </label>
      </div>
      <span
        class="w-10 text-center"
        v-if="sunshineSimulation.currentSunshineInfo"
      >
        {{ sunshineSimulation.currentSunshineInfo.time }}
      </span>
    </div>
    <div>
      <input type="date" class="form-control" v-model="currentDate" />
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
import { Lunar } from "lunar-typescript";

interface State {
  sunshineSimulation: SunshineSimulation | null;
  currentSunshineInfoId: number;
  currentDate: string;
  pause: boolean;
  jieQi: any;
}

export default defineComponent({
  name: "SunshineSimulation",
  setup() {
    const state = reactive<State>({
      sunshineSimulation: null,
      currentSunshineInfoId: 0,
      currentDate: "2021-03-31",
      pause: false,
      jieQi: null,
    });
    // 光照信息总数
    const sunshineInfoTotalLength = computed(() => {
      return state.sunshineSimulation
        ? state.sunshineSimulation.sunshineInfoTotal.length - 1
        : 0;
    });
    // 开始模拟
    const start = async () => {
      const sunshineSimulation = new SunshineSimulation(
        ".sunshine-simulation",
        true
      );
      sunshineSimulation.init();
      state.sunshineSimulation = sunshineSimulation;
    };
    // 获取节气
    const getJieQi = (date = new Date()) => {
      const lunar = Lunar.fromDate(date);
      const jieQi = lunar.getJieQiTable();
      state.jieQi = jieQi;
    };
    // 更新太阳位置
    const updateSunPos = () => {
      if (state.sunshineSimulation) {
        const { currentSunshineInfoId } = state;
        state.sunshineSimulation.currentSunshineInfoId = currentSunshineInfoId;
        state.sunshineSimulation.setSunshineInfoById();
        state.sunshineSimulation.setSunPosition();
      }
    };
    // 更新日期
    const updateDate = () => {
      if (state.sunshineSimulation) {
        const { currentDate } = state;
        const date = new Date(currentDate);
        state.sunshineSimulation.params.date = date;
        state.sunshineSimulation.getAllSunshineData();
        getJieQi(date);
      }
    };
    // 移动太阳
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
