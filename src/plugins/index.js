/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from "./webfontloader";
import { loadResultStore } from "./resultstoreloader";
import vuetify from "./vuetify";
import pinia from "../store";
import router from "../router";
import VueConfetti from "vue-confetti";
import VuetifyUseDialog from "vuetify-use-dialog";
import keycloakPlugin from "./keycloak";
import timeago from "vue-timeago3";
import { createGtag } from "vue-gtag";

export function registerPlugins(app) {
  // order is important
  loadFonts();
  app
    .use(vuetify)
    .use(pinia)
    .use(VueConfetti)
    .use(timeago)
    .use(VuetifyUseDialog)
    .use(keycloakPlugin)
    .use(router)
    .use(
      createGtag({
        tagId: "",
        initMode: "manual",
        pageTracker: { router },
      })
    );
  loadResultStore();
}
