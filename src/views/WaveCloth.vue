<template>
  <div class="fixed z-0 wave-cloth w-full h-full bg-blue-grad-3"></div>
  <div class="relative w-screen h-screen flex-center">
    <form class="card w-72 glass-1 p-6">
      <div class="space-y-4">
        <div class="flex-center">
          <img
            src="../assets/wave-cloth/logo.jpg"
            alt=""
            class="avatar w-24 h-24 block -mt-18"
          />
        </div>
        <input
          type="text"
          class="form-control rounded-3xl glass-2"
          placeholder="用户名"
        />
        <input
          type="password"
          class="form-control rounded-3xl glass-2"
          placeholder="密码"
        />
        <div class="btn btn-primary btn-round text-center border-0 bg-blue-4">
          登录
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import WaveCloth from "@/scenes/waveCloth";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "WaveCloth",
  setup() {
    const start = () => {
      const waveCloth = new WaveCloth(".wave-cloth", false);
      waveCloth.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
