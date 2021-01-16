<template>
  <nav-menu :navItems="scenes" @navigate="onNavigate"></nav-menu>
  <div id="panorama"></div>
</template>

<script lang="ts">
import Panorama from "@/scenes/panorama";
import { computed, defineComponent, onMounted, reactive, toRefs } from "vue";
import { panoramaConfig } from "@/consts/panorama";
import NavMenu from "@/components/NavMenu.vue";
import router from "@/router";
import { useRoute } from "vue-router";

interface State {
  panorama: Panorama | null;
}

export default defineComponent({
  name: "Panorama",
  components: {
    NavMenu,
  },
  setup() {
    const route = useRoute();
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
    const sceneId = computed(() => route.query.scene);
    const initPanorama = () => {
      const firstScene = panoramaConfig.data.default.firstScene;
      panoramaConfig.data.default.firstScene =
        ((sceneId.value as unknown) as string) || firstScene;
      const panorama = new Panorama(panoramaConfig);
      state.panorama = panorama;
      panorama.init();
      state.panorama.viewer.on("scenechange", (scene: string) => {
        router.push({ name: "Panorama", query: { scene } });
      });
    };
    const onNavigate = (scene: string) => {
      const { panorama } = state;
      const { viewer, config } = panorama!;
      const targetScene = config.data.scenes[scene];
      const { pitch, yaw, hfov } = targetScene;
      viewer.loadScene(scene, pitch, yaw, hfov);
    };
    onMounted(() => {
      initPanorama();
    });
    return {
      ...toRefs(state),
      scenes,
      sceneId,
      onNavigate,
    };
  },
});
</script>

<style lang="scss" scoped></style>
