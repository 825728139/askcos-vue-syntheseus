<template>
  <v-container fluid style="min-height: calc(100vh-50px)">
    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="12">

        <v-sheet elevation="2">
          <v-tabs v-model="tab" color="primary" align-tabs="center" grow class="mb-4">
            <v-tab @click="replaceRoute('context')" value="context">Condition Recommendation</v-tab>
            <v-tab @click="replaceRoute('forward')" value="forward">Product Prediction</v-tab>
            <v-tab @click="replaceRoute('impurity')" value="impurity">Impurity Prediction</v-tab>
            <v-tab @click="replaceRoute('selectivity')" value="selectivity">Regioselectivity Prediction</v-tab>
            <v-tab @click="replaceRoute('sites')" value="sites">Aromatic C-H Functionalization</v-tab>
          </v-tabs>
        </v-sheet>

        <v-sheet elevation="2" class="pa-10" rounded="lg">
          <v-form @submit.prevent="predict">
            <v-row align="center">
              <v-col :cols="mode === 'context' || mode === 'impurity' || mode === 'selectivity' ? 6 : 12">
                <v-text-field v-model="reactants" data-cy="reactants" class="centered-input" variant="outlined"
                  label="Reactants" prepend-inner-icon="mdi mdi-flask" placeholder="SMILES" hide-details clearable
                  rounded="pill">
                  <template v-slot:append-inner>
                    <draw-button v-model:smiles="reactants" />
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="6" v-if="mode !== 'forward' && mode !== 'sites'">
                <v-text-field v-model="product" data-cy="product" label="Product" class="centered-input"
                  variant="outlined" prepend-inner-icon="mdi mdi-flask" placeholder="SMILES" hide-details clearable
                  rounded="pill">
                  <template v-slot:append-inner>
                    <draw-button v-model:smiles="product" />
                  </template>
                </v-text-field>
              </v-col>
            </v-row>

            <v-row class="d-flex justify-center" v-if="!!reactants || !!product">
              <v-col cols="3">
                <smiles-image :smiles="reactants" v-if="!!reactants"></smiles-image>
              </v-col>
              <v-col cols="3" align="center" class="py-30"
                v-if="!!reactants && !!product && mode !== 'sites' && mode !== 'forward'">
                <smiles-image :smiles="'>>'" width="200"></smiles-image>
              </v-col>
              <v-col cols="3" v-if="!!product && mode !== 'forward' && mode !== 'sites'">
                <smiles-image :smiles="product"></smiles-image>
              </v-col>
            </v-row>

            <v-row align="center" v-if="mode !== 'context' && mode !== 'sites'">
              <v-col cols="6">
                <v-text-field v-model="reagents" label="Agents" class="centered-input" variant="outlined"
                  prepend-inner-icon="mdi mdi-flask" placeholder="SMILES" data-cy="reagents" hide-details clearable
                  :disabled="mode === 'context' || mode === 'sites'" rounded="pill">
                  <template v-slot:append-inner>
                    <draw-button v-model:smiles="reagents" />
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="solvent" label="Solvent" class="centered-input" variant="outlined"
                  prepend-inner-icon="mdi mdi-flask" placeholder="SMILES" data-cy="solvent" hide-details clearable
                  :disabled="mode === 'context' || mode === 'sites'" rounded="pill">
                  <template v-slot:append-inner>
                    <draw-button v-model:smiles="solvent" />
                  </template>
                </v-text-field>
              </v-col>
            </v-row>

            <!-- Context v2 (QUARC) supports reagents input -->
            <v-row align="center" v-if="mode === 'context' && contextModel === 'neuralnetworkv2'">
              <v-col cols="12">
                <v-text-field v-model="reagents" label="Agents" class="centered-input" variant="outlined"
                  prepend-inner-icon="mdi mdi-flask" placeholder="SMILES" data-cy="reagents" hide-details clearable
                  rounded="pill">
                  <template v-slot:append-inner>
                    <draw-button v-model:smiles="reagents" />
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center justify-center" style="width: 100%"
              v-if="mode === 'context' && contextModel === 'neuralnetworkv2' && !!reagents">
              <v-col cols="12" class="d-flex justify-center">
                <smiles-image :smiles="reagents" width="300"></smiles-image>
              </v-col>
            </v-row>

            <v-row class="d-flex align-center justify-center" style="width: 100%" v-if="!!reagents || !!solvent">
              <v-col cols="6" class="d-flex justify-center">
                <smiles-image :smiles="reagents" width="300"
                  v-if="!!reagents && mode === 'forward' || !!reagents && mode === 'impurity' || !!reagents && mode === 'selectivity'"></smiles-image>
              </v-col>
              <v-col cols="6" class="d-flex justify-center">
                <smiles-image :smiles="solvent" width="300"
                  v-if="!!solvent && mode === 'forward' || !!solvent && mode === 'impurity' || !!solvent && mode === 'selectivity'"></smiles-image>
              </v-col>
            </v-row>


            <v-row align="center" justify-start>
              <v-col>
                <v-btn type="submit" variant="flat" color="success" class="mr-5" data-cy="submit-button">
                  Get Results
                </v-btn>
                <v-menu location="bottom" id="tb-submit-settings" :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-tooltip v-if="mode === 'context'" location="bottom"
                      :text="`Current Model: ${contextModel === 'neuralnetwork' ? 'Neural Network' : contextModel === 'neuralnetworkv2' ? 'QUARC' : contextModel}`">
                      <template v-slot:activator="{ props: tprops }"><v-btn data-cy="model" color="primary"
                          append-icon="mdi mdi-menu-down" variant="flat" v-bind="{ ...props, ...tprops }"
                          class="mr-5">Model</v-btn></template>
                    </v-tooltip>
                  </template>
                  <v-list v-model="contextModel" min-width="200px">
                    <v-list-item @click="updateContextModel('neuralnetwork')">
                      <v-list-item-title>
                        <v-icon v-if="contextModel === 'neuralnetwork'" icon="mdi-check"></v-icon>
                        Neural Network
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="updateContextModel('neuralnetworkv2')">
                      <v-list-item-title>
                        <v-icon v-if="contextModel === 'neuralnetworkv2'" icon="mdi-check"></v-icon>
                        QUARC
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-btn prepend-icon="mdi-cog" v-show="mode != 'sites'" @click="dialog = !dialog" variant="flat" data-cy="settings"
                  color="info" class="mr-5">
                  Settings
                </v-btn>
                <v-btn variant="tonal" data-cy="clear-button" @click="clear()">
                  Clear Results
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-sheet>


        <v-window v-model="tab" class="elevation-2 my-6" :touch="false">
          <v-window-item value="context" rounded="lg">
            <ConditionRecommendation value="context" rounded="lg" :results="contextResults" :models="contextModel"
              :pending="pendingTasks" :pendingRank="pendingRank" :evaluating="evaluating" @go-to-forward="goToForward"
              :score="reactionScore" @evaluate="evaluate" />
          </v-window-item>
          <v-window-item value="forward">
            <SynthesisPrediction value="forward" rounded="lg" :results="forwardResults" :models="forwardModel"
              :pending="pendingTasks" @download-forward="downloadForwardResults" @go-to-impurities="goToImpurity"
              :filename.sync="forwardFileName" @update:filename="forwardUpdateFilename"
              @go-to-selectivity="goToSelectivity" />
          </v-window-item>
          <v-window-item value="impurity">
            <ImpurityPrediction value="impurity" rounded="lg" :results="impurityResults" :pending="pendingTasks"
              :filename.sync="impurityFileName" @update:filename="impurityUpdateFilename" :progress="impurityProgress"
              @download-impurity="downloadImpurityResults" />
          </v-window-item>
          <v-window-item value="selectivity">
            <Regioselectivity value="selectivity" rounded="lg" :results="selectivityResults" :pending="pendingTasks"
              :filename.sync="selectivityFileName" @update:filename="selectivityUpdateFileName"
              @download-selectivity="downloadSelectivityResults" />
          </v-window-item>
          <v-window-item value="sites">
            <SiteSelectivity value="sites" rounded="lg" :results="filteredResults" ref="ssref" :pending="pendingTasks"
              @get-sites-refs="getSitesRefs" @update-selected-atoms="$event => siteSelectedAtoms = $event"
              @update-result-query="$event => siteResultsQuery = $event" :siteResults="siteResults"
              @download-sites-refs="downloadSitesRefs" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog" max-width="600px" class="justify-center align-center">
      <v-card class="pa-3 m-5">
        <template v-if="openSettingsPanel === 'condition-settings'">
          <v-card-title class="headline">
            Condition recommender settings
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-select label="Condition recommendation model" density="comfortable" variant="outlined" hide-details data-cy="settings-cond-rec-model"
                  clearable v-model="contextModel"
                  :items="[{ key: 'neuralnetwork', title: 'Neural Network' }, { key: 'neuralnetworkv2', title: 'QUARC (Quantity Prediction)' }]"
                  item-text="title" item-value="key">
                </v-select>
              </v-col>

              <!-- Temporarily removed: Neural Network v2 model type selector -->
              <!--
              <v-col cols="12" v-if="contextModel === 'neuralnetworkv2'">
                <v-select label="Neural Network v2 model type" density="comfortable" variant="outlined" hide-details
                  clearable v-model="contextV2ModelType"
                  :items="[{ key: 'graph', title: 'Graph' }, { key: 'fp', title: 'Fingerprint (small)' }]"
                  item-text="title" item-value="key"></v-select>
              </v-col>
              -->

              <!-- Temporarily removed: Neural Network v2 dataset version selector -->
              <!--
              <v-col cols="12" v-if="contextModel === 'neuralnetworkv2'">
                <v-select label="Neural Network v2 dataset version" density="comfortable" variant="outlined"
                  hide-details clearable v-model="contextV2ModelVersion" :items="['20191118']"></v-select>
              </v-col>
              -->

              <v-col cols="12">
                <v-text-field label="Num. results" prepend-inner-icon="mdi mdi-flask" density="comfortable" data-cy="settings-num-results"
                  variant="outlined" placeholder="How many condition recommendation results to return?" hide-details
                  clearable type="number" v-model="numContextResults"></v-text-field>
              </v-col>

            </v-row>
          </v-card-text>
        </template>
        <template v-if="openSettingsPanel === 'forward-settings'">
          <v-card-title class="headline">
            Forward predictor settings
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-select label="Forward prediction model" v-model="forwardModel" density="comfortable" hide-details data-cy="settings-forward-prediction-model"
                  clearable variant="outlined" :items="forwardModels"></v-select>
              </v-col>

              <v-col cols="12">
                <v-select label="Forward model training set" v-model="forwardModelTrainingSet" density="comfortable" data-cy="settings-forward-model-training-set"
                  hide-details clearable variant="outlined" :items="forwardModelTrainingSets"></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field label="Num. results" placeholder="How many forward prediction results to return?" data-cy="settings-forward-model-num-results"
                  prepend-inner-icon="mdi mdi-flask" hide-details clearable density="comfortable" variant="outlined"
                  type="number" v-model="numForwardResults"></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </template>
        <template v-if="openSettingsPanel === 'impurity-settings'">
          <v-card-title class="headline">
            Forward Inspector
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-select label="Forward prediction model" v-model="forwardModel" density="comfortable" hide-details data-cy="settings-impurities-model"
                  clearable variant="outlined" :items="forwardModels"></v-select>
              </v-col>

              <v-col cols="12">
                <v-select label="Forward model training set" v-model="forwardModelTrainingSet" density="comfortable" data-cy="settings-impurities-training-set"
                  hide-details clearable variant="outlined" :items="forwardModelTrainingSets"></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field label="Top-k from forward prediction" density="comfortable" variant="outlined" data-cy="settings-impurities-top-k"
                  hide-details clearable
                  placeholder="How many of the top forward prediction products should be included in impurity prediction?"
                  type="number" v-model="impurityTopk"></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field label="Inspection threshold" placeholder="Threshold for filtering out bad reactions." data-cy="settings-impurities-threshold"
                  density="comfortable" variant="outlined" hide-details clearable type="number"
                  v-model="inspectionThreshold"></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-select label="Inspector Score Selection" placeholder="Select inspector scorer to use." data-cy="settings-impurities-inspector-selection"
                  density="comfortable" variant="outlined" hide-details clearable v-model="inspectionModel"
                  :items="['Forward inspector', 'Reaxys inspector']"></v-select>
              </v-col>
              <v-col cols="12">
                <v-switch label="Use atom mapping" placeholder="Whether to use atom mapping to check reaction modes." id="settings-impurities-atom-mapping" data-cy="settings-impurities-atom-mapping"
                  v-model="impurityCheckMapping" color="primary"></v-switch>
              </v-col>
            </v-row>
          </v-card-text>
        </template>
        <template v-if="openSettingsPanel === 'selectivity-settings'">
          <v-card-title class="headline">
            Forward Inspector
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-switch :label="`Do not map reagents: ${absoluteReagents ? 'yes' : 'no'}`"
                  hint="Reagents do not provide any atom to the product." v-model="absoluteReagents" color="primary">
                </v-switch>
              </v-col>
            </v-row>
          </v-card-text>
        </template>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Ok" @click="dialog = false" variant="tonal" data-cy="ok-btn"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch, reactive, nextTick } from 'vue'
