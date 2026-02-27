<template>
  <v-app class="overflow-auto">
    <v-layout style="min-width: 1150px;">
      <default-bar />

      <div v-if="!isOnline" class="banner offline-banner">
        You are offline
      </div>

      <div v-if="isOnline && wasOffline" class="banner online-banner">
        You are back online
      </div>

      <default-view />

      <v-dialog v-model="newAccountDialog" max-width="600px" class="welcome">
        <v-card>
          <v-card-title>
            <v-icon icon="mdi-hand-wave" size="small"></v-icon>
            Welcome
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-5 ">
            <div class="d-flex justify-center flex-column align-center">
              <v-img :width="400" cover :src="welcome" class="mb-3"></v-img>
            </div>

            <h4 class="text-h5">
              Hi, {{ myusername }}!
            </h4>
            <p class="text-body-1">
              Thanks for signing up at ASKCOS <v-chip size="small">v2</v-chip>. Here, we have hosted a number of
              computational tools to assist in synthetic planning and other aspects of organic chemistry.
            </p>
            <p class="text-body-1 mt-1">
              To learn more about ASKCOS <v-btn variant="tonal" color="primary" prepend-icon="mdi-book"
                href="https://askcos-docs.mit.edu" target="_blank">ASKCOS Docs</v-btn>
            </p>
            <p class="text-body-1 mt-1">
              To manage your account <v-btn variant="tonal" color="primary" prepend-icon="mdi-account"
                to="/admin">Account Settings</v-btn>
            </p>
          </v-card-text>
          <v-divider></v-divider>
          <template v-slot:actions>
            <v-btn class="ms-auto" text="Ok" @click="newAccountDialog = false" color="primary" variant="flat"></v-btn>
          </template>
        </v-card>
      </v-dialog>

      <v-dialog v-model="guestAccountDialog" max-width="600px" class="welcome">
        <v-card>
          <v-card-title>
            <v-icon icon="mdi-alert" size="small"></v-icon>
            Warning
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-5 ">
            <div class="d-flex justify-center flex-column align-center">
              <v-img :width="400" cover :src="hidden" class="mb-3"></v-img>
            </div>

            <h4 class="text-h5">
              Hi, Guest!
            </h4>
            <p class="text-body-1">
              You are currently using a temporary guest account at ASKCOS <v-chip size="small">v2</v-chip>. This account
              can
              be and will be deleted after a certain period of time. After deletion all of the data is permanently lost.
            </p>
            <p class="text-body-1 mt-1">
              Please consider signing up via the login page.
            </p>
            <p class="text-body-1 mt-1">
              To learn more about ASKCOS <v-btn variant="tonal" color="primary" prepend-icon="mdi-book"
                href="https://askcos-docs.mit.edu" target="_blank">ASKCOS Docs</v-btn>
            </p>
          </v-card-text>
          <v-divider></v-divider>
          <template v-slot:actions>
            <v-btn class="ms-auto" text="Ok" @click="guestAccountDialog = false" color="primary" variant="flat"></v-btn>
          </template>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-app>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from "vue";
import DefaultBar from "./AppBar.vue";
import DefaultView from "./View.vue";
import Confetti from "vue-confetti/src/confetti.js";
import welcome from "@/assets/welcome.svg"
import hidden from "@/assets/hidden.svg"
const confetti = new Confetti();
const newAccountDialog = ref(false);
const guestAccountDialog = ref(false);
const isOnline = ref(navigator.onLine);
const wasOffline = ref(false);

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;

  if (isOnline.value) {
    wasOffline.value = true
    setTimeout(() => {
      wasOffline.value = false; // Hide the banner after 30 seconds
    }, 10000); // 30000 milliseconds = 30 seconds
  }
};

onMounted(() => {
  const isAccountCreatedNow = localStorage.getItem("newAccount")
  const isguest = localStorage.getItem("guestAccount")
  if (isAccountCreatedNow === "true") {
    confetti.start({
      particles: [
        {
          type: 'rect',
        },
        {
          type: 'circle',
        }
      ],
      colors: ["#FF6F61", "#004C83", "#55C6A9", "#FFC82B"],
      particlesPerFrame: 2,
    });
    setTimeout(() => { confetti.stop() }, 5000);
    localStorage.removeItem("newAccount")
    newAccountDialog.value = true
  } else if (isguest === "true") {
    localStorage.removeItem("guestAccount")
    guestAccountDialog.value = true
  }
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
})

onBeforeUnmount(() => {
  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);
});

const myusername = computed(() => {
  const fixedLength = 20;
  const username = localStorage.getItem('username');
  if (username.length <= fixedLength) {
    return username;
  }
  return username.substr(0, fixedLength) + '\u2026'
})

</script>

<style>
#confetti-canvas {
  z-index: 998
}

.welcome {
  z-index: 999
}

.banner {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 400px;
  text-align: center;
  z-index: 1000;
  border-radius: 5px;
}

.online-banner {
  background-color: #4caf50;
}

.offline-banner {
  background-color: #f44336;
}
</style>
