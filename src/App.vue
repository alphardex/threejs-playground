<template>
  <router-view />
</template>

<script lang="ts">
import "@alphardex/aqua.css/dist/aqua.min.css";
import "css.gg/icons/scss/play-button-o.scss";
import "css.gg/icons/scss/play-pause-o.scss";
import "pannellum/build/pannellum.css";
import { defineComponent } from "vue";

export default defineComponent({});
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
  --black-color-transparent-1: #{transparentize(black, 0.7)};
  --black-color-transparent-2: #{transparentize(black, 0.5)};
  --orange-color-1: #f6b64c;
  --blue-color-1: #2c3e50;
  --blue-color-2: #91a2aa;
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

.bg-blue-1 {
  background: var(--blue-color-1);
}

.bg-blue-2 {
  background: var(--blue-color-2);
}

// common

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

.w-240 {
  width: 60rem;
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
</style>
