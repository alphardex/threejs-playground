<template>
  <div class="time-travel w-screen h-screen bg-black"></div>
</template>

<script lang="ts">
import TimeTravel from "@/scenes/timeTravel";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "TimeTravel",
  setup() {
    const start = () => {
      const timeTravel = new TimeTravel(".time-travel", false);
      timeTravel.init();
    };
    onMounted(() => {
      start();
    });
  },
});
</script>

<style lang="scss" scoped></style>
