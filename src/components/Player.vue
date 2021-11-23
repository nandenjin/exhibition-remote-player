<template>
  <div v-show="videoId">
    <div ref="playerDom"></div>
  </div>
  <div v-if="!videoId">No video</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from "vue";

const playerDom = ref<HTMLDivElement>();
const playerRef = ref<YT.Player>();

const props = defineProps<{
  videoId: string;
  width: number;
  height: number;
  position?: number;
}>();

const emit = defineEmits<{
  (e: "timeUpdate", time: number): void;
}>();

const timeCheckTimer = ref<number>();

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
        playerVars: { autoplay: 1 },
        events: {
          onReady: () => {
            playerRef.value?.loadVideoById(props.videoId, props.position || 0);
            playerRef.value?.playVideo();
            timeCheckTimer.value = setInterval(() => {
              const currentTime = playerRef.value?.getCurrentTime();
              if (currentTime !== undefined) {
                emit("timeUpdate", currentTime);
              }
            }, 500) as unknown as number;
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
      playerRef.value?.loadVideoById?.(props.videoId, props.position || 0);
    }
  );

  watch(
    () => props.position,
    () => {
      console.log(props.position);
      if (props.position !== 0 || !isNaN(props.position)) {
        playerRef.value?.seekTo?.(props.position || 0, true);
        playerRef.value?.playVideo?.();
      }
    }
  );

  watch([() => props.height, () => props.width], () => {
    playerRef.value?.setSize?.(props.width, props.height);
  });
});

onUnmounted(() => {
  clearInterval(timeCheckTimer.value);
  playerRef.value?.destroy();
});
</script>
