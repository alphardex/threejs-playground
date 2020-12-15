<template>
  <router-view />
</template>

<script lang="ts">
import "@alphardex/aqua.css/dist/aqua.sp.min.css";
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
}

// reset

a {
  -webkit-tap-highlight-color: transparent;
}

* {
  border-width: 0;
}

input,
select {
  outline: none !important;
  appearance: none !important;
}

// utils

.opacity-0 {
  opacity: 0 !important;
}

.bg-black-transparent-1 {
  background: var(--black-color-transparent-1);
}

.bg-black-transparent-2 {
  background: var(--black-color-transparent-2);
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

.hotspot-arrow {
  --arrow-width: 4rem;

  width: var(--arrow-width);
  height: var(--arrow-width);

  &::before {
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    background: var(--arrow-bg) 0 0 / 100% no-repeat;
    animation: hotspot-step 1s infinite steps(25);
  }

  &-down {
    --arrow-bg: url("~@/assets/hotspot/down.png");
  }

  &-up {
    --arrow-bg: url("~@/assets/hotspot/up.png");
  }

  &-left {
    --arrow-bg: url("~@/assets/hotspot/left.png");
  }

  &-right {
    --arrow-bg: url("~@/assets/hotspot/right.png");
  }

  &-right-2 {
    --arrow-bg: url("~@/assets/hotspot/right-2.png");
  }

  &-point {
    --arrow-bg: url("~@/assets/hotspot/point.png");
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

      &-img {
        width: 5rem;
      }
    }
  }
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