import { useRouter, useRoute } from "vue-router";
import { API } from "@/common/api";
import SmilesImage from "@/components/SmilesImage";
import ConditionRecommendation from "@/views/forward/tab/ConditionRecommendation.vue"
import SynthesisPrediction from "@/views/forward/tab/SynthesisPrediction.vue"
import ImpurityPrediction from "@/views/forward/tab/ImpurityPrediction.vue"
import Regioselectivity from "@/views/forward/tab/Regioselectivity.vue"
import SiteSelectivity from "@/views/forward/tab/SiteSelectivity.vue"
import { saveAs } from 'file-saver';
import { useConfirm } from 'vuetify-use-dialog';
import { createReaxysQuery } from "@/common/reaxys";
import { copyToClipboard } from "@/common/utils";
import DrawButton from "@/components/DrawButton"

const route = useRoute();
const router = useRouter();
const tab = ref("");
const dialog = ref(false)
const contextModel = ref('neuralnetwork');
const modelStatus = ref([]);
const reactants = ref('');
const product = ref('');
const reagents = ref('');
const solvent = ref('');
const contextResults = ref([]);
// const contextV2ModelType = ref('fp');
// const contextV2ModelVersion = ref('20191118');
const forwardModel = ref('wldn5');
const forwardModelTrainingSet = ref("pistachio");
const numContextResults = ref(10);
const numForwardResults = ref(100);
const impurityTopk = ref(3);
const inspectionThreshold = ref(0.1);
const inspectionModel = ref('Reaxys inspector');
const impurityCheckMapping = ref(true);
const absoluteReagents = ref(false);
const atomMappingModel = ref('Transformer')
const forwardResults = ref([])
const selectivityResults = ref([])
const selectivityModel = ref('GNN')
const pendingTasks = ref(0)
const reactionScore = ref(null)
const evaluating = ref(false)
const impurityResults = ref([]);
const impurityProgress = ref({
  percent: 0,
  message: ''
});
const openSettingsPanel = ref(null)
const createConfirm = useConfirm();
const siteResults = ref([])
const siteResultsQuery = ref('')
const siteSelectedAtoms = ref([])
const pendingRank = ref(0)
const forwardFileName = ref('forward.csv');
const impurityFileName = ref('impurity.csv');
const selectivityFileName = ref('selectivity.csv');
const ssref = ref(null)

