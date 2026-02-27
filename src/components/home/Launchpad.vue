<template>
  <div>
    <search-bar v-model:smilesInput="smilesInput" />

    <v-row v-if="!!smiles" class="justify-center">
      <v-col
        ><smiles-image
          :smiles="smiles"
          allow-copy
          @load="validSmiles = true"
          @error="validSmiles = false"
        ></smiles-image
      ></v-col>
    </v-row>

    <template v-if="validSmiles && type === 'mol'">
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              SCScore
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
            >
              <template v-if="scscore === undefined">
                <v-btn
                  prepend-icon="mdi mdi-play"
                  variant="tonal"
                  color="primary"
                  data-cy="home-scscore"
                  @click="getScscore(smiles)"
                  >Evaluate</v-btn
                >
              </template>
              <template v-else-if="scscore === 'evaluating'">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </template>
              <template v-else>
                <v-chip color="primary">
                  <p class="text-body-1">{{ scscore }}</p>
                </v-chip>
              </template>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Interactive Path Planner
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
              ><v-btn
                prepend-icon="mdi mdi-play"
                variant="tonal"
                color="primary"
                data-cy="home-ipp"
                :href="`/network?tab=IPP&target=${encodeURIComponent(smiles)}`"
                >Perform One-Step</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Tree Builder
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
            >
              <template v-if="tbStatus === undefined">
                <v-btn-group density="compact" color="primary">
                  <v-btn
                    prepend-icon="mdi mdi-play"
                    variant="tonal"
                    color="primary"
                    data-cy="home-build-tree"
                    @click="sendTreeBuilderJob(smiles)"
                    >Build Tree</v-btn
                  >
                  <v-menu
                    location="bottom"
                    id="tb-submit-settings"
                    :close-on-content-click="false"
                  >
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi mdi-menu-down"
                        variant="tonal"
                        color="primary"
                      />
                    </template>
                    <v-card width="auto" min-width="250px">
                      <v-text-field
                        v-model="tbDesc"
                        label="Job name/description"
                        variant="outlined"
                        hide-details
                        class="pa-3"
                        density="compact"
                      ></v-text-field>
                      <v-divider class="ma-2" :thickness="2"></v-divider>
                      <p class="text-subtitle-2 pl-3">Quick Settings</p>
                      <v-list density="compact">
                        <v-list-item
                          v-for="(value, name) in tbPresetOptions"
                          :key="name"
                        >
                          <v-list-item-title>
                            <v-checkbox
                              v-model="tbPreset"
                              :value="name"
                              hide-details
                            >
                              <template v-slot:label>
                                {{ value.label }}
                              </template>
                            </v-checkbox>
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>
                </v-btn-group>
              </template>
              <template v-else-if="tbStatus === 'pending'">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </template>
              <template v-else-if="tbStatus === 'error'">
                <v-chip variant="tonal" color="red" class="text-body-1"
                  >Please login to submit</v-chip
                >
              </template>
              <template v-else>
                <v-btn
                  prepend-icon="mdi mdi-table"
                  variant="tonal"
                  color="primary"
                  href="/results"
                  data-cy="home-view-tree-results"
                  >Visit Results</v-btn
                >
              </template>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Predict Forward Synthesis
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
              ><v-btn
                prepend-icon="mdi mdi-play"
                variant="tonal"
                color="primary"
                data-cy="home-forward-synthesis"
                :href="`/forward?tab=forward&reactants=${encodeURIComponent(
                  smiles
                )}`"
                >Run Task</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Predict Impurities
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
              ><v-btn
                prepend-icon="mdi mdi-play"
                variant="tonal"
                color="primary"
                data-cy="home-predict-impurties"
                :href="`/forward?tab=impurity&reactants=${encodeURIComponent(
                  smiles
                )}`"
                >Run Task</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Predict Aromatic Site Selectivity
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
              ><v-btn
                prepend-icon="mdi mdi-play"
                variant="tonal"
                color="primary"
                data-cy="home-site-selectivity"
                :href="`/forward?tab=sites&reactants=${encodeURIComponent(
                  smiles
                )}`"
                >Run Task</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Solvent Screen
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
              ><v-btn
                prepend-icon="mdi mdi-play"
                variant="tonal"
                color="primary"
                data-cy="home-solvent-screen"
                :href="`/solprop?tab=solscreen&solute=${encodeURIComponent(
                  smiles
                )}`"
                >Run Task</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Buyables
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
              ><v-btn
                prepend-icon="mdi-cart-variant"
                variant="tonal"
                data-cy="home-buyables"
                color="primary"
                :href="`/buyables?q=${encodeURIComponent(smiles)}`"
                >Search Buyables</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              QM Descriptor
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
              ><v-btn
                prepend-icon="mdi mdi-play"
                variant="tonal"
                color="primary"
                data-cy="home-qm-descriptors"
                :href="`/qm?smiles=${encodeURIComponent(smiles)}`"
                >Run Task</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-col>
      </v-row>
    </template>

    <template v-if="validSmiles && type === 'rxn'">
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Fast Filter Score
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
            >
              <template v-if="reactionScore === undefined">
                <v-btn
                  prepend-icon="mdi mdi-play"
                  variant="tonal"
                  color="primary"
                  data-cy="home-fast-filter-score"
                  @click="getReactionScore(smiles)"
                  >Evaluate</v-btn
                >
              </template>
              <template v-else-if="reactionScore === 'evaluating'">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </template>
              <template v-else>
                <v-chip color="primary">
                  <p class="text-body-1">{{ reactionScore }}</p>
                </v-chip>
              </template>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols=" 12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Generate Atom Mapping
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
            >
              <template
                v-if="
                  mappedSmiles === undefined ||
                  !!mappedSmiles.length > 0 ||
                  mappedSmiles === 'error'
                "
              >
                <v-btn-group density="compact" color="primary">
                  <v-btn
                    v-if="mappedSmiles === undefined"
                    prepend-icon="mdi mdi-play"
                    variant="tonal"
                    color="primary"
                    data-cy="home-generate-atom-mapping"
                    @click="getMappedSmiles(smiles)"
                    >Evaluate</v-btn
                  >
                  <v-btn
                    v-if="!!mappedSmiles"
                    prepend-icon="mdi mdi-play"
                    variant="tonal"
                    @click="showMappedSmiles = !showMappedSmiles"
                  >
                    {{ showMappedSmiles ? "Hide" : "Show" }}</v-btn
                  >
                  <v-menu
                    location="bottom"
                    id="mapper-settings"
                    :close-on-content-click="false"
                  >
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi mdi-menu-down"
                        variant="tonal"
                        color="primary"
                        data-cy="home-generate-atom-mapping-setting"
                      />
                    </template>
                    <v-card width="auto" min-width="250px">
                      <v-btn
                        prepend-icon="mdi mdi-play"
                        variant="tonal"
                        color="primary"
                        data-cy="home-mapping-checkbox"
                        @click="getMappedSmiles(smiles)"
                        class="pa-3 justify-center"
                        :disabled="mappedSmiles === undefined"
                        >Re-evaluate</v-btn
                      >
                      <v-divider class="ma-2" :thickness="2"></v-divider>
                      <p class="text-subtitle-2 pl-3">Quick Settings</p>
                      <v-list density="compact">
                        <v-list-item v-for="name in mapperOptions" :key="name">
                          <v-list-item-title>
                            <v-checkbox
                              v-model="mapper"
                              :value="name"
                              hide-details
                            >
                              <template v-slot:label>
                                {{ name }}
                              </template>
                            </v-checkbox>
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>
                </v-btn-group>
              </template>
              <template v-else-if="mappedSmiles === 'evaluating'">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </template>
              <template v-else-if="mappedSmiles === 'error'">
                <v-chip variant="tonal" color="red" class="text-body-1"
                  >Submission Error</v-chip
                >
              </template>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols=" 12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Predict Forward Synthesis
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
              ><v-btn
                prepend-icon="mdi mdi-play"
                variant="tonal"
                color="primary"
                data-cy="home-forward-synthesis"
                :href="
                  '/forward?tab=forward&rxnsmiles=' + encodeURIComponent(smiles)
                "
                >Run Task</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-col>
      </v-row>

      <v-row
        v-if="!!mappedSmiles"
        v-show="!!showMappedSmiles"
        class="my-4 pa-4"
      >
        <v-col cols="12" class="justify-center">
          <smiles-image
            :smiles="mappedSmiles"
            draw-map
            highlight
            allow-copy
          ></smiles-image>
          <p class="text-body-1 text-center">SMILES: {{ mappedSmiles }}</p>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Predict Conditions
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
              ><v-btn
                prepend-icon="mdi mdi-play"
                variant="tonal"
                color="primary"
                data-cy="home-predict-condition"
                :href="
                  '/forward?tab=context&rxnsmiles=' + encodeURIComponent(smiles)
                "
                >Run Task</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-col>
        <v-col cols=" 12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Predict Impurities
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
              ><v-btn
                prepend-icon="mdi mdi-play"
                variant="tonal"
                color="primary"
                data-cy="home-predict-impurities"
                :href="
                  '/forward?tab=impurity&rxnsmiles=' +
                  encodeURIComponent(smiles)
                "
                >Run Task</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-col>
        <v-col cols=" 12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Predict Regioselectivity
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
              ><v-btn
                prepend-icon="mdi mdi-play"
                variant="tonal"
                color="primary"
                data-cy="home-predict-regioselectivity"
                :href="
                  '/forward?tab=selectivity&rxnsmiles=' +
                  encodeURIComponent(smiles)
                "
                >Run Task</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-col>
      </v-row>

      <v-row class="justify-center">
        <v-col cols=" 12" sm="4" md="4">
          <v-card min-height="100px">
            <v-card-title
              :class="
                'text-h5 text-center text-wrap' +
                (isDark ? ' bg-grey-darken-3' : ' bg-grey-lighten-2')
              "
            >
              Classify Reaction
              <a
                href="https://doi.org/10.26434/chemrxiv.9897365.v4"
              >
                <v-icon icon="mdi-information" size="x-small"></v-icon
              ></a>
            </v-card-title>
            <v-card-actions
              :class="
                'justify-center' +
                (isDark ? ' bg-grey-darken-2' : ' bg-grey-lighten-3')
              "
            >
              <v-btn
                prepend-icon="mdi mdi-play"
                variant="tonal"
                color="primary"
                v-if="classificationStatus === 'not started'"
                @click="getClassification(smiles)"
                data-cy="home-classify-reaction"
                >Evaluate</v-btn
              >
              <template v-if="classificationStatus === 'evaluating'">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </template>
              <v-btn
                variant="tonal"
                color="primary"
                v-if="classificationResults.length"
                @click="showClassificationResults = !showClassificationResults"
              >
                {{ showClassificationResults ? "Hide" : "Show" }}</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row
        v-if="!!classificationResults.length"
        v-show="showClassificationResults"
        class="my-4 pa-4"
      >
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="classificationResults"
            :items-per-page="100"
          >
            <template #bottom></template>
          </v-data-table>
        </v-col>
      </v-row>
    </template>

    <template v-if="isTyping && validSmiles === null">
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader
            class="mx-auto border"
            elevation="2"
            min-height="100px"
            type="paragraph"
          >
          </v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader
            class="mx-auto border"
            elevation="2"
            min-height="100px"
            type="paragraph"
          >
          </v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader
            class="mx-auto border"
            elevation="2"
            min-height="100px"
            type="paragraph"
          >
          </v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader
            class="mx-auto border"
            elevation="2"
            min-height="100px"
            type="paragraph"
          >
          </v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader
            class="mx-auto border"
            elevation="2"
            min-height="100px"
            type="paragraph"
          >
          </v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader
            class="mx-auto border"
            elevation="2"
            min-height="100px"
            type="paragraph"
          >
          </v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader
            class="mx-auto border"
            elevation="2"
            min-height="100px"
            type="paragraph"
          >
          </v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader
            class="mx-auto border"
            elevation="2"
            min-height="100px"
            type="paragraph"
          >
          </v-skeleton-loader>
        </v-col>
        <v-col cols="12" sm="4" md="4">
          <v-skeleton-loader
            class="mx-auto border"
            elevation="2"
            min-height="100px"
            type="paragraph"
          >
          </v-skeleton-loader>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import SmilesImage from "@/components/SmilesImage";
import SearchBar from "@/components/home/SearchBar";
import { API } from "@/common/api";
import { TB_PRESETS } from "@/common/tb-presets";
import { num2str } from "@/common/utils";
import { useTheme } from "@/composables/useTheme";

const { isDark } = useTheme();
const smilesInput = ref(null);
const smiles = refDebounced(smilesInput, 500);
const validSmiles = ref(null);
const scscore = ref(undefined);
const reactionScore = ref(undefined);
const mappedSmiles = ref(undefined);
const mapper = ref("indigo");
const mapperOptions = ["indigo", "wln", "rxnmapper"];
const showMappedSmiles = ref(true);
const classificationResults = ref([]);
const showClassificationResults = ref(true);
const classificationStatus = ref("not started");
const tbStatus = ref(undefined);
const tbPreset = ref("normal");
const tbPresetOptions = ref(TB_PRESETS);
const tbDesc = ref("");
const isTyping = ref(false);
const headers = [
  { key: "rank", title: "Rank", align: "center" },
  { key: "reaction_num", title: "Reaction Number", align: "center" },
  {
    key: "reaction_superclassname",
    title: "Reaction Name (Lvl 1)",
    align: "center",
  },
  {
    key: "reaction_classname",
    title: "Reaction Name (Lvl 2)",
    align: "center",
  },
  { key: "reaction_name", title: "Reaction Name (Lvl 3)", align: "center" },
  {
    key: "prediction_certainty",
    title: "Prediction Certainty",
    align: "center",
  },
];

const type = computed(() => (smiles.value.includes(">") ? "rxn" : "mol"));

const getScscore = async (smiles) => {
  scscore.value = "evaluating";
  try {
    const json = await API.post("/api/scscore/call-sync", { smiles });
    scscore.value = num2str(json.result);
  } catch (error) {
    console.error("Could not evaluate SCScore:", error);
  }
};

const getReactionScore = async (smiles) => {
  reactionScore.value = "evaluating";
  const split = smiles.split(">");
  try {
    const output = await API.runCeleryTask("/api/fast-filter/call-async", {
      smiles: [split[0], split[split.length - 1]],
    });
    reactionScore.value = num2str(output.result.score);
  } catch (error) {
    console.error("Could not evaluate reaction score:", error);
  }
};

const getMappedSmiles = async (smiles) => {
  mappedSmiles.value = "evaluating";
  showMappedSmiles.value = true;
  try {
    const output = await API.runCeleryTask(
      "/api/atom-map/controller/call-async",
      { backend: mapper.value, smiles: [smiles] }
    );
    mappedSmiles.value = output.result[0];
  } catch (error) {
    mappedSmiles.value = "error";
    console.error("Could not generate atom mapping:", error);
  }
};

const getClassification = async (smiles) => {
  classificationStatus.value = "evaluating";
  showClassificationResults.value = true;
  classificationResults.value = [];
  try {
    const output = await API.runCeleryTask(
      "/api/reaction-classification/call-async",
      { smiles: [smiles], num_results: 10 }
    );
    classificationResults.value = output.result;
    classificationStatus.value = output.status === "FAILED" ? "failed" : "ok";
  } catch (error) {
    console.error("Could not generate reaction classification:", error);
  }
};

const sendTreeBuilderJob = async (smiles) => {
  tbStatus.value = "pending";
  try {
    const json = await API.runCeleryTask("/api/tree-search/mcts/call-async", {
      description: tbDesc.value || smiles,
      smiles,
    });
    tbStatus.value = json.result;
  } catch (error) {
    tbStatus.value = "error";
    console.error("Failed to submit tree builder job:", error);
  }
};

watch(validSmiles, (newVal) => {
  if (newVal) {
    isTyping.value = false;
  }
});

watch(smilesInput, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    isTyping.value = true;
    validSmiles.value = null;
    scscore.value = undefined;
    reactionScore.value = undefined;
    mappedSmiles.value = undefined;
    tbStatus.value = undefined;
    classificationStatus.value = "not started";
    classificationResults.value = [];
  }
  if (!newVal) {
    isTyping.value = false;
    smiles.value = null;
  }
});
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: scale(1.05);
}
</style>
