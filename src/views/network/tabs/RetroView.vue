<template>
    <v-container fluid>
        <v-row class="justify-center align-center">
            <v-col cols="12" md="6" data-cy="retro-left-panel">
                <v-sheet elevation="2" class="pa-5" rounded="lg">
                    <v-text-field id="retro-target" v-model="target" density="compact" variant="outlined" label="Target"
                        placeholder="SMILES" type="text" clearable hide-details class="target-input" rounded="pill">
                        <template v-slot:prepend-inner v-if="enableResolver">
                            <v-btn icon="mdi mdi-server" :class="allowResolve ? 'text-green' : 'text-grey'"
                                @click="toggleResolver" variant="flat">
                            </v-btn>
                        </template>
                        <template v-slot:append-inner>
                            <draw-button v-model:smiles="target" />
                        </template>
                    </v-text-field>
                    <smiles-image :smiles="target" height="100px" v-if="!!target" class="my-3"></smiles-image>
                    <v-select id="retro-model-0" label="Model" :items="models" v-model="settings.model"
                        variant="outlined" density="compact" hide-details class="my-3" data-cy="retro-model"
                        rounded="pill"></v-select>
                    <v-select id="retro-training-set-0" label="Training Set" :items="trainingSets"
                        v-model="settings.trainingSet" variant="outlined" density="compact" hide-details class="my-3"
                        data-cy="retro-training-set" rounded="pill"></v-select>
                    <div class="text-center">
                        <v-btn variant="flat" color="success" @click="runRetro()" :disabled="!target || !validSmiles"
                            data-cy="retro-submit">Submit</v-btn>
                        <v-btn variant="outlined" class="ml-2" :disabled="!target || !validSmiles"
                            @click="showAdvSettings = true" data-cy="retro-advanced">Advanced</v-btn>
                    </div>
                </v-sheet>
            </v-col>
            <v-col cols="12" md="6" data-cy="retro-right-panel">
                <v-sheet elevation="2" v-if="Object.keys(predictions).length" rounded="lg">
                    <v-carousel height="300" hide-delimiters :continuous="false" v-model="carouselSlide">
                        <v-carousel-item v-for="(item, index) in predictions" :key="index">
                            <div class="mx-auto d-flex justify-center align-center" style="height:100%">
                                <v-card width="400" variant="outlined" :id="'prediction-card-' + (index)">
                                    <template v-slot:title>
                                        <div class="d-flex justify-space-between align-center">
                                            <div v-if="item.edit" style="width:100%" class="mr-2 mt-2 mb-2">
                                                <v-text-field label="Label" v-model="labels[index]" variant="outlined"
                                                    :id="'retro-pred-card-type-' + (index)" @blur="item.edit = false"
                                                    @keyup.enter="item.edit = false" hide-details></v-text-field>
                                            </div>
                                            <div v-else class="d-flex align-items-baseline ml-3">
                                                <h4>{{ labels[index] }}</h4>
                                                <v-icon size="small" icon="mdi mdi-pencil" @click="item.edit = true"
                                                    :data-cy="'retro-pred-card-edit-button-' + (index)"
                                                    class="ml-2"></v-icon>
                                            </div>
                                            <v-progress-circular v-if="item.loading" color="primary" indeterminate
                                                :width="5"></v-progress-circular>
                                        </div>
                                    </template>
                                    <v-card-text>
                                        <v-table>
                                            <thead>
                                                <tr>
                                                    <th class="text-left">
                                                        Model
                                                    </th>
                                                    <th class="text-left">
                                                        Training Set
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{{ item.model }}</td>
                                                    <td>{{ item.trainingSet }}</td>
                                                </tr>
                                            </tbody>
                                        </v-table>
                                        <div class="d-flex justify-space-between align-center">
                                            <v-checkbox-btn v-model="item.show" label="Show in Table"
                                                :data-cy="'retro-pred-card-show-in-table-' + (index)"></v-checkbox-btn>
                                            <v-btn v-if="item.model === 'template_relevance'" variant="plain"
                                                :data-cy="'retro-pred-card-view-settings-' + (index)"
                                                @click="viewSettings(item)">View
                                                all settings</v-btn>
                                            <v-btn variant="tonal" density="compact" color="error"
                                                :data-cy="'retro-pred-card-delete-' + (index)"
                                                @click="deleteResult(index)" icon="mdi-delete"></v-btn>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </div>
                        </v-carousel-item>
                    </v-carousel>
                    <div class="d-flex justify-end pa-3 ">
                        <v-btn variant="flat" color="primary" class="justify-end mr-2"
                            data-cy="retro-see-all-predictions" @click="allPredictionsDialog = true">See All
                            Predictions</v-btn>
                        <v-btn variant="tonal" class="justify-end" @click="clear()" data-cy="retro-clear-all">Clear
                            All</v-btn>
                    </div>
                </v-sheet>
                <v-sheet v-else elevation="2" class="d-flex justify-center align-center flex-column text-center pa-5"
                    rounded="lg">
                    <v-img :width="400" cover :src="emptyVoid" class="mb-3"></v-img>
                    <h2>No Predictions</h2>
                    <p class="text-body-1">Begin by running a new prediction on the left!</p>
                </v-sheet>
            </v-col>
        </v-row>
        <v-row v-if="Object.keys(results).length" data-cy="retro-results">
            <v-col cols="12">
                <v-sheet elevation="2" rounded="lg">
                    <v-data-table :headers="headers" :items="tableItems" item-value="smiles" class="elevation-2"
                        ref="retroResultTable" :fixed-header="true">
                        <template v-for="header in headers" v-slot:[`item.${header.key}`]="{ item }">
                            <div v-if="header.key === 'smiles'">
                                <smiles-image :smiles="item.smiles" width="100px"></smiles-image>
                                <table>
                                    <template v-if="item[1]">
                                        <tbody>
                                            <tr>
                                                <th>Plausibility</th>
                                                <td>{{ num2str(item[1].reaction_properties.plausibility) }}</td>
                                            </tr>
                                            <tr>
                                                <th>SCScore</th>
                                                <td>{{ num2str(item[1].precursor_properties.scscore) }}</td>
                                            </tr>
                                        </tbody>
                                    </template>
                                </table>
                            </div>
                            <div v-else>
                                <table v-if="item[header.key]" class="text-nowrap">
                                    <tbody :id="'rank-' + item[header.key].rank"> <!-- Add the id tag here -->
                                        <tr> <!-- Add the id tag here -->
                                            <th>Precursor Rank</th>
                                            <td>{{ item[header.key].precursor_rank }}</td>
                                        </tr>
                                        <tr>
                                            <th>Precursor Score</th>
                                            <td>{{ num2str(item[header.key].precursor_score) }}</td>
                                        </tr>
                                        <tr v-if="predictions[header.key]['model'] === 'template_relevance'">
                                            <th>Template Rank</th>
                                            <td>{{ item[header.key].model_metadata[0].source.template.template_rank }}
                                            </td>
                                        </tr>
                                        <tr v-if="predictions[header.key]['model'] === 'template_relevance'">
                                            <th>Template Score</th>
                                            <td>{{
                                                num2str(item[header.key].model_metadata[0].source.template.template_score)
                                                }}
                                            </td>
                                        </tr>
                                        <tr v-if="item[header.key].model_metadata[0].source.template">
                                            <th>Templates</th>
                                            <td>
                                                <template
                                                    v-if="predictions[header.key]['model'] === 'template_relevance'">
                                                    <p v-for="id in item[header.key].model_metadata[0].source.template.tforms"
                                                        :key="id" class="mb-0">
                                                        <a :href="`/template?id=${id}`" target="_blank">{{ id }}</a>
                                                    </p>
                                                </template>
                                                <template v-else>
                                                    <v-btn
                                                        v-for="(template, index) in item[header.key].model_metadata[0].source.template.tforms"
                                                        :key="template" size="small" :class="{ 'ml-1': index > 0 }"
                                                        @click="viewTemplate(template)">
                                                        {{ index + 1 }}
                                                    </v-btn>
                                                </template>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p v-else><strong>Not Predicted</strong></p>
                            </div>
                        </template>
                    </v-data-table>
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>

    <v-dialog v-model="allPredictionsDialog" max-width="450px" max-height="700px" scrollable>
        <v-card>
            <v-card-title class="headline">All Predictions</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" v-for="(item, index) in predictions" :key="index">
                        <div class="justify-center align-center" style="height:100%">
                            <v-card width="400" variant="outlined">
                                <template v-slot:title>
                                    <div class="d-flex justify-space-between align-center">
                                        <div v-if="item.edit" style="width:100%" class="mr-2 mt-2 mb-2">
                                            <v-text-field label="Label" v-model="labels[index]" variant="outlined"
                                                @blur="item.edit = false" @keyup.enter="item.edit = false"
                                                hide-details></v-text-field>
                                        </div>
                                        <div v-else class="d-flex align-items-baseline ml-3">
                                            <h4>{{ labels[index] }}</h4>
                                            <v-icon size="small" icon="mdi mdi-pencil" @click="item.edit = true"
                                                class="ml-2"></v-icon>
                                        </div>
                                        <v-progress-circular v-if="item.loading" color="primary" indeterminate
                                            :width="5"></v-progress-circular>
                                    </div>
                                </template>
                                <v-card-text>
                                    <v-table>
                                        <thead>
                                            <tr>
                                                <th class="text-left">
                                                    Model
                                                </th>
                                                <th class="text-left">
                                                    Training Set
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{{ item.model }}</td>
                                                <td>{{ item.trainingSet }}</td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                    <div class="d-flex justify-space-between align-center">
                                        <v-checkbox-btn v-model="item.show" label="Show in Table"></v-checkbox-btn>
                                        <v-btn v-if="item.model === 'template_relevance'" variant="plain"
                                            @click="viewSettings(item)">View all settings</v-btn>
                                        <v-btn variant="tonal" density="compact" color="error"
                                            @click="deleteResult(index)" icon="mdi-delete"
                                            :id="'retro-model-delete-' + (index)"></v-btn>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="tonal" @click="allPredictionsDialog = false"
                    data-cy="retro-see-all-predictions-ok-btn">OK</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="showAdvSettings" width="500px">
        <v-card>
            <v-card-title>
                Advanced Settings
            </v-card-title>
            <v-card-text>
                <setting-input label="Model" label-for="retro-model-1" data-cy="retro-model-1"
                    help-text="Select the type of retrosynthesis model to use.">
                    <v-select hide-details :items="models" v-model="settings.model" variant="outlined" density="compact"
                        class="my-1"></v-select>
                </setting-input>
                <setting-input label="Training Set" label-for="retro-training-set-1" data-cy="retro-training-set-1"
                    help-text="Select the reaction training set to use for prediction.">
                    <v-select hide-details :items="trainingSets" v-model="settings.trainingSet" variant="outlined"
                        density="compact" class="my-1"></v-select>
                </setting-input>
                <setting-input v-if="settings.model === 'template_relevance'" label="Precursor Scoring"
                    data-cy="retro-precursor-scoring" label-for="retro-precursor-scoring"
                    help-text="Method for re-scoring predicted precursors.">
                    <v-select v-model="settings.precursorScoring" :items="precursorScoringItems" variant="outlined"
                        class="my-1" hide-details density="compact"></v-select>
                </setting-input>
                <setting-input v-if="settings.model === 'template_relevance'" label="Max. num. templates"
                    data-cy="retro-num-templates" label-for="retro-num-templates"
                    help-text="This is the maximum number of reaction rules/templates to try to apply to your target. Depending on the value of maximum cumulative probability (below), a fewer number of templates may actually be applied.">
                    <v-text-field v-model="settings.numTemplates" class="my-1" variant="outlined" density="compact"
                        hide-details></v-text-field>
                </setting-input>
                <setting-input v-if="settings.model === 'template_relevance'" label="Max. cum. prob."
                    data-cy="retro-max-prob" label-for="retro-max-prob"
                    help-text="This is the cumulative template score after which templates will stop being applied to your target.
