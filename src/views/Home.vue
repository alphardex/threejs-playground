<template>
  <div class="home min-h-screen">
    <ul class="flex flex-col">
      <li>
        <router-link :to="{ name: 'Template' }">Template</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'Base' }">Base</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'Stack' }">Stack</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'Panorama' }">Panorama</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'Buildings' }">Buildings</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'Menu' }">Menu</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'BellStrike' }">BellStrike</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'FloatWorld' }">FloatWorld</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'GridWave' }">GridWave</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'WavinFlag' }">WavinFlag</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'TwistedShape' }">TwistedShape</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'TravellingParticles' }"
          >TravellingParticles</router-link
        >
      </li>
      <li>
        <router-link :to="{ name: 'KineticText' }">KineticText</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'LineWave' }">LineWave</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'RayMarching' }">RayMarching</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'DistortImage' }">DistortImage</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'TwistedGallery' }"
          >TwistedGallery</router-link
        >
      </li>
      <li>
        <router-link :to="{ name: 'TwistedColorfulSphere' }"
          >TwistedColorfulSphere</router-link
        >
      </li>
    </ul>
    <teleport to="#dialogs">
      <div
        class="backdrop"
        :class="{ 'pointer-events-none': !dialog.isBackdropClosable.value }"
        v-if="dialog.showBackdrop.value"
        @click="dialog.closeAllDialog"
      ></div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useDialog from "@/hooks/useDialog";

export default defineComponent({
  name: "Home",
  setup() {
    const dialog = useDialog();
    return { dialog };
  },
});
</script>

<style lang="scss" scoped></style>
