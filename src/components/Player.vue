<template>
  <div>
    <div ref="playerDom"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";

const playerDom = ref<HTMLDivElement>();
const playerRef = ref<YT.Player>();

const props = defineProps<{
  videoId: string;
  width: number;
  height: number;
  position?: number;
}>();

onMounted(() => {
  const script = document.createElement("script");
  script.addEventListener("load", () => {
    const attemptPlayerLoad = () => {
      if (typeof YT === "undefined" || !YT.Player) {
        setTimeout(attemptPlayerLoad, 200);
        return;
      }

      if (!playerDom.value) {
        console.error("Root element not found");
        return;
      }

      // Create player
      playerRef.value = new YT.Player(playerDom.value, {
        height: props.height,
        width: props.width,
        videoId: props.videoId,
        events: {
          onReady: () => {
            playerRef.value?.loadVideoById(props.videoId, props.position || 0);
          },
        },
      });
    };

    attemptPlayerLoad();
  });
  script.src = "https://www.youtube.com/iframe_api";
  script.async = true;
  document.body.appendChild(script);

  watch(
    () => props.videoId,
    () => {
      playerRef.value?.loadVideoById(props.videoId, props.position || 0);
    }
  );

  watch(
    () => props.position,
    () => {
      if (props.position !== 0 || !isNaN(props.position)) {
        playerRef.value?.seekTo(props.position || 0, true);
      }
    }
  );

  watch([() => props.height, () => props.width], () => {
    playerRef.value?.setSize(props.width, props.height);
  });
});
</script>
