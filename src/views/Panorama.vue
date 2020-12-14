<template>
  <nav-menu :navItems="scenes"></nav-menu>
  <div id="panorama"></div>
</template>

<script lang="ts">
import { Panorama } from "@/scenes";
import { computed, defineComponent, onMounted, reactive, toRefs } from "vue";
import { panoramaConfig } from "@/consts/index";
import NavMenu from "@/components/NavMenu.vue";

interface State {
  panorama: Panorama | null;
}

export default defineComponent({
  name: "Panorama",
  components: {
    NavMenu,
  },
  setup() {
    const state = reactive<State>({
      panorama: null,
    });
    const scenes = computed(() =>
      state.panorama
        ? Object.entries(state.panorama.config.data.scenes).map(
            ([key, value]) => ({
              img: key,
              text: (value as any).title,
            })
          )
        : []
    );
    const sceneId = computed(() =>
      state.panorama ? state.panorama.viewer.getScene() : ""
    );
    const initPanorama = () => {
      const panorama = new Panorama(panoramaConfig);
      state.panorama = panorama;
      panorama.init();
    };
    onMounted(() => {
      initPanorama();
    });
    return {
      ...toRefs(state),
      scenes,
      sceneId,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>