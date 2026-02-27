<template>
  <v-navigation-drawer expand-on-hover elevation="2" width="1000px" class="sidebar" :rail="rail"
    @update:rail="($event) => (rail = $event)" permanent>
    <v-list>
      <v-list-item prepend-avatar="/android-chrome-192x192.png" title="ASKCOS" :subtitle="org" to="/" value="home"
        :active="false"></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list nav v-model="openedGroups" color="primary">
      <v-list-item prepend-icon="mdi-home" title="Home" to="/" value="home" :active="route.path === '/'"></v-list-item>
      <v-list-group value="modules" no-action>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-file-tree" title="Modules" :active="activeModules"
            :variant="activeModules ? 'tonal' : 'text'"></v-list-item>
        </template>
        <v-list-group value="Retrosynthesis" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Retrosynthesis"></v-list-item>
          </template>

          <v-list-item to="/network?tab=IPP" title="Interactive Path Planning/Tree Builder" value="IPP"
            :active="route.query.tab === 'IPP'"></v-list-item>
          <v-list-item to="/network?tab=RP" title="Retrosynthesis Prediction" value="RP"
            :active="route.query.tab === 'RP'"></v-list-item>
        </v-list-group>

        <v-list-group value="ForwardSynthesis" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Forward Synthesis"></v-list-item>
          </template>

          <v-list-item to="/forward?tab=context" title="Condition Recommendation" value="context"
            :active="route.query.tab === 'context'"></v-list-item>
          <v-list-item to="/forward?tab=forward" title="Product Prediction" value="forward"
            :active="route.query.tab === 'forward'"></v-list-item>
          <v-list-item to="/forward?tab=impurity" title="Impurity Prediction" value="impurity"
            :active="route.query.tab === 'impurity'"></v-list-item>
          <v-list-item to="/forward?tab=selectivity" title="Regio-selectivity Prediction" value="selectivity"
            :active="route.query.tab === 'selectivity'"></v-list-item>
          <v-list-item to="/forward?tab=sites" title="Aromatic C-H Functionalization" value="sites"
            :active="route.query.tab === 'sites'"></v-list-item>
        </v-list-group>

        <v-list-group value="Utilities" subgroup>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Utilities"></v-list-item>
          </template>

          <v-list-item to="/solprop?tab=solpred" title="Solubility Prediction" value="USP"
            :active="route.query.tab === 'solpred'"></v-list-item>
          <v-list-item to="/solprop?tab=solscreen" title="Solvent Screening" value="USS"
            :active="route.query.tab === 'solscreen'"></v-list-item>
          <v-list-item to="/qm" title="QM Descriptor" value="QM"></v-list-item>
          <v-list-item to="/molcom" title="Molecular Complexity" value="MC"></v-list-item>
          <v-list-item to="/buyables" title="Buyable Look-up" value="UBLU"></v-list-item>
          <v-list-item to="/drawing" title="Drawing" value="UD"></v-list-item>
        </v-list-group>
      </v-list-group>
      <v-list-item to="/status" prepend-icon="mdi-list-status" title="Server Status" value="status"
        :active="route.path === '/status'"></v-list-item>
      <v-divider></v-divider>
      <v-list-item prepend-icon="mdi-book-open-variant" title="Wiki" value="wiki" :active="false"
        href="https://askcos-docs.mit.edu/" target="_blank" />
      <v-list-item prepend-icon="mdi-bug" title="Report a bug" value="bug" :active="false">
        <TheSupportModal />
      </v-list-item>
      <v-list-item prepend-icon="mdi-code-json" title="Logs" value="logs" to="/logs"
        :active="route.path === '/logs'"></v-list-item>
      <v-divider v-if="isLoggedIn"></v-divider>
      <v-list-item v-if="isLoggedIn" prepend-icon="mdi-table" title="My Results" value="result" to="/results"
        :active="route.path === '/results'"></v-list-item>
      <v-list-item v-if="isLoggedIn" prepend-icon="mdi-cancel" title="My Banlist" value="banlist" to="/banlist"
        :active="route.path === '/banlist'"></v-list-item>
    </v-list>
    <template v-slot:append>
      <v-list nav color="primary" :class="listBackgroundColor" class="py-0">
        <v-divider></v-divider>
        <v-list-item @click="toggleTheme">
          <template v-slot:prepend>
            <v-icon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"></v-icon>
          </template>
          <v-list-item-title>{{
            isDark ? "Light Mode" : "Dark Mode"
            }}</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="!isLoggedIn" to="/login" prepend-icon="mdi-login" title="Login"
          :active="false"></v-list-item>
        <v-list-item v-if="isLoggedIn" to="/admin" lines="two" prepend-icon="mdi-account" subtitle="Logged in"
          :title="myusername" :disabled="myusername.startsWith('guest_')"></v-list-item>
        <v-list-item v-if="isLoggedIn" @click="logout" prepend-icon="mdi-logout" title="Logout"
          :active="false"></v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, computed, inject } from "vue";
