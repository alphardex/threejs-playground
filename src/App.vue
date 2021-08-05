<template>
  <router-view />
</template>

<script lang="ts">
import "@alphardex/aqua.css/dist/aqua.min.css";
import "css.gg/icons/scss/play-button-o.scss";
import "css.gg/icons/scss/play-pause-o.scss";
import "css.gg/icons/scss/arrow-right.scss";
import "pannellum/build/pannellum.css";
import "locomotive-scroll/dist/locomotive-scroll.css";
import { defineComponent } from "vue";
// import VConsole from "vconsole";

export default defineComponent({
  // setup() {
  //   new VConsole();
  // },
});
</script>

<style lang="scss">
@mixin sp-layout {
  @media screen and (max-width: 750px) {
    @content;
  }
}

@mixin pc-layout {
  @media screen and (min-width: 751px) {
    @content;
  }
}

body {
  height: 100vh;
  margin: 0;
  background: white;
}

// colors

:root {
  --blue-grad-1: linear-gradient(
    -225deg,
    #473b7b 0%,
    #3584a7 51%,
    #30d2be 100%
  );
  --grey-grad-1: linear-gradient(
      to bottom,
      #323232 0%,
      #3f3f3f 40%,
      #1c1c1c 150%
    ),
    linear-gradient(
      to top,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(0, 0, 0, 0.25) 200%
    );
  --black-color-transparent-1: #{transparentize(black, 0.7)};
  --black-color-transparent-2: #{transparentize(black, 0.5)};
  --orange-color-1: #f6b64c;
  --blue-color-1: #2c3e50;
  --blue-color-2: #91a2aa;
  --blue-color-3: #4ec6f2;
  --blue-color-4: #130930;
  --black-color-1: #12112a;
  --black-color-2: #aaaaaa;
  --black-color-3: #{transparentize(black, 0.3)};
  --black-color-4: hsla(0, 0%, 75%, 90%);
  --white-color-1: #c7c8c9;
  --white-color-2: #f0f0f0;
  --white-grad-1: linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%);
  --blue-grad-2: linear-gradient(135deg, #548db1 0%, #544d92 100%);
  --blue-grad-3: linear-gradient(
    60deg,
    #3d3393 0%,
    #2b76b9 37%,
    #2cacd1 65%,
    #35eb93 100%
  );
}

// reset

ul,
ol {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

a {
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

* {
  border-width: 0;
}

// utils

.top-58vh {
  top: 58vh;
}

.opacity-0 {
  opacity: 0 !important;
}

.bg-black-transparent-1 {
  background: var(--black-color-transparent-1);
}

.bg-black-transparent-2 {
  background: var(--black-color-transparent-2);
}

.bg-blue-grad-1 {
  background: var(--blue-grad-1);
}

.bg-blue-grad-2 {
  background: var(--blue-grad-2);
}

.bg-blue-grad-3 {
  background: var(--blue-grad-3);
}

.bg-grey-grad-1 {
  background: var(--grey-grad-1);
  background-blend-mode: multiply;
}

.bg-blue-1 {
  background: var(--blue-color-1);
}

.bg-blue-2 {
  background: var(--blue-color-2);
}

.bg-blue-3 {
  background: var(--blue-color-3);
}

.bg-white-1 {
  background: var(--white-color-1);
}

.bg-white-2 {
  background: var(--white-color-2);
}

.bg-black-1 {
  background: var(--black-color-1);
}

.bg-white-grad-1 {
  background: var(--white-grad-1);
}

.bg-blue-4 {
  background: var(--blue-color-4) !important;
}

.bg-black-2 {
  background: var(--black-color-2) !important;
}

.text-black-3 {
  color: var(--black-color-3);
}

.border-0 {
  border-width: 0 !important;
}

.glass-1 {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 20px 20px 40px -6px rgba(0, 0, 0, 0.2);
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-2 {
  --input-placeholder-color: white;

  color: white;
  background: transparent;
  backdrop-filter: blur(5px);
  box-shadow: 4px 4px 60px -6px rgba(0, 0, 0, 0.2);
  border: none;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

// common

.btn {
  cursor: pointer;
}

.form-control {
  --input-padding: 0.375rem;

  font-size: 0.8rem;
}

.tag {
  --tag-color: white;

  &-primary {
    --tag-color: var(--primary-color-lighter);
  }
}

#app {
  width: 100%;
  height: 100%;
}

.pnlm-tooltip {
  span {
    visibility: visible !important;
  }
}

.pnlm-hot-spot-debug-indicator {
  display: none !important;
}

.hotspot-arrow {
  --arrow-width: 4rem;

  width: var(--arrow-width);
  height: var(--arrow-width);
  animation: hotspot-step 1s infinite steps(25);

  &-down {
    background: url("~@/assets/panorama/hotspot/down.png") 0 0 / 100% no-repeat;
  }

  &-up {
    background: url("~@/assets/panorama/hotspot/up.png") 0 0 / 100% no-repeat;
  }

  &-left {
    background: url("~@/assets/panorama/hotspot/left.png") 0 0 / 100% no-repeat;
  }

  &-right {
    background: url("~@/assets/panorama/hotspot/right.png") 0 0 / 100% no-repeat;
  }

  &-right-2 {
    background: url("~@/assets/panorama/hotspot/right-2.png") 0 0 / 100%
      no-repeat;
  }

  &-point {
    background: url("~@/assets/panorama/hotspot/point.png") 0 0 / 100% no-repeat;
  }
}

.nav-menu {
  &-item {
    &.active {
      .nav-menu-item-wrapper {
        border-color: var(--orange-color-1);
      }
    }
  }
}

@include sp-layout {
  .nav-menu {
    bottom: 18vw;
    overflow-x: scroll;

    &-item {
      padding: 1.5vw;
      font-size: 3.4vw;

      &-img {
        width: 16vw;
      }
    }
  }
}

@include pc-layout {
  .nav-menu {
    bottom: 5rem;
    justify-content: center;

    &-item {
      padding: 0.4rem;
      font-size: 0.8rem;

      &-img {
        width: 5rem;
      }
    }
  }
}

// utils

.w-180 {
  width: 45rem;
}

.w-240 {
  width: 60rem;
}

.h-90 {
  height: 22.5rem;
}

.h-120 {
  height: 30rem;
}

// animations

.shadow-in {
  animation: shadow-in 1s linear;
}

@keyframes shadow-in {
  from {
    text-shadow: 0 0 1rem white, 2rem -2rem 1rem white, 2rem 2rem 1rem white,
      -2rem 2rem 1rem white, -2rem -2rem 1rem white;
    opacity: 0;
  }

  to {
    text-shadow: 0 0 0 white;
    opacity: 1;
  }
}

.fade-in {
  animation: fade-in 1s;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes hotspot-step {
  to {
    background-position: 0 -1600px;
  }
}

.shake-horizontal {
  animation: shake-horizontal 0.8s cubic-bezier(0.455, 0.03, 0.515, 0.955) both;
}

@keyframes shake-horizontal {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70% {
    transform: translateX(-10px);
  }
  20%,
  40%,
  60% {
    transform: translateX(10px);
  }
  80% {
    transform: translateX(8px);
  }
  90% {
    transform: translateX(-8px);
  }
}
</style>
