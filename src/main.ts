import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { initializeApp } from "firebase/app";
import App from "./App.vue";

initializeApp({
  databaseURL: "https://exhibition-remote-player-default-rtdb.firebaseio.com",
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/player/:namespace",
      component: () => import("./views/PlayerView.vue"),
    },
  ],
});

createApp(App).use(router).mount("#app");