For example, if the sum of the scores of the top two templates exceeds this value, only those two template application results will be returned.">
                    <v-text-field type="number" min="0" max="1" step="0.000001" v-model.number="settings.maxCumProb"
                        @change="maxCumProb = Math.min(0.99999, maxCumProb)" class="my-1" variant="outlined"
                        density="compact" hide-details></v-text-field>
                </setting-input>
                <setting-input v-if="settings.model === 'template_relevance'" label="Min. plausibility"
                    data-cy="retro-min-plausibility" label-for="retro-min-plausibility"
                    help-text="This is the minimum plausibility that a predictor transformation must receive from the Fast Filter model in order to be kept and returned as a result.
The plausibility score can help filter out bad suggestions, but in some cases can be over conservative and filter out false negatives.">
                    <v-text-field type="number" min="0" max="1" step="0.000001"
                        v-model.number="settings.minPlausibility" class="my-1" variant="outlined" density="compact"
                        hide-details></v-text-field>
                </setting-input>
                <setting-input
                    v-if="settings.model === 'template_relevance' && templateAttributes && templateAttributes[settings.trainingSet] && templateAttributes[settings.trainingSet].length"
                    label="Template attribute filters" data-cy="retro-template-attribute-filters-add-1"
                    help-text="Template attribute filters to use during retrosynthetic prediction. These are attributes that are
