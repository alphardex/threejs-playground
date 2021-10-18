<template>
  <div class="shoe-config w-screen h-screen bg-black"></div>
  <div v-if="shoeConfig">
    <div class="absolute z-5 top-12 right-12" v-if="selectedShoeComponent">
      <div class="card">
        <div class="flex items-center space-x-4">
          <div>{{ selectedShoeComponent.name }}</div>
          <input type="color" v-model="color" @change="onChangeColor" />
        </div>
      </div>
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
        const hexColor = `#${(obj as any).material.color.getHexString()}`;
        state.color = hexColor;
        state.selectedShoeComponent = obj;
      }
    };
    // 改变颜色时
    const onChangeColor = () => {
      const newColor = state.color;
      const obj = state.selectedShoeComponent as any;
      obj.material.color.set(newColor);
    };
    // 监听点击
    const addClickListener = () => {
      document.addEventListener("click", onClick);
    };
    onMounted(() => {
      start();
      addClickListener();
    });
    return { ...toRefs(state), onChangeColor };
  },
});
</script>

<style lang="scss" scoped></style>
