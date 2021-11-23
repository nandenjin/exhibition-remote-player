import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { initializeApp } from "firebase/app";
import App from "./App.vue";
import { store } from "./store";

initializeApp({
  databaseURL: "https://exhibition-remote-player.firebaseio.com",
  apiKey: "AIzaSyDYzhYObO6WE1IPj48DrU6plyBH2OuFiQU",
  authDomain: "exhibition-remote-player.firebaseapp.com",
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

createApp(App).use(router).use(store).mount("#app");