const filteredResults = computed(() => {
  return sortSiteResults(siteResults.value.filter((result) => {
    return result.task.includes(siteResultsQuery.value) && checkFilter(result)
  }))
})

const checkFilter = (result) => {
  if (!siteSelectedAtoms.value.length) {
    return true;
  }
  let reactingAtoms = result['atom_scores'].reduce((accum, score, index) => {
    if (Math.round(score * 100) > 5) {
      accum.push(index);
    }
    return accum;
  }, []);

  return reactingAtoms.some(element => siteSelectedAtoms.value.includes(element));
}

const sortSiteResults = (results) => {
  if (!siteSelectedAtoms.value.length) {
    return results;
  }
  return results.sort((a, b) => {
    return b['atom_scores'][siteSelectedAtoms.value[0]] - a['atom_scores'][siteSelectedAtoms.value[0]];
  });
}

const downloadSitesRefs = (result) => {
  let blob = new Blob([createReaxysQuery(result.references)], { type: 'data:text/json;charset=utf-8' });
  saveAs(blob, 'reaxys_query.json');
}

const getSitesRefs = async (index) => {
  try {
    const response = await API.get(`/api/selectivity/refs/${index}`, null, false);
    siteResults.value[index].references = response.references;
  } catch (error) {
    console.error(error);
  }
};

