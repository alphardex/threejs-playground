<template>
  <div class="fixed z-0 wave-cloth w-full h-full animated-bg-grad"></div>
  <div class="relative w-screen h-screen flex-center">
    <form class="relative -top-16 card w-72 p-6 bg-transparent">
      <div class="space-y-4">
        <div class="flex-center">
          <img
            src="../assets/wave-cloth/logo.jpg"
            alt=""
            class="avatar w-18 h-18 block"
          />
        </div>
        <div class="text-center text-white text-lg">用户名</div>
        <div class="flex items-center space-x-2">
          <input
            type="password"
            class="form-control rounded-3xl glass-2"
            placeholder="密码"
            id="password"
          />
          <div
            class="btn-enter btn btn-primary btn-circle flex-none w-8 h-8 flex-center bg-black-2 border-0"
          >
            <i class="gg gg-arrow-right text-black-3" style="--ggs:0.9;"></i>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import WaveCloth from "@/scenes/waveCloth";
import { defineComponent, onMounted } from "vue";
import ky from "kyouka";

export default defineComponent({
  name: "WaveCloth",
  setup() {
    const start = () => {
      const waveCloth = new WaveCloth(".wave-cloth", false);
      waveCloth.init();
    };
    const listenEnter = () => {
      const passwordInput = document.querySelector(
        "#password"
      ) as HTMLInputElement;
      const enterBtn = document.querySelector(".btn-enter");
      enterBtn.addEventListener("click", async () => {
        const password = passwordInput.value;
        if (!password) {
          passwordInput.classList.add("shake-horizontal");
          passwordInput.classList.add("pointer-events-none");
          enterBtn.classList.add("pointer-events-none");
          await ky.sleep(800);
          passwordInput.classList.remove("shake-horizontal");
          passwordInput.classList.remove("pointer-events-none");
          enterBtn.classList.remove("pointer-events-none");
        }
      });
    };
    onMounted(() => {
      start();
      listenEnter();
    });
  },
});
</script>

<style lang="scss" scoped>
.btn-enter {
  &:active {
    background: var(--black-color-4) !important;
  }
}
</style>
