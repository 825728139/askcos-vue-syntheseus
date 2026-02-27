<template>
  <v-container fluid>
    <bread-crumbs pageTitle="Template Info" />
    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="10">
        <v-sheet elevation="2" rounded="lg" class="pa-5">
          <v-row class="justify-center">
            <v-table class="mt-2" col="12">
              <tbody>
                <tr>
                  <th>Template:</th>
                  <td>
                    <span class="smiles">{{
                      templateInfo["reaction_smarts"]
                    }}</span>
                  </td>
                </tr>
                <tr>
                  <th>Template set:</th>
                  <td>{{ templateInfo["template_set"] }}</td>
                </tr>
                <tr>
                  <th>Total references:</th>
                  <td>{{ templateInfo.count }}</td>
                </tr>
              </tbody>
            </v-table>
            <v-col cols="12" sm="8" md="10">
              <copy-tooltip :data="templateInfo['reaction_smarts']">
                <smiles-image v-if="!!templateInfo['reaction_smarts']" :smiles="templateInfo['reaction_smarts']"
                  input-type="template"></smiles-image>
              </copy-tooltip>
            </v-col>
            <v-col col="12" sm="8" md="10" v-if="templateInfo['necessary_reagent']">
              <p v-if="templateInfo['necessary_reagent']">
                <em>
                  Note: This reaction would require a reagent to contribute
                  {{ templateInfo["necessary_reagent"] }}
                </em>
              </p>
              <p v-if="templateInfo['intra_only']">
                <em>
                  Note: This template should be used for intramolecular
                  reactions <b>only</b>
                </em>
              </p>
              <p v-if="templateInfo['dimer_only']">
                <em>
                  Note: This template should be used for symmetric
                  (dimerization) reactions
                  <b>only</b>
                </em>
              </p>
            </v-col>

            <v-col cols="12" sm="8" md="10" class="mb-3">
              <v-row class="d-flex flex-row align-center justify-space-between">
                <div>
                  <copy-tooltip class="btn btn-outline-secondary" :data="allReactionReferences" no-highlight>
                    <v-btn variant="outlined" class="flex-1-0">Copy all reaction IDs</v-btn>
                  </copy-tooltip>
                </div>
                <div>
                  <v-btn v-if="templateInfo.template_set === 'reaxys'" variant="outlined"
                    @click="downloadReactionQuery">
                    Export all reaction IDs as Reaxys query
                  </v-btn>
                </div>
                <div>
                  <v-btn v-if="templateInfo.template_set === 'reaxys'" variant="outlined" :href="rexaysURL"
                    target="_blank">
                    Find current page of reactions in Reaxys
                  </v-btn>
                </div>

                <template v-if="templateInfo.template_set === 'cas' &&
                      rxnListItems &&
                      rxnListItems.length
                      ">
                  <sci-findern-button class="ml-2" @click="casSearch"></sci-findern-button>
                  <v-menu location="bottom" :close-on-content-click="false" id="proxy-settings">
                    <template v-slot:activator="{ props }">
                      <v-btn color="primary" dark v-bind="props">
                        Proxy Settings
                      </v-btn>
                    </template>
                    <v-card style="width: 18rem">
                      <v-card-text>
                        <span>
                          If your institution requires a proxy connection to
                          access SciFinder<sup>n</sup>, enter the URL
                          below:</span>
                        <v-text-field label="Proxy URL" variant="outlined" v-model="proxyUrl"
                          hide-details></v-text-field>
                      </v-card-text>
                      <v-card-actions>
                        <v-btn class="ml-2" variant="primary" type="submit" @click="saveProxyUrl">Save</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>
                </template>
              </v-row>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="10">
        <v-sheet elevation="2" class="d-flex justify-center align-center pa-5" rounded="lg">
          <v-row class="justify-center">
            <v-col cols="12">
              <v-data-table :headers="headers" :items="rxnListItems" :loading="loading"
                :no-data-text="'Reaction data not available!'" class="pa-2">
                <template #item.reaction_id="{ item }">
                  {{ item.reaction_id }}
                  <smiles-image v-if="item.reaction_smiles" :smiles="item.reaction_smiles" input-type="reaction" />
                </template>
                <template #item.spectators="{ item }">
                  {{ item.spectators }}
                </template>
                <template #item.reference="{ item }">
                  <template v-if="item.reference_url">
                    <a v-if="item.reference" :href="item.reference_url" target="_blank">
                      {{ item.reference }}
                    </a>
                    <a v-else :href="item.reference_url" target="_blank">
                      link
                    </a>
                  </template>
                  <template v-else>
                    {{ item.reference }}
                  </template>
                </template>
              </v-data-table>
            </v-col>

            <v-col cols="12">
              <v-row align="center" justify="space-between" class="mx-auto my-3">
                <v-expansion-panels multiple density="compact">
                  <v-expansion-panel density="compact">
                    <template v-slot:title>
                      <span class="text-body-1 ml-2">
                        <b>Reaction reference IDs: </b></span>
                    </template>
                    <template v-slot:text>
                      <v-row>
                        <v-col>
                          <copy-tooltip :data="allReactionReferences">
                            <span>{{ allReactionReferences }}</span>
                          </copy-tooltip>
                        </v-col>
                      </v-row>
                    </template>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-row>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from "vue";