const forwardUpdateFilename = (newFilename) => {
  forwardFileName.value = newFilename;
};

const impurityUpdateFilename = (newFilename) => {
  impurityFileName.value = newFilename;
};
const selectivityUpdateFileName = (newFilename) => {
  selectivityFileName.value = newFilename;
};

watch(tab, () => {
  switch (tab.value) {
    case 'context':
      openSettingsPanel.value = 'condition-settings'
      break
    case 'forward':
      openSettingsPanel.value = 'forward-settings'
      break
    case 'impurity':
      openSettingsPanel.value = 'impurity-settings'
      break
    case 'selectivity':
      openSettingsPanel.value = 'selectivity-settings'
      break
    default:
      openSettingsPanel.value = null;
  }
})

const constructFastFilterPostData = () => {
  return {
    "smiles": [
      reactants.value,
      product.value
    ]
  }
}

const updateContextModel = (newModel) => {
  contextResults.value = []
  contextModel.value = newModel
}

const evaluate = async () => {
  if (evaluating.value) {
    return;
  }
  clearEvaluation()
  pendingRank.value++;
  evaluating.value = true;
  const postData = constructFastFilterPostData();

  contextResults.value.forEach((index) => {
    evaluateIndex(index)
  })

  try {
    const output = await API.runCeleryTask('/api/fast-filter/call-async', postData);
    reactionScore.value = output.result.score;
  } catch (error) {
    console.error("An error occurred during evaluation:", error);
  } finally {
    evaluating.value = false;
    pendingRank.value--
  }

};