defined for each template, and only those templates that satisfy the filter provided here will be considered.
Normally, only the top 'Max. num. templates' will be applied - with these filters, the top 'Max. num. templates' that satisfy the filters will be applied.">
                    <v-btn icon="mdi-plus" variant="flat" color="success" @click="addAttributeFilter" density="compact">
                    </v-btn>
                </setting-input>
                <div class="form-inline mb-2 ml-3" v-for="(filter, idx) in settings.attributeFilter" :key="idx">
                    <v-btn icon="mdi-minus" class="mr-2" color="red" variant="tonal" density="compact"
                        :data-cy="'retro-template-attribute-filters-delete-' + (idx)" @click="deleteAttributeFilter(idx)">
                    </v-btn>
                    <v-select class="mr-2" :items="templateAttributes[settings.trainingSet]" :value="filter.name"
                        :data-cy="'retro-template-attribute-filter-type-' + (idx)"
                        @input="updateAttributeFilter(idx, 'name', $event)"> </v-select>
                    <!-- <v-select class="mr-2" :value="filter.logic" @input="updateAttributeFilter(idx, 'logic', $event)">
                        <b-form-select-option value=">">&gt;</b-form-select-option>
                        <b-form-select-option value=">=">&ge;</b-form-select-option>
                        <b-form-select-option value="<">&lt;</b-form-select-option>
                        <b-form-select-option value="<=">&le;</b-form-select-option>
                        <b-form-select-option value="==">=</b-form-select-option>
                    </v-select> -->
                    <v-text-field class="mr-2" type="number" :value="filter.value"
                        :id="'retro-template-attribute-filter-value-' + (idx)"
                        @input="updateAttributeFilter(idx, 'value', $event)"></v-text-field>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="flat" color="primary" @click="showAdvSettings = false;"
                    data-cy="retro-advanced-save">Save</v-btn>
                <v-btn variant="flat" color="success" @click="() => { showAdvSettings = false; runRetro() }"
                    data-cy="retro-advanced-run">Run</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="showSettingsViewModal" max-width="600px">
        <v-card>
            <v-card-title class="headline">Prediction Settings</v-card-title>
            <v-card-text>
                <v-table>
                    <tbody>
                        <tr>
                            <th class="text-left">Model</th>
                            <td>{{ selectedSettings.model }}</td>
                        </tr>
                        <tr>
                            <th>Training Set</th>
                            <td>{{ selectedSettings.trainingSet }}</td>
                        </tr>
                        <!-- <tr>
                  <th>Model Version</th>
                  <td>{{ selectedSettings.modelVersion }}</td>
                </tr> -->
                        <tr>
                            <th>Precursor Scoring</th>
                            <td>{{ selectedSettings.precursorScoring }}</td>
                        </tr>
                        <tr>
                            <th>Atom Mapper</th>
                            <td>{{ selectedSettings.atomMapper }}</td>
                        </tr>
                        <tr>
                            <th>Max. num. templates</th>
                            <td>{{ selectedSettings.numTemplates }}</td>
                        </tr>
                        <tr>
                            <th>Max. cum. probability</th>
                            <td>{{ selectedSettings.maxCumProb }}</td>
                        </tr>
                        <tr>
                            <th>Min. plausibility</th>
                            <td>{{ selectedSettings.minPlausibility }}</td>
                        </tr>
                        <tr>
                            <th>Template attribute filters</th>
                            <td>
                                <div v-if="selectedSettings.attributeFilter.length">
                                    <p v-for="(filter, index) in selectedSettings.attributeFilter" :key="index">{{
                                        filter.name }} {{ filter.logic }} {{ filter.value }}</p>
                                </div>
                                <span v-else>None</span>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary darken-1" text @click="showSettingsViewModal = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!--
             <b-modal id="retro-advanced-modal" title="Advanced Settings" centered scrollable ok-title="Submit" ok-variant="success" @ok="runRetro()">

      <div class="form-inline mb-2 ml-3" v-for="(filter, idx) in settings.attributeFilter" :key="idx">
        <b-button variant="outline-danger" pill class="mr-2" @click="deleteAttributeFilter(idx)">
          <i class="fas fa-times"></i>
        </b-button>
        <b-form-select class="mr-2" :options="templateAttributes[settings.trainingSet]" :value="filter.name" @input="updateAttributeFilter(idx, 'name', $event)"> </b-form-select>
        <b-form-select class="mr-2" :value="filter.logic" @input="updateAttributeFilter(idx, 'logic', $event)">
          <b-form-select-option value=">">&gt;</b-form-select-option>
          <b-form-select-option value=">=">&ge;</b-form-select-option>
          <b-form-select-option value="<">&lt;</b-form-select-option>
          <b-form-select-option value="<=">&le;</b-form-select-option>
          <b-form-select-option value="==">=</b-form-select-option>
        </b-form-select>
        <b-form-input class="mr-2" type="number" :value="filter.value" @input="updateAttributeFilter(idx, 'value', $event)"></b-form-input>
      </div>
    </b-modal>

    <b-modal v-if="selectedTemplate" v-model="showTemplateInfoModal" title="Template Info" centered size="lg" ok-only>
      <div class="row">
        <div class="col-12">
          <table class="table table-borderless">
            <tr>
              <th>Template:</th>
              <td>
                <copy-tooltip :data="selectedTemplate">
                  <span class="smiles">{{ selectedTemplate }}</span>
                </copy-tooltip>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div v-if="selectedTemplate" class="row">
        <div class="col-12 text-center">
          <smiles-image :smiles="selectedTemplate" input-type="template"></smiles-image>
        </div>
      </div>
    </b-modal>
        -->
