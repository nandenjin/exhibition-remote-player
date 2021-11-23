<template>
  <Player :videoId="videoId" :width="width" :height="height" />
</template>

<script setup lang="ts">
import { getDatabase, onValue, ref as dbRef } from "firebase/database";
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import Player from "../components/Player.vue";

const route = useRoute();
const namespace = route.params.namespace;
const db = getDatabase();

const error = ref<string>();
const videoId = ref<string>("c21zSdiyW6o");
const position = ref<number>();

const nsRef = dbRef(db, `namespaces/${namespace}`);

// Set trigger from DB
onValue(nsRef, (snapshot) => {
  if (!snapshot.exists()) {
    error.value = "Namespace not found";
    return;
  }

  const { videoId: vid, position: pos }: { videoId: string; position: number } =
    snapshot.val();
  videoId.value = vid;
  position.value = pos;
});

const width = ref<number>(640);
const height = ref<number>(360);

const onResize = () => {
  const tw = window.innerWidth,
    th = window.innerHeight;

  // 300ms later, if there are no father changes, commit the values.
  setTimeout(() => {
    if ((tw === window.innerWidth, th === window.innerHeight)) {
      width.value = tw;
      height.value = th;
    }
  }, 300);
};

onMounted(() => {
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});
</script>