const clearEvaluation = () => {
  reactionScore.value = null;
  for (let res of contextResults.value) {
    res.evaluation = undefined;
  }
};

const evaluateIndex = async (index) => {
  pendingRank.value++;

  contextResults[index].evaluating = true;

  let reagents = contextResults[index]['reagent'];
  if (contextResults.value[index].catalyst) {
    if (reagents) {
      reagents += '.';
    }
    reagents += contextResults.value[index].catalyst;
  }

  let solvent = contextResults.value[index].solvent;
  const postData = constructForwardPostData(reagents, solvent);
  try {
    const output = await API.runCeleryTask('/api/forward/controller/call-async', postData);
    for (let i = 0; i < output.length; i++) {
      const outcome = output[i];
      if (outcome.smiles === product.value) {
        contextResults.value[index].evaluation = i + 1;
        break;
      }
    }
    if (!contextResults.value[index].evaluation) {
      contextResults.value[index].evaluation = 0;
    }
    contextResults.value[index].evaluating = false;

  } catch (error) {
    console.error("An error occurred while evaluating the index:", error);
  } finally {
    pendingRank.value--;
  }
}


const modes = ref({
  0: 'context',
  1: 'forward',
  2: 'impurity',
  3: 'selectivity',
  4: 'sites'
})
const activeTab = ref(0);

const tabs = ref({
  context: 0,
  forward: 1,
  impurity: 2,
  selectivity: 3,
  sites: 4,
})

const changeMode = (mode) => {
  activeTab.value = tabs.value[mode];
}

const mode = computed(() => {
  return modes.value[activeTab.value]
})

const forwardModels = computed(() => {
  const models = new Set();
  const types = ["forward_augmented_transformer", "forward_graph2smiles", "forward_wldn5"];

  modelStatus.value
    .filter(item => types.includes(item['name']) && item['ready'])
    .forEach(item => {
      let modelName = item['name'].replace('forward_', '');
      models.add(modelName);
    });

  return Array.from(models).sort();
});

const goToForward = (index) => {
  canonicalizeAll()
    .then(() => {
      const context = contextResults.value[index];
      let reagentsValue = '';
      if (context['reagent']) {
        reagentsValue += context['reagent'];
      }
      if (context['catalyst']) {
        reagentsValue += '.' + context['catalyst'];
      }
      reagents.value = reagentsValue;
      if (context['solvent']) {
        solvent.value = context['solvent'];
      }
      changeMode('forward');
      tab.value = 'forward';
      router.push({
        path: '/forward',
        query: {
          tab: 'forward'
        }
      })
      forwardPredict();
    });
};


const goToImpurity = (index) => {
  canonicalizeAll()
    .then(() => {
      product.value = index;
      changeMode('impurity');
      tab.value = 'impurity';
      router.push({
        path: '/forward',
        query: {
          tab: 'impurity'
        }
      })
      impurityPredict();
    });
};

const goToSelectivity = (index) => {
  canonicalizeAll()
    .then(() => {
      product.value = index
      changeMode('selectivity')
      tab.value = 'selectivity';
      router.push({
        path: '/forward',
        query: {
          tab: 'selectivity'
        }
      })
      selectivityPredict()
    })
}

const forwardModelTrainingSets = computed(() => {
  const sets = new Set();
  let modelNameWithPrefix = forwardModel.value.replace('', 'forward_');
  modelStatus.value
    .filter(item => item.name.startsWith(modelNameWithPrefix) && item.ready)
    .forEach(item => {
      if (Array.isArray(item.available_model_names)) {
        item.available_model_names.forEach(modelName => {
          sets.add(modelName);
        });
      }
    });

  return Array.from(sets).sort();
});

watch(forwardModel, () => {
  if (forwardModelTrainingSets.value.length > 0) {
    forwardModelTrainingSet.value = forwardModelTrainingSets.value[0];
  } else {
    forwardModelTrainingSet.value = null;
  }
});