</template>

<script>
import { ref, reactive, computed, watch, onMounted, nextTick } from "vue";
import { useConfirm, useSnackbar } from 'vuetify-use-dialog';
import KetcherModal from "@/components/KetcherModal";
import SmilesImage from "@/components/SmilesImage";
import SettingInput from "@/components/network/SettingInput";
import CopyTooltip from "@/components/CopyTooltip";
import { API } from "@/common/api";
import { resolveChemName } from "@/common/resolver";
import { num2str } from "@/common/utils";
import { useSettingsStore } from "@/store/settings";
import emptyVoid from "@/assets/void.svg";
import DrawButton from "@/components/DrawButton"
import { useConfigStore } from "@/store/config";

const defaultSettings = {
    model: "template_relevance",
    trainingSet: "reaxys",
    precursorScoring: "relevance_heuristic",
    atomMapper: "rxnmapper",
    numTemplates: 1000,
    maxCumProb: 0.999,
    minPlausibility: 0.1,
    attributeFilter: [],
};

export default {
    name: "RetroView",
    components: {
        CopyTooltip,
        SettingInput,
        KetcherModal,
        SmilesImage,
        DrawButton
    },
    data() {
        return {
            emptyVoid: emptyVoid,
            showAdvSettings: false,
            precursorScoringItems: [
                { title: "Relevance Heuristic", value: "relevance_heuristic" },
                { title: "SCScore", value: "scscore" }
            ],
            atomMapperItems: [
                { title: "RXNMapper", value: "rxnmapper" },
                { title: "Indigo", value: "indigo" }
            ],
        }
    },
    setup() {
        const createConfirm = useConfirm()
        const createSnackbar = useSnackbar()
        const target = ref("");
        const validSmiles = ref(true);
        const modelStatus = ref([]);
        const templateSets = ref([]);
        const templateAttributes = ref({});
        const settings = reactive(JSON.parse(JSON.stringify(defaultSettings)));
        const predictions = ref({});
        const results = ref({});
        const labels = ref({});
        const selectedSettings = ref(null);
        const showSettingsViewModal = ref(false);
        const selectedTemplate = ref(null);
        const showTemplateInfoModal = ref(false);
        const carouselSlide = ref(0);
        const retroResultTable = ref(null);
        const ketcherRef = ref(null)
        const showKetcher = ref(false)
        const allPredictionsDialog = ref(false)
        const configStore = useConfigStore();

        function hide(key) {
            predictions.value[key].show = false;
        }

        const context = computed(() => JSON.parse(document.getElementById("django-context").textContent));

        const enableResolver = computed({ get: () => configStore.envs.VITE_ENABLE_SMILES_RESOLVER === 'True' });

        const maxIndex = computed(() => {
            const indices = Object.keys(predictions.value).map((val) => Number(val));
            return indices.length > 0 ? Math.max(...indices) : 0;
        });

        const models = computed(() => {
            // List of available models for selection
            const models = new Set(modelStatus.value.filter((item) => item.name.startsWith("retro_") && item.ready).map(item => item.name.replace('retro_', '')));
            return Array.from(models).sort();
        });
        const trainingSets = computed(() => {
            // List of available training sets based on the selected model
            const sets = new Set();
            modelStatus.value.filter((item) => item.name.startsWith("retro_" + settings.model) && item.ready)
                .forEach((item) => {
                    if (settings.model !== "retro_template_relevance") {
                        item.available_model_names.forEach((trainingSet) => sets.add(trainingSet))
                    }
                });
            return Array.from(sets).sort();
        });

        const precursors = computed(() => {
            // Compile full list of precursors by combining results from each prediction
            const precursors = {};
            Object.entries(results.value).forEach(([index, resultsN]) => {
                resultsN.forEach((res) => {
                    if (res.outcome in precursors) {
                        precursors[res.outcome][index] = res;
                    } else {
                        precursors[res.outcome] = {};
                        precursors[res.outcome][index] = res;
                        precursors[res.outcome]["plausibility"] = res["plausibility"];
                        precursors[res.outcome]["num_rings"] = res["num_rings"];
                        precursors[res.outcome]["rms_molwt"] = res["rms_molwt"];
                        precursors[res.outcome]["scscore"] = res["scscore"];
                    }
                });
            });
            return precursors;
        });

        const shownPredictions = computed(() => {
            return Object.keys(predictions.value).filter((index) => predictions.value[index].show);
        });

        const headers = computed(() => {
            const fields = [{ key: "smiles", title: "Precursor", width: '200px' }];
            Object.entries(predictions.value).forEach(([index, item]) => {
                if (item.show && !item.loading) {
                    fields.push({ key: index, title: labels.value[index], sortable: false, removable: true })
                }
            })
            console.log(fields)
            return fields;
        })

        const tableFields = computed(() => {
            const classes = ["text-center", "align-middle"];
            const fields = [{ key: "smiles", label: "Precursor", stickyColumn: true, tdClass: classes, thClass: classes }];
            Object.entries(predictions.value).forEach(([index, item]) => {
                if (item.show && !item.loading) {
                    fields.push({ key: index, label: labels.value[index], sortable: false, tdClass: classes, thClass: classes });
                }
            });
            return fields;
        });

        const tableItems = computed(() => {
            let items = Object.entries(precursors.value).map(([smiles, item]) => ({
                smiles: smiles,
                ...item,
            }));
            return items
        });

        const allowResolve = computed({
            get() {
                const settingsStore = useSettingsStore();
                return settingsStore.allowResolve;
            },
            set(value) {
                const settingsStore = useSettingsStore();
                settingsStore["allowResolve"] = value;
            },
        });

        onMounted(() => {
            API.get("/api/template/sets/", null, false).then((json) => {
                templateAttributes.value = json.attributes;
                templateSets.value = json.template_sets

            });
            API.get("/api/admin/get-backend-status", null, false).then((json) => {
                modelStatus.value = json["modules"];
            });
        });

        const toggleResolver = () => {
            allowResolve.value = !allowResolve.value;
        };

        const canonicalize = async (smiles) => {
            const json = await API.post("/api/rdkit/canonicalize/", { smiles: smiles });
            return json.smiles;
        };

        const resolve = async () => {
            if (enableResolver.value && allowResolve.value && target.value && validSmiles.value) {
                await resolveChemName(target.value)
                    .then((smiles) => canonicalize(smiles))
                    .then((smiles) => {
                        target.value = smiles;
                        validSmiles.value = true;
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        };

        const checkTrainingSets = (newTrainingSet) => {
            // Returns true if the new training set is NOT compatible with the existing predictions
            let trainingSets = new Set(Object.values(predictions.value).map((pred) => pred.trainingSet));
            trainingSets.add(newTrainingSet);
            return trainingSets.has("cas") && trainingSets.size > 1;
        };

        const runRetro = async () => {
            // if (!context.value["casKeyOk"] && checkTrainingSets(settings.trainingSet)) {
            //     alert("The CAS training set cannot be used for predictions alongside other models.");
            //     return;
            // }
            const newIndex = maxIndex.value + 1;
            carouselSlide.value = Object.keys(predictions.value).length;
            await resolve();

            const url = "/api/tree-search/expand-one/call-async";
            const body = {
                smiles: target.value,
                retro_backend_options: [
                    {
                        retro_backend: settings.model,
                        max_num_templates: settings.numTemplates,
                        max_cum_prob: settings.maxCumProb,
                        retro_model_name: settings.trainingSet,
                    },
                ],
                retro_rerank_backend: settings.precursorScoring,
                atom_map_backend: settings.atomMapper,
                use_fast_filter: true,
                fast_filter_threshold: settings.minPlausibility,
                cluster_precursors: false,
                selectivity_check: settings.false,
            };
            // Make a deep copy of the settings object
            const settingsCopy = JSON.parse(JSON.stringify(settings));
            settingsCopy.loading = true;
            settingsCopy.show = true;
            settingsCopy.edit = false;
            predictions.value[newIndex] = settingsCopy;
            labels.value[newIndex] = `Prediction #${newIndex}`;
            API.runCeleryTask(url, body)
                .then((output) => {
                    if (output["status_code"] === 500) {
                        // alert("There was an error predicting precursors for this target: " + output["message"]);
                        createConfirm({ title: 'Error', content: "There was an error predicting precursors for this target: " + output["message"], dialogProps: { width: "60%" } })
                        return;
                    }
                    results.value[newIndex] = output["result"];
                    /* eslint-disable */
                    nextTick(() => {
                        if (retroResultTable.value) {
                            retroResultTable.value.refresh();
                        }
                    });
                })
                .catch((error) => {
                    // alert("There was an error predicting precursors for this target: " + error);
                    createConfirm({ title: 'Alert', content: "There was an error predicting precursors for this target: " + error["message"], dialogProps: { width: "60%" } })
                })
                .finally(() => {
                    predictions.value[newIndex].loading = false;
                });
        };

        const clear = (skipConfirm = false) => {
            let runningPreds = false;
            runningPreds = Object.values(predictions.value).some((prediction) => {
                if (prediction.loading) {
                    return true;
                }
            })
            if (runningPreds) {
                createSnackbar({ text: "Some predictions are still running!", snackbarProps: { timeout: -1, vertical: true } })
                return;
            }
            if (skipConfirm || confirm("This will clear all of your current results. Continue anyway?")) {
                target.value = "";
                predictions.value = {};
                results.value = {};
                labels.value = {};
                selectedSettings.value = null;
                selectedTemplate.value = null;
            }
        };

        const deleteResult = (index) => {
            if (predictions.value[index].loading) {
                alert("Please wait for " + labels.value[index] + " to complete.")
                return;
            }
            if (confirm("Deleting this prediction cannot be undone. Are you sure you want to continue?")) {
                delete predictions.value[index];
                delete results.value[index];
                delete labels.value[index];
                carouselSlide.value = 0;
            }
        };

        const viewSettings = (settings) => {
            selectedSettings.value = settings;
            showSettingsViewModal.value = true;
        };

        const viewTemplate = (template) => {
            selectedTemplate.value = template;
            showTemplateInfoModal.value = true;
        };

        const tableItemProvider = ({ sortBy, sortDesc }) => {
            const mult = sortDesc ? -1 : 1;
            return Object.entries(precursors.value)
                .map(([smiles, item]) => ({
                    smiles: smiles,
                    ...item,
                }))
                .sort((a, b) => mult * sortCompare(a, b, sortBy));
        };

        const sortCompare = (aObj, bObj, field) => {
            const a = aObj[field];
            const b = bObj[field];
            if (a === b) {
                return 0;
            } else if (a === undefined) {
                return 1;
            } else if (b === undefined) {
                return -1;
            } else {
                if (field === "smiles") {
                    return (a > b) - (a < b);
                } else {
                    return (a["rank"] > b["rank"]) - (a["rank"] < b["rank"]);
                }
            }
        };

        const addAttributeFilter = () => {
            settings.attributeFilter.push({
                name: templateAttributes.value[settings.trainingSet][0],
                logic: ">",
                value: 0.5,
            });
        };

        const deleteAttributeFilter = (index) => {
            settings.attributeFilter.splice(index, 1);
        };

        const updateAttributeFilter = (index, key, value) => {
            settings.attributeFilter[index][key] = value;
        };

        watch(
            () => settings.model,
            function () {
                settings.trainingSet = trainingSets.value[0];
                settings.attributeFilter = [];
            }
        );

        watch(
            () => settings.trainingSet,
            function () {
                settings.attributeFilter = [];
            }
        );

        return {
            headers,
            hide,
            carouselSlide,
            target,
            validSmiles,
            modelStatus,
            templateSets,
            templateAttributes,
            settings,
            predictions,
            results,
            resolve,
            labels,
            selectedSettings,
            showSettingsViewModal,
            selectedTemplate,
            showTemplateInfoModal,
            context,
            enableResolver,
            maxIndex,
            models,
            trainingSets,
            precursors,
            shownPredictions,
            tableFields,
            tableItems,
            allowResolve,
            toggleResolver,
            canonicalize,
            checkTrainingSets,
            runRetro,
            clear,
            deleteResult,
            viewSettings,
            viewTemplate,
            tableItemProvider,
            sortCompare,
            addAttributeFilter,
            deleteAttributeFilter,
            updateAttributeFilter,
            num2str,
            showKetcher,
            ketcherRef,
            allPredictionsDialog,
        };
    },
};
</script>
