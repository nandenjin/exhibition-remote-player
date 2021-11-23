import { createStore } from "vuex";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface State {
  uid: string | null;
  email: string | null;
}

export const store = createStore<State>({
  state: () => ({
    uid: null,
    email: null,
  }),

  mutations: {
    setUid(state, uid: string | null) {
      state.uid = uid;
    },
    setEmail(state, email: string | null) {
      state.email = email;
    },
  },
});

window.addEventListener("load", () => {
  onAuthStateChanged(getAuth(), () => {
    store.commit("setUid", getAuth().currentUser?.uid || null);
    store.commit("setEmail", getAuth().currentUser?.email || null);
  });
});
