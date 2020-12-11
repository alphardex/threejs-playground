<template>
  <div class="home min-h-screen">
    <ul class="flex flex-col">
      <li>
        <router-link :to="{ name: 'Starter' }">Starter</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'Stack' }">Stack</router-link>
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

<style lang="scss" scoped>
</style>
