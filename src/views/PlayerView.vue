<template>
  <template v-if="!error">
    <Player
      :videoId="videoId"
      :width="width"
      :height="height"
      :position="position"
      @timeUpdate="
        (t) => {
          currentTime = t;
        }
      "
    />
    <div class="admin-ui">
      <div>
        <div v-if="store.state.uid">
          {{ store.state.email }}:{{ store.state.uid
          }}<button @click="() => signOut(getAuth())">Sign out</button>
        </div>
        <button v-else @click="signIn">Sign in</button>

        <div>Namespace: {{ namespace }}@{{ owner }}</div>
        <div>
          Video: {{ videoId || "__no_video__"
          }}<template v-if="isAdmin"
            >-><input
              type="text"
              v-model="videoIdInput"
              placeholder="Video ID"
            />
            <button @click="commitVideo">Commit video</button></template
          >
        </div>
        <div>
          currentTime: +{{ formatTime(currentTime || 0) }}
          <button v-if="isAdmin" @click="commitPosition">
            Commit position
          </button>
        </div>
        <div>requestedTime: +{{ formatTime(position || 0) }}</div>
      </div>
    </div></template
  >
  <div v-else>{{ error }}</div>
</template>

<script setup lang="ts">
import { getDatabase, onValue, ref as dbRef, update } from "firebase/database";
import {
  signInWithPopup,
  GoogleAuthProvider,
  getAuth,
  signOut,
} from "firebase/auth";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import Player from "../components/Player.vue";
import { useStore } from "vuex";
import { useMeta } from "vue-meta";

const route = useRoute();
const store = useStore();

const namespace = route.params.namespace;
const db = getDatabase();

const error = ref<string>();
const owner = ref<string>();
const isAdmin = computed(() => store.state.uid === owner.value);
const videoId = ref<string>("c21zSdiyW6o");
const position = ref<number>();

const currentTime = ref<number>();
const videoIdInput = ref<string>("");

const nsRef = dbRef(db, `namespaces/${namespace}`);

useMeta({
  title: `${namespace} - Exhibition Remote Player`,
});

// Set trigger from DB
onValue(nsRef, (snapshot) => {
  if (!snapshot.exists()) {
    error.value = `Namespace "${namespace}" is not found`;
    return;
  }

  console.info("DB updated");

  const {
    owner: o,
    videoId: vid,
    position: pos,
    timeOrigin: ot,
  }: {
    owner: string;
    videoId: string;
    position: number;
    timeOrigin: number;
  } = snapshot.val();
  owner.value = o;
  videoId.value = vid;
  position.value = pos + (Date.now() - ot) / 1000 || 0;

  console.log(`position=${position.value}`);
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
  onResize();
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});

const signIn = async () => {
  await signInWithPopup(getAuth(), new GoogleAuthProvider());
};

const commitVideo = () => {
  const extracted = videoIdInput.value.match(
    /(?<=youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_\-]+/
  );
  videoIdInput.value = extracted?.[0] || videoIdInput.value;

  update(nsRef, {
    videoId:
      videoIdInput.value?.length > 0 ? videoIdInput.value : videoId.value,
    position: 0,
    timeOrigin: Date.now(),
  });
};

const commitPosition = () => {
  update(nsRef, {
    position: currentTime.value,
    timeOrigin: Date.now(),
  });
};

const formatTime = (d: number) =>
  `${Math.floor(d / (24 * 60 * 60))}d${(
    "00" + Math.floor((d % (24 * 60 * 60)) / (60 * 60))
  ).slice(-2)}h${("00" + Math.floor((d % (60 * 60)) / 60)).slice(-2)}m${(
    "00" + Math.floor(d % 60)
  ).slice(-2)}s`;
</script>

<style lang="scss" scoped>
.admin-ui {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 300px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
  font: normal 14px "Courier New", monospace;
  opacity: 0;

  &:hover {
    opacity: 1;
  }
}
</style>
