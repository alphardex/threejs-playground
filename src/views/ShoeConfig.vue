<template>
  <div class="shoe-config w-screen h-screen bg-black"></div>
  <div v-if="shoeConfig">
    <div class="absolute z-5 hv-center" v-show="selectedShoeComponent">
      <input type="color" v-model="color" />
    </div>
  </div>
</template>

<script lang="ts">
import ShoeConfig from "@/scenes/shoeConfig";
import { defineComponent, onMounted, reactive, toRefs } from "vue";

interface State {
  shoeConfig: ShoeConfig;
  color: string;
  selectedShoeComponent: THREE.Object3D;
}

export default defineComponent({
  name: "ShoeConfig",
  setup() {
    const state = reactive<State>({
      shoeConfig: null,
      color: "",
      selectedShoeComponent: null,
    });
    // 开始
    const start = () => {
      const shoeConfig = new ShoeConfig(".shoe-config", false);
      shoeConfig.init();
      state.shoeConfig = shoeConfig;
    };
    // 点击时
    const onClick = () => {
      const obj = state.shoeConfig.onSelectShoeComponent();
      if (obj) {
        state.selectedShoeComponent = obj;
      }
    };
    // 监听点击
    const addClickListener = () => {
      document.addEventListener("click", onClick);
    };
    onMounted(() => {
      start();
      addClickListener();
    });
    return { ...toRefs(state) };
  },
});
</script>

<style lang="scss" scoped></style>
