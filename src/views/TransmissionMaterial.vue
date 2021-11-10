<template>
  <div
    class="transmission-material w-screen h-screen bg-black-7 overflow-hidden"
  ></div>
</template>

<script lang="ts">
import TransmissionMaterial from "@/scenes/transmissionMaterial";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "TransmissionMaterial",
  setup() {
    const start = () => {
      const transmissionMaterial = new TransmissionMaterial(
        ".transmission-material",
        false
      );
      transmissionMaterial.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
