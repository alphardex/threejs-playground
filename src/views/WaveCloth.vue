<template>
  <div class="fixed z-0 wave-cloth w-full h-full animated-bg-grad"></div>
  <div class="relative w-screen h-screen flex-center">
    <form class="relative -top-16 card w-70 p-6 bg-transparent">
      <div class="space-y-4">
        <div class="flex-center">
          <!-- logo -->
          <img
            src="../assets/wave-cloth/logo.jpg"
            alt=""
            class="avatar w-18 h-18 block border-2 border-solid border-white"
          />
        </div>
        <div
          class="text-center text-white text-lg text-glow whitespace-no-wrap"
        >
          请登录 常熟零距离房产系统
        </div>
        <!-- 用户名 -->
        <input
          type="text"
          class="form-control rounded-md glass-2"
          placeholder="用户名"
          id="username"
        />
        <div class="relative flex items-center space-x-2">
          <!-- 密码 -->
          <input
            type="password"
            class="form-control rounded-md glass-2"
            placeholder="密码"
            id="password"
          />
          <!-- 登录 -->
          <div
            class="absolute v-center -right-8 btn btn-primary btn-circle flex-none w-6 h-6 flex-center glass-2 activate bg-black-5 mask-arrow"
            id="btn-enter"
          ></div>
        </div>
        <div class="flex items-center space-x-2">
          <!-- 验证码 -->
          <input
            type="text"
            class="flex-1 form-control rounded-md glass-2"
            placeholder="验证码"
            id="captcha"
          />
          <img
            src="../assets/wave-cloth/captcha.png"
            alt=""
            class="w-15 rounded-md"
          />
        </div>
      </div>
    </form>
    <!-- 日期 -->
    <div class="absolute top-4 right-0">
      <div
        class="pl-16 pr-4 py-2 bg-black-6 shadow-1 rounded-md rounded-r-none"
      >
        <div class="flex space-x-4">
          <div class="text-white text-glow flex items-center space-x-2">
            <span id="date-str">2021/1/1 00:00</span>
            <i class="gg gg-time inline-flex bg-glow" style="--ggs: 0.66;"></i>
          </div>
          <div
            class="btn btn-primary px-2 py-1 text-xs glass-2 activate bg-black-5"
          >
            切换界面
          </div>
        </div>
      </div>
    </div>
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
    const shakeEl = async (input: HTMLInputElement, btn: Element) => {
      input.classList.add("shake-horizontal");
      input.classList.add("pointer-events-none");
      btn.classList.add("pointer-events-none");
      await ky.sleep(800);
      input.classList.remove("shake-horizontal");
      input.classList.remove("pointer-events-none");
      btn.classList.remove("pointer-events-none");
    };
    const listenEnter = () => {
      const usernameInput = document.querySelector(
        "#username"
      ) as HTMLInputElement;
      const passwordInput = document.querySelector(
        "#password"
      ) as HTMLInputElement;
      const enterBtn = document.querySelector("#btn-enter");
      enterBtn.addEventListener("click", async () => {
        const username = usernameInput.value;
        if (!username) {
          await shakeEl(usernameInput, enterBtn);
          return;
        }
        const password = passwordInput.value;
        if (!password) {
          await shakeEl(passwordInput, enterBtn);
          return;
        }
      });
    };
    const getDateStr = () => {
      const dateStrEl = document.querySelector("#date-str");
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hour = ky.padNumber(now.getHours(), 2);
      const minute = ky.padNumber(now.getMinutes(), 2);
      const year = now.getFullYear();
      const dateStr = `${year}/${month}/${day} ${hour}:${minute}`;
      dateStrEl.textContent = dateStr;
    };
    const getDateByInterval = () => {
      setInterval(() => {
        getDateStr();
      }, 1000 * 60);
    };
    onMounted(() => {
      start();
      listenEnter();
      getDateStr();
      getDateByInterval();
    });
  },
});
</script>

<style lang="scss" scoped></style>
