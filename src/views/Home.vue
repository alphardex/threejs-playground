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
      <li>
        <router-link :to="{ name: 'ParticleExplode' }"
          >ParticleExplode</router-link
        >
      </li>
      <li>
        <router-link :to="{ name: 'GridIcosahedron' }"
          >GridIcosahedron</router-link
        >
      </li>
      <li>
        <router-link :to="{ name: 'Sun' }">Sun</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'SunshineSimulation' }">
          SunshineSimulation
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'RayMarchingBall' }">
          RayMarchingBall
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'HyperbolicHelicoid' }">
          HyperbolicHelicoid
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'RayTracing' }">
          RayTracing
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'SpikyBlob' }">
          SpikyBlob
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'ParticleShape' }">
          ParticleShape
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'FloatBubbles' }">
          FloatBubbles
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'NoiseMaterial' }">
          NoiseMaterial
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'NoiseWave' }">
          NoiseWave
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'TwistedShape' }">TwistedShape</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'CurlTube' }">
          CurlTube
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'ThousandFollow' }">
          ThousandFollow
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'LiquidCrystal' }">
          LiquidCrystal
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'VueLogo' }">
          VueLogo
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'CylinderOrbitText' }">
          CylinderOrbitText
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'FBOParticles' }">
          FBOParticles
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'LeanGallery' }">
          LeanGallery
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'CloudySky' }">
          CloudySky
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'SimpleFBM' }">
          SimpleFBM
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'RayMarchingPlayground' }">
          RayMarchingPlayground
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'RayMarchingFire' }">
          RayMarchingFire
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'BouncyBalloon' }">
          BouncyBalloon
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'NakedEye' }">
          NakedEye
        </router-link>
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