const replaceRoute = (tab) => {
  router.replace({ path: '/forward', query: { tab } })
}

const predict = async () => {
  pendingTasks.value++
  try {
    await canonicalizeAll()
    switch (mode.value) {
      case 'context':
        clearContext()
        contextPredict()
        break
      case 'forward':
        clearForward()
        forwardPredict()
        break
      case 'impurity':
        clearImpurity()
        impurityPredict()
        break
      case 'selectivity':
        clearSelectivity()
        selectivityPredict()
        break
      case 'sites':
        clearSites()
        sitesPredict()
        break
      default:
        createConfirm({ title: 'Alert', content: "Unsupported Mode.", dialogProps: { width: "60%" } })
        alert('unsupported mode')
    }
  } finally {
    pendingTasks.value--
  }
}

const clearInputs = () => {
  reactants.value = '';
  product.value = '';
  reagents.value = '';
  solvent.value = '';
}

const clear = async () => {

  const isConfirmed = await createConfirm({
    title: 'Please Confirm',
    content: 'This will clear all of your current results. Continue anyway?',
    dialogProps: { width: "auto" }
  });
  if (!isConfirmed) {
    return;
  }

  switch (tab.value) {
    case 'forward':
      clearForward()
      clearInputs()
      break;
    case 'context':
      clearContext()
      clearInputs()
      break;
    case 'impurity':
      clearImpurity()
      clearInputs()
      break;
    case 'selectivity':
      clearSelectivity()
      clearInputs()
      break;
    case 'sites':
      clearSites()
      clearInputs()
      break;
    default:
      createConfirm({ title: 'Alert', content: "Unsupported Mode.", dialogProps: { width: "60%" } })
    // alert('unsupported mode')
  }
}

watch(route, async (newRoute, _oldRoute) => {
  if (newRoute.path === '/forward') {
    tab.value = newRoute.query.tab
    updateFromURL();
  }
})

const clearForward = () => {
  forwardResults.value = []
}

const clearSelectivity = () => {
  selectivityResults.value = []
}

const constructSelectivityPostData = () => {
  const data = reactive({
    reactants: reactants.value,
    product: product.value,
    mapper: atomMappingModel.value,
    no_map_reagents: absoluteReagents.value,
    mode: selectivityModel.value
  })

  if (reagents.value) {
    data.reagents = reagents.value
  } else {
    data.reagents = ""
  }

  if (solvent.value) {
    data.solvent = solvent.value
  } else {
    data.solvent = ""
  }

  return data
}

const selectivityPredict = () => {
  pendingTasks.value++
  const postData = constructSelectivityPostData()

  return API.runCeleryTask('/api/legacy/general-selectivity/', postData)
    .then(output => {
      selectivityResults.value = output
    })
    .catch(error => {
      const errorData = JSON.parse(error.message);
      if (errorData && errorData.output) {
        createConfirm({ title: 'Error', content: 'Error running selectivity prediction: Regioselectivity is not applicable for the given reaction.', dialogProps: { width: "60%" } })
      }
    })
    .finally(() => {
      pendingTasks.value--
    })
}

const clearImpurity = () => {
  impurityResults.value = [];
  impurityProgress.value = {
    percent: 0,
    message: ''
  };
}

const impurityPredict = () => {
  pendingTasks.value++;
  impurityResults.value = [];

  let postData = constructImpurityPostData();

  let complete = (output) => {
    impurityProgress.value.percent = 1.0;
    impurityProgress.value.message = 'Prediction complete!';
    impurityResults.value = output['result']['predict_expand'];
  };

  let progress = (json) => {
    impurityProgress.value.percent = json['percent'];
    impurityProgress.value.message = json['message'];
  };

  let failed = (error) => {
    console.error('Error encountered during impurity prediction:', error);
    impurityProgress.value.percent = 0.0;
    impurityProgress.value.message = 'Impurity prediction failed!';
  };

  API.runCeleryTask('/api/impurity-predictor/call-async', postData, progress)
    .then(output => {
      complete(output);
    })
    .catch(error => {
      failed(error);
    })
    .finally(() => {
      pendingTasks.value--;
    });
}


const constructImpurityPostData = () => {
  let data = {
    rct_smi: reactants.value,
    predictor_model_name: forwardModelTrainingSet.value,
    predictor_backend: forwardModel.value,
    topn_outcome: impurityTopk.value,
    check_mapping: impurityCheckMapping.value,
    insp_threshold: inspectionThreshold.value,
    inspector: inspectionModel.value,
    atom_map_backend: "indigo",
  };

  if (product.value) {
    data.prd_smi = product.value;
  }

  if (reagents.value) {
    data.rea_smi = reagents.value;
  }

  if (solvent.value) {
    data.sol_smi = solvent.value;
  }

  return data;
}