import CopyTooltip from "@/components/CopyTooltip";
import SciFindernButton from "@/components/SciFindernButton";
import SmilesImage from "@/components/SmilesImage";
import { API } from "@/common/api";
import { createReaxysQuery, createReaxysUrl } from "@/common/reaxys";
import { createCasClient } from "@/common/cas-client";
import { storageAvailable } from "@/common/utils";
import { saveAs } from "file-saver";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import { useConfigStore } from "@/store/config";

const PROXY_STORAGE_KEY = "casProxyUrl";

export default {
  name: "App",
  components: {
    CopyTooltip,
    SciFindernButton,
    SmilesImage,
    BreadCrumbs,
  },
  setup() {
    const casClient = ref(null);
    const casUser = ref(null);
    const casUrl = ref(null);
    const proxyUrl = ref("");
    const templateId = ref(null);
    const templateInfo = ref({});
    const reactionsByPage = reactive({});
    const rxnListCurrentPage = ref(1);
    const rxnListItemsPerPage = ref(50);
    const loading = ref(false);
    const configStore = useConfigStore();

    const headers = ref([
      { key: "reaction_id", title: "Reaction ID" },
      { key: "rxnid", title: "Reaction" },
      { key: "spectators", title: "Spectators" },
      { key: "reference", title: "Reference" },
    ]);

    const lookupTemplate = async () => {
      if (templateId.value) {
        loading.value = true;
        try {
          const json = await API.get("/api/template/retrieve", {
            pk: templateId.value,
          });
          templateInfo.value = json.template;
          await lookupReactions();
        } catch (error) {
          console.error("Error fetching template:", error);
        } finally {
          loading.value = false;
        }
      }
    };

    const lookupReactions = async () => {
      loading.value = true;
      const json = await API.post("/api/reactions/post", {
        template_set: templateInfo.value.template_set,
        ids: currentReactionReferences.value,
      });
      let reactions = generateReferences(
        json.reactions,
        currentReactionReferences.value
      );
      reactionsByPage[rxnListCurrentPage.value] = reactions;
      loading.value = false;
    };

    const downloadReactionQuery = () => {
      let blob = new Blob([createReaxysQuery(templateInfo.value.references)], {
        type: "data:text/json;charset=utf-8",
      });
      saveAs(blob, "reaxys_query.json");
    };

    const generateReferences = (reactions, reactionIds) => {
      if (templateInfo.value.template_set.startsWith("reaxys")) {
        return generateReaxysReferences(reactions, reactionIds);
      } else if (templateInfo.value.template_set.startsWith("pistachio")) {
        return generatePistachioReferences(reactions);
      } else {
        return reactions;
      }
    };

    const generateReaxysReferences = (reactions, reactionIds) => {
      if (reactions.length) {
        return reactions.map((r) => {
          return {
            reference_url: createReaxysUrl([r["reaction_id"]]),
            ...r,
          };
        });
      } else {
        return reactionIds.map((rid) => {
          return {
            reaction_id: rid,
            reference_url: createReaxysUrl([rid]),
          };
        });
      }
    };

    const generatePistachioReferences = (reactions) => {
      return reactions.map((r) => {
        return {
          reference: r.title.includes("_")
            ? r.title.replace("_", " [") + "]"
            : r.title,
          reference_url: createPistachioUrl(r.title),
          ...r,
        };
      });
    };

    const createPistachioUrl = (pid) => {
      if (configStore.envs.VITE_PISTACHIO_WEB_URL) {
        return `${configStore.envs.VITE_PISTACHIO_WEB_URL}/#search/${pid}//p1`;
      }

      return `https://patents.google.com/patent/${pid.split("_")[0]}/`;
    };

    const casLogin = () => {
      return casClient.value
        .login()
        .then((user) => {
          console.log("Logged in!");
          casUser.value = user;
        })
        .catch((err) => {
          console.log("Could not login: ", err);
        });
    };

    const createCasUrl = () => {
      if (!casUser.value || casUser.value.expired || !rxnListItems.value) {
        return;
      }
      const data = {
        uriList: rxnListItems.value.map((rxn) => `reaction/pt/${rxn["rxnid"]}`),
      };
      return casClient.value
        .post("/api/v1/import/reactions", data)
        .then((json) => {
          const host = proxyUrl.value || casClient.value.apiServer;
          casUrl.value = host + json.path;
        })
        .catch((err) => {
          console.log("Could not import reactions: ", err);
          alert("Could not import reactions using SciFinder API.");
        });
    };

    const casSearch = () => {
      if (!rxnListItems.value) {
        return;
      }
      if (casUrl.value) {
        window.open(casUrl.value, "_blank");
      } else if (!casUser.value || casUser.value.expired) {
        casLogin()
          .then(() => {
            return createCasUrl();
          })
          .then(() => {
            if (casUrl.value) {
              // Open in current window because popup will be blocked
              window.location = casUrl.value;
            }
          });
      } else {
        createCasUrl().then(() => {
          if (casUrl.value) {
            // Open in current window because popup will be blocked
            window.location = casUrl.value;
          }
        });
      }
    };

    const initializeCasClient = () => {
      return createCasClient({}, proxyUrl.value)
        .then((client) => {
          casClient.value = client;
          return casClient.value.getUser();
        })
        .then((user) => {
          casUser.value = user;
        });
    };

    const saveProxyUrl = () => {
      if (storageAvailable("localStorage")) {
        localStorage.setItem(
          PROXY_STORAGE_KEY,
          encodeURIComponent(proxyUrl.value)
        );
      }
      initializeCasClient();
    };

    // const context = JSON.parse(document.getElementById('django-context').textContent);

    const allReactionReferences = computed(() => {
      // Returns all reaction references as a semicolon delimited string
      if (!!templateInfo.value && !!templateInfo.value.references) {
        return templateInfo.value.references.join("; ");
      } else {
        return "";
      }
    });

    const currentReactionReferences = computed(() => {
      // Returns reaction references for the current page as an array
      if (!!templateInfo.value && !!templateInfo.value.references) {
        const start =
          (rxnListCurrentPage.value - 1) * rxnListItemsPerPage.value;
        const end = start + rxnListItemsPerPage.value;
        return templateInfo.value.references.slice(start, end);
      } else {
        return [];
      }
    });

    const rxnListItems = computed(() => {
      return reactionsByPage[rxnListCurrentPage.value];
    });

    const rxnListTotalItems = computed(() => {
      if (!!templateInfo.value && !!templateInfo.value.references) {
        return templateInfo.value.references.length;
      } else {
        return 0;
      }
    });

    const rexaysURL = computed(() => {
      return createReaxysUrl(currentReactionReferences.value);
    });

    onMounted(async () => {
      const urlParams = new URLSearchParams(window.location.search);
      templateId.value = urlParams.get("id");
      const lookupPromise = await lookupTemplate();
      if (storageAvailable("localStorage")) {
        const value = localStorage.getItem(PROXY_STORAGE_KEY);
        if (value) {
          proxyUrl.value = decodeURIComponent(value);
        }
      }

      const authPromise = initializeCasClient();

      Promise.all([lookupPromise, authPromise]).then(() => {
        createCasUrl();
      });
    });

    watch(rxnListCurrentPage, (newVal) => {
      if (reactionsByPage[newVal] === undefined) {
        lookupReactions().then(() => {
          createCasUrl();
        });
      }
    });

    return {
      casClient,
      casUser,
      casUrl,
      proxyUrl,
      templateId,
      templateInfo,
      reactionsByPage,
      rxnListCurrentPage,
      rxnListItemsPerPage,
      loading,
      allReactionReferences,
      currentReactionReferences,
      rexaysURL,
      rxnListItems,
      rxnListTotalItems,
      headers,
      lookupTemplate,
      lookupReactions,
      downloadReactionQuery,
      generateReferences,
      generateReaxysReferences,
      generatePistachioReferences,
      createPistachioUrl,
      casLogin,
      createCasUrl,
      casSearch,
      initializeCasClient,
      saveProxyUrl,
      configStore,
    };
  },
};
</script>