import TheSupportModal from "@/components/TheSupportModal.vue";
import { useConfigStore } from "@/store/config";
import { API } from "@/common/api";
import { useTheme } from "@/composables/useTheme";

const configStore = useConfigStore();
const keycloak = inject("$keycloak");

const _openedGroups = ref(["modules"]);
const route = useRoute();
const router = useRouter();
const rail = ref(true);

const org = computed({ get: () => configStore.envs.VITE_ORGANIZATION });
const { isDark, toggleTheme } = useTheme();

const listBackgroundColor = computed(() => {
  return isDark.value ? "bg-grey-darken-3" : "bg-grey-lighten-5";
});

const openedGroups = computed({
  get: () => (rail.value ? [] : _openedGroups.value),
  set: (val) => {
    if (val.length === 0) {
      _openedGroups.value = ["modules"];
    } else {
      _openedGroups.value = val;
    }
  },
});

const activeModules = computed(() => {
  const shouldBeActiveModules = [
    "/network",
    "/buyables",
    "/forward",
    "/solprop",
    "/drawing",
    "/qm",
    "/molcom",
  ];
  return shouldBeActiveModules.some((el) => route.path.includes(el));
});

const myusername = computed(() => {
  const fixedLength = 20;
  const username = localStorage.getItem("username");
  if (username.length <= fixedLength) {
    return username;
  }
  return username.substr(0, fixedLength) + "\u2026";
});

const isLoggedIn = computed(() => {
  return !!localStorage.getItem("accessToken");
});

async function logout() {
  try {
    const response = await API.post("/api/admin/logout");
    if (response.status !== "Successfully logged out!")
      throw new Error("Logout failed");

    // Cleanup local tokens and info
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    localStorage.removeItem("authProvider");

    // Cleanup Keycloak session/callbacks from sessionStorage
    try {
      Object.keys(sessionStorage)
        .filter(
          (k) =>
            k.startsWith("kc-") ||
            k.startsWith("keycloak-") ||
            k.includes("kc-callback")
        )
        .forEach((k) => sessionStorage.removeItem(k));
    } catch (e) {
      console.debug("Session storage cleanup failed (ignored)", e);
    }

    // SSO-only: initiate remote logout for Keycloak
    if (keycloak && keycloak.authenticated) {
      try {
        const logoutUrl = keycloak.createLogoutUrl({
          redirectUri: `${window.location.origin}/sso-logout`,
          idTokenHint: keycloak.idToken,
        });
        const popup = window.open(
          logoutUrl,
          "kc_logout_popup",
          "left=120,top=120,width=900,height=700"
        );
        if (!popup) {
          // If popup blocked, fallback to redirect logic
          await keycloak.logout({
            redirectUri: `${window.location.origin}/sso-logout`,
            idTokenHint: keycloak.idToken,
          });
          return;
        }
        
        // Listen for logout success message from popup
        const handleLogoutMessage = (event) => {
          if (event.origin !== window.location.origin) return;
          if (event.data?.type === "kc-logout-success") {
            window.removeEventListener("message", handleLogoutMessage);
            if (!popup.closed) {
              popup.close();
            }
            router.push({ path: "/login" });
          }
        };
        window.addEventListener("message", handleLogoutMessage);
        
        // Fallback: check if popup is closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener("message", handleLogoutMessage);
            router.push({ path: "/login" });
          }
        }, 1000);
        return;
      } catch (e) {
        console.debug("Keycloak logout popup failed (ignored)", e);
      }
    }
    // Route to login page after logout
    router.push({ path: "/login" });
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 1000 !important;
}

.v-icon {
  margin-inline-end: 0px;
}
</style>