const updateFromURL = () => {
  let urlParams = new URLSearchParams(window.location.search);
  let mode = urlParams.get('tab');
  if (mode) {
    tab.value = mode
    changeMode(mode);
  }
  let rxnsmiles = urlParams.get('rxnsmiles');
  if (rxnsmiles) {
    const split = rxnsmiles.split('>>');
    reactants.value = split[0];
    product.value = split[split.length - 1];
  }
  if (urlParams.get('reactants')) {
    reactants.value = urlParams.get('reactants');
  }
  if (urlParams.get('product')) {
    product.value = urlParams.get('product');
  }
  if (urlParams.get('reagents')) {
    reagents.value = urlParams.get('reagents');
  }
  if (urlParams.get('solvent')) {
    solvent.value = urlParams.get('solvent');
  }
};

onMounted(() => {
  API.get('/api/admin/get-backend-status', null, false)
    .then(json => {
      modelStatus.value = json['modules'];
    });
  updateFromURL();
  if (reactants.value) {
    predict();
  }
});

const forwardPredict = async () => {
  pendingTasks.value++;
  forwardResults.value = [];

  if (reactants.value.length < 4) {
    createConfirm({ title: 'Error', content: 'Please enter a reactant with at least 4 atoms.', dialogProps: { width: "60%" } })
    pendingTasks.value--;
    return;
  }
  const postData = constructForwardPostData(reagents.value, solvent.value);
  try {
    const output = await API.runCeleryTask('/api/forward/controller/call-async', postData);
    forwardResults.value = output.result[0];

  } catch (error) {
    console.error('Error in forward prediction:', error);
  } finally {
    pendingTasks.value--;
  }
};

const constructForwardPostData = (reagents, solvent) => {
  let data = reactive({
    smiles: [reactants.value],
    backend: forwardModel.value,
    model_name: forwardModelTrainingSet.value,
  });

  if (reagents) {
    data.reagents = reagents;
  }
  if (solvent) {
    data.solvent = solvent;
  }

  return data;
}

const canonicalize = async (smiles, input) => {
  return API.post('/api/rdkit/canonicalize', { smiles: smiles })
    .then(json => {
      if (input === 'reactants') {
        reactants.value = json.smiles
      } else if (input === 'product') {
        product.value = json.smiles
      } else if (input === 'reagents') {
        reagents.value = json.smiles
      } else if (input === 'solvent') {
        solvent.value = json.smiles
      }
    })
}
const canonicalizeAll = () => {
  let promises = []

  const properties = {
    reactants: reactants.value,
    product: product.value,
    reagents: reagents.value,
    solvent: solvent.value,
  }

  for (let smi in properties) {
    if (properties[smi]) {
      promises.push(canonicalize(properties[smi], smi))
    }
  }
  return Promise.all(promises)
}
const clearContext = () => {
  contextResults.value = []
  reactionScore.value = null
}

const contextPredict = () => {
  switch (contextModel.value) {
    case 'neuralnetwork':
      contextV1Predict()
      break
    case 'neuralnetworkv2':
      contextV2Predict()
      break
    default:
      // alert('unsupported context model')
      createConfirm({ title: 'Alert', content: 'unsupported context model', dialogProps: { width: "60%" } })
  }
}

const contextV1Predict = async () => {
  pendingTasks.value++;
  contextResults.value = []
  evaluating.value = false
  let postData = constructContextV1PostData()
  if (reactants.value.length < 4) {
    createConfirm({ title: 'Error', content: 'Please enter a reactant with at least 4 atoms.', dialogProps: { width: "60%" } })
    pendingTasks.value--;
    return;
  }
  API.runCeleryTask('/api/legacy/context/', postData)
    .then(output => {
      contextResults.value = output
    })
    .finally(() => {
      pendingTasks.value--;
    })
}
const constructContextV1PostData = () => {
  return {
    reactants: reactants.value,
    products: product.value,
    with_smiles: false,
    return_scores: false,
    num_results: numContextResults.value
  }
}

const parseRangeMin = (rangeString) => {
  if (!rangeString || typeof rangeString !== 'string') return null;
  const numbers = rangeString.match(/[-+]?\d*\.?\d+/g);
  if (!numbers || numbers.length === 0) return null;
  const lower = parseFloat(numbers[0]);
  return isFinite(lower) ? lower : null;
};

