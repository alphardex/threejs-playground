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
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import useDialog from "@/hooks/useDialog";
import useWx from "@/hooks/useWx";
import { Info } from "@/types";
import { getInfo } from "@/apis";

interface State {
  info: Info;
}

export default defineComponent({
  name: "Home",
  setup() {
    const dialog = useDialog();
    const wx = useWx();
    const state = reactive<State>({
      info: {},
    });
    onMounted(async () => {
      state.info = await getInfo();
      await wx.wxShare(state.info);
    });
    return { dialog, wx, ...toRefs(state) };
  },
});
</script>

<style lang="scss" scoped>
</style>