const postprocessContextV2 = (output) => {
  const predictions = output && output.result ? output.result.predictions : [];

  if (!Array.isArray(predictions) || predictions.length === 0) {
    createConfirm({ title: 'Alert', content: 'Could not generate condition recommendations for this reaction. Please try a different model.', dialogProps: { width: "60%" } })
    contextResults.value = [];
    return;
  }

  const processedResults = predictions.map((prediction) => {
    const reactantsMap = {};
    (prediction.reactant_amounts || []).forEach((entry) => {
      reactantsMap[entry.reactant] = parseRangeMin(entry.amount_range);
    });

    const reagentsMap = {};
    (prediction.agent_amounts || []).forEach((entry) => {
      reagentsMap[entry.agent] = parseRangeMin(entry.amount_range);
    });

    return {
      temperature: parseRangeMin(prediction.temperature),
      reactants: reactantsMap,
      reagents: reagentsMap,
      reagent: (prediction.agents || []).join('.'),
      score: prediction.score,
    };
  });

  contextResults.value = processedResults;
};

const contextV2Predict = () => {
  pendingTasks.value++;
  contextResults.value = [];
  evaluating.value = false;
  const postData = constructContextV2PostData();
  API.runCeleryTask('/api/context/quarc/single-query/call-async', postData)
    .then((output) => {
      postprocessContextV2(output);
    })
    .finally(() => {
      pendingTasks.value--;
    });
};

const constructContextV2PostData = () => {
  const payload = {
    reactants: reactants.value,
    products: product.value,
    num_results: numContextResults.value,
    model: 'graph',
  };

  payload.reagents = reagents.value ? [reagents.value] : [];
  return payload;
};

const downloadImpurityResults = () => {
  if (!impurityResults.value.length) {
    createConfirm({ title: 'Alert', content: 'There are no impurity predictor results to download!', dialogProps: { width: "60%" } })
    // alert('There are no impurity predictor results to download!');
    return;
  }
  let downloadData = 'No.,reactantData,productData,reagentData,solventData,SMILES,Mechanism,InspectorScore,SimilarityScore,MolWt\n';

  let reactantData = reactants.value;
  let productData = product.value;
  let reagentData = reagents.value;
  let solventData = solvent.value;

  impurityResults.value.forEach((res) => {
    let modesName = `"${res.modes_name}"`;
    downloadData += `${res.no},${reactantData},${productData},${reagentData},${solventData},${res.prd_smiles},${modesName},${res.avg_insp_score},${res.similarity_to_major},${res.prd_mw}\n`;
  });
  const blob = new Blob([downloadData], { type: 'data:text/csv;charset=utf-8' });
  saveAs(blob, impurityFileName.value);
};


const downloadSelectivityResults = () => {
  if (!selectivityResults.value) {
    createConfirm({ title: 'Alert', content: 'There are no regio-selectivity results to download!', dialogProps: { width: "60%" } })
    // alert('There are no regio-selectivity results to download!')
  }
  let downloadData = 'Rank,SMILES,Probability\n'
  selectivityResults.value.forEach((res) => {
    downloadData += `${res.rank},${res.smiles},${res.prob}\n`
  })
  let blob = new Blob([downloadData], { type: 'data:text/csv;charset=utf-8' })
  saveAs(blob, selectivityFileName.value)
};

const downloadForwardResults = () => {
  if (!forwardResults.value.length) {
    // alert('There are no forward predictor results to download!');
    createConfirm({ title: 'Alert', content: 'There are no forward predictor results to download!', dialogProps: { width: "60%" } })
    return;
  }
  let downloadData = 'Rank,SMILES,Probability,Score,MolWt\n';
  forwardResults.value.forEach((res) => {
    downloadData += `${res.rank},${res.outcome},${res.prob},${res.score},${res.mol_wt}\n`;
  });
  const blob = new Blob([downloadData], { type: 'data:text/csv;charset=utf-8' });
  saveAs(blob, forwardFileName.value);
};

const clearSites = () => {
  siteResults.value = [];
  siteSelectedAtoms.value = [];
};

const sitesPredict = () => {
  pendingTasks.value++
  const postData = constructSiteSelectivityPostData()
  API.runCeleryTask('/api/legacy/selectivity/', postData)
    .then(output => {
      siteResults.value = output
    })
    .finally(async () => {
      pendingTasks.value--
      await nextTick()
      ssref.value.ketcherMinRef.setSmiles(reactants.value)
    })
}

const constructSiteSelectivityPostData = () => {
  return {
    smiles: reactants.value
  }
}
</script>
