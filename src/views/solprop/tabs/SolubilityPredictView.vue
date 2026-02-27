<template>
  <v-container fluid style="min-height: calc(100vh-50px)">
    <v-row class="justify-center">
      <v-col cols="12" md="12" class="pa-0">
        <v-sheet elevation="2" class="pa-10" rounded="lg" width="100%">
          <v-form @submit.prevent="predict" ref="form">
            <v-row>
              <v-col>
                <v-text-field :rules="[v => !!v || 'Solute is required']" variant="outlined" label="Solute"
                  v-model="solute" data-cy="solpred-solute" clearable prepend-inner-icon="mdi mdi-flask" rounded="pill">
                  <template v-slot:append-inner>
                    <draw-button v-model:smiles="solute" />
                  </template>
                </v-text-field>
                <div v-if="!!solute" class="my-3">
                  <smiles-image :smiles="solute" height="100px">
                  </smiles-image>
                </div>
              </v-col>
              <v-col>
                <v-text-field :rules="[v => !!v || 'Solvent is required']" variant="outlined" label="Solvent"
                  v-model="solvent" data-cy="solpred-solvent" clearable prepend-inner-icon="mdi mdi-flask"
                  rounded="pill">
                  <template v-slot:append-inner>
                    <draw-button v-model:smiles="solvent" />
                  </template>
                </v-text-field>
                <div v-if="!!solvent" class="my-3">
                  <smiles-image :smiles="solvent" height="100px"></smiles-image>
                </div>
              </v-col>
              <v-col>
                <v-text-field :rules="[v => !!v || 'Temperature is required']" variant="outlined" label="Temperature"
                  v-model="temperature" data-cy="solpred-temp" clearable prepend-inner-icon="mdi-thermometer-lines"
                  rounded="pill">
                </v-text-field>
              </v-col>

            </v-row>
            <v-row justify-start class="align-center justify-center">
              <v-col class="d-flex flex-row">
                <v-btn data-cy="solpred-submit" type="submit" variant="flat" color="success" class="mr-5"
                  :loading="!batch && loading" :disabled="!selectedModel">Submit</v-btn>
                <v-btn type="button" data-cy="solpred-run-batch" variant="flat" color="yellow-darken-4" class="mr-5"
                  @click="showUploadModal = true" :loading="batch && loading" :disabled="!selectedModel">Run
                  Batch</v-btn>
                <v-menu location="bottom" id="tb-submit-settings" :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <v-tooltip location="bottom"
                      :text="selectedModel ? `Current Model: ${selectedModel === 'solprop' ? 'Fusion Cycle' : selectedModel === 'fastsolv' ? 'FastSolv' : selectedModel === 'legacy' ? 'SolProp' : selectedModel}` : 'Please select model'"
                      :model-value="!selectedModel || undefined">
                      <template v-slot:activator="{ props: tprops }">
                        <v-btn color="primary" append-icon="mdi mdi-menu-down" variant="flat" data-cy="model-selection"
                          v-bind="Object.assign({}, props, tprops)" class="mr-5">
                          Model
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </template>
                  <v-list min-width="200px">
                    <v-list-item @click="selectedModel = 'solprop'">
                      <v-list-item-title>
                        <v-icon v-if="selectedModel === 'solprop'" icon="mdi-check"></v-icon>
                        Fusion Cycle
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="selectedModel = 'fastsolv'">
                      <v-list-item-title>
                        <v-icon v-if="selectedModel === 'fastsolv'" icon="mdi-check"></v-icon>
                        FastSolv
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="selectedModel = 'legacy'">
                      <v-list-item-title>
                        <v-icon v-if="selectedModel === 'legacy'" icon="mdi-check"></v-icon>
                        SolProp
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-btn @click="dialog = true" variant="flat" class="mr-5" prepend-icon="mdi-dots-horizontal"
                  color="info">
                  More Options
                </v-btn>
                <v-btn data-cy="solpred-clear-results" variant="tonal" class="mr-5" :disabled="results.length === 0"
                  @click="clear()">
                  Clear Results
                </v-btn>
                <v-btn class="mr-5 align-self-end" variant="tonal" @click="showInfo = !showInfo" color="info">Model I/O
                  Details</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-sheet>
      </v-col>
    </v-row>
    <!-- 
    <v-row v-if="!selectedModel && (solute || solvent || temperature)" class="mt-2">
      <v-col cols="12" class="pa-0">
        <v-alert type="info" variant="tonal" closable>
          <v-alert-title>Model Selection Required</v-alert-title>
          Please select a model (SolProp - Fusion Cycle or FastSolv) to proceed with the prediction.
        </v-alert>
      </v-col>
    </v-row> -->

    <v-row>
      <v-col v-show="pendingTasks > 0 || results.length" cols="12" md="12" class="pa-0 mt-4">
        <v-sheet elevation="2" class="pa-4" rounded="lg">
          <v-row v-if="pendingTasks === 0" class="mx-auto my-auto pa-2">
            <v-col md="5">
              <v-menu location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn v-show="!!results.length" color="primary" v-bind="props" prepend-icon="mdi mdi-download"
                    variant="flat" data-cy="solpred-download">
                    Download
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item data-cy="solpred-download-csv" @click="downloadCSV()">Download CSV</v-list-item>
                  <v-list-item data-cy="solpred-download-json" @click="downloadJSON()">Download JSON</v-list-item>
                </v-list>
              </v-menu>
            </v-col>
            <v-spacer md="2"></v-spacer>
            <v-col md="5">
              <v-select :model-value="selectedColumnCategories" :items="allfields" label="Select Columns"
                density="comfortable" variant="outlined" hide-details clearable @update:modelValue="onSelectedCategory"
                multiple data-cy="solpred-select-columns">
                <template v-slot:prepend-item>
                  <v-list-item ripple @click="toggleAllCategories" data-cy="solpred-select-all">
                    <v-list-item-title>Select All</v-list-item-title>
                  </v-list-item>
                  <v-divider></v-divider>
                </template>
                <template v-slot:selection="{ item, index }">
                  <!-- <pre>{{  index }}</pre> -->
                  <v-chip>
                    <span>{{ item.title }}</span>
                    <v-icon small @click.prevent="deselectColumn(item)">
                      mdi-close-circle
                    </v-icon>
                  </v-chip>
                </template>
              </v-select>
            </v-col>
            <v-row class="mt-3" style="overflow-x:scroll">
              <v-col cols="12">
                <v-data-table :page="lastPage" :items-per-page="itemsPerPage"
                  @update:itemsPerPage="$event => itemsPerPage = $event" :headers="fields" :items="results"
                  data-cy="solpred-table" :row-props="colorRowItem">
                  <template v-slot:item.st_1="{ item }">
                    {{ item.st_1 != null && !isNaN(Number(item.st_1)) ? Number(item.st_1).toExponential(2) : '' }}
                  </template>
                  <template v-slot:item.st_2="{ item }">
                    {{ item.st_2 != null && !isNaN(Number(item.st_2)) ? Number(item.st_2).toExponential(2) : '' }}
                  </template>
                  <template v-slot:item.s_298="{ item }">
                    {{ item.s_298 != null && !isNaN(Number(item.s_298)) ? Number(item.s_298).toExponential(2) : '' }}
                  </template>
                  <template v-slot:item.log_st_1="{ item }">
                    {{ item.log_st_1 != null && !isNaN(Number(item.log_st_1)) ? Number(item.log_st_1).toExponential(2) :
                    '' }}
                  </template>
                  <template v-slot:item.log_st_2="{ item }">
                    {{ item.log_st_2 != null && !isNaN(Number(item.log_st_2)) ? Number(item.log_st_2).toExponential(2) :
                    '' }}
                  </template>
                  <template v-slot:item.log_s_298="{ item }">
                    {{ item.log_s_298 != null && !isNaN(Number(item.log_s_298)) ?
                    Number(item.log_s_298).toExponential(2) : '' }}
                  </template>
                  <template v-slot:item.uncertainty="{ item }">
                    {{ item.uncertainty != null && !isNaN(Number(item.uncertainty)) ?
                    Number(item.uncertainty).toExponential(2) : '' }}
                  </template>
                  <template v-slot:item.uncertainty_log_s_298="{ item }">
                    {{ item.uncertainty_log_s_298 != null && !isNaN(Number(item.uncertainty_log_s_298)) ?
                    Number(item.uncertainty_log_s_298).toExponential(2) : '' }}
                  </template>
                  <template v-slot:item.MP_pred="{ item }">
                    {{ item.MP_pred != null && !isNaN(Number(item.MP_pred)) ? Number(item.MP_pred).toExponential(2) : '' }}
                  </template>
                  <template v-slot:item.MP_std="{ item }">
                    {{ item.MP_std != null && !isNaN(Number(item.MP_std)) ? Number(item.MP_std).toExponential(2) : '' }}
                  </template>
                  <template v-slot:item.gamma="{ item }">
                    {{ item.gamma != null && !isNaN(Number(item.gamma)) ? Number(item.gamma).toExponential(2) : '' }}
                  </template>
                </v-data-table></v-col>
            </v-row>
          </v-row>
          <v-row v-else justify="space-between" class="mx-auto my-auto pa-2">
            <v-skeleton-loader class="mx-auto my-auto" min-height="80px" type="table" width="100%"></v-skeleton-loader>
          </v-row>
        </v-sheet>
      </v-col>
      <v-col v-show="!results.length && pendingTasks === 0" cols="12" class="pa-0 mt-4">
        <v-sheet elevation="2" rounded="lg" class="pa-4">
          <div class="d-flex flex-column align-center justify-center text-center">
            <img src="@/assets/emptySolProp.svg" :width="400" class="mb-3" cover />
            <h2>No Results</h2>
            <p class="text-body-1">Begin a new prediction above</p>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <v-dialog v-model="showUploadModal" max-width="600px">
      <v-card>
        <v-card-title class="mt-2">
          <v-col cols="12">Upload file</v-col>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" class="mb-2">
              <span>
                See Model Input/Output Details for notes on file format.
              </span>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-file-input data-cy="solpred-file-upload" label="File" v-model="uploadFile"
                :rules="[v => !!v || 'File is required']" density="comfortable" variant="outlined"
                clearable></v-file-input>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn data-cy="solpred-file-upload-close" color="blue darken-1" text
            @click="showUploadModal = false">Close</v-btn>
          <v-btn data-cy="solpred-file-upload-upload" color="green darken-1" text
            @click="handleUploadSubmit">Upload</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" max-width="600px" class="justify-center align-center">
      <v-card>
        <v-card-title class="headline">
          Additional Information
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-3">
          <v-expand-transition>
            <v-expansion-panels v-model="panel" multiple>
              <v-expansion-panel title="Density (Optional - Only applies to Fusion Cycle model)" class="text-primary">
                <v-expansion-panel-text class="text-black">
                  <v-text-field variant="outlined" label="Density" v-model="density"
                    :disabled="selectedModel !== 'solprop'"></v-text-field>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel title="Reference Information (Optional)" class="text-primary">
                <v-expansion-panel-text class="text-black">
                  <v-text-field variant="outlined" label="Ref. Solvent" v-model="refSolvent">
                    <template v-slot:append-inner>
                      <draw-button v-model:smiles="refSolvent" />
                    </template>
                  </v-text-field>
                  <div v-if="!!refSolvent" class="my-3">
                    <smiles-image :smiles="refSolvent" height="100px"></smiles-image>
                  </div>
                  <v-text-field variant="outlined" label="Ref. Solubility (log10(mol/L))"
                    v-model="refSolubility"></v-text-field>
                  <v-text-field variant="outlined" label="Ref. Temperature (K)" v-model="refTemperature"></v-text-field>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel title="Solute Information (Optional)" class="text-primary">
                <v-expansion-panel-text class="text-black">
                  <v-text-field variant="outlined" label="ΔHsub298 (kcal/mol)" v-model="soluteHsub"></v-text-field>
                  <v-text-field variant="outlined" label="Cpg298 (cal/mol/K)" v-model="soluteCpg"></v-text-field>
                  <v-text-field variant="outlined" label="Cps298 (cal/mol/K)" v-model="soluteCps"></v-text-field>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expand-transition>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="d-flex justify-end pa-3">
          <v-btn class="mr-2" variant="tonal" color="success" @click="dialog = false">
            Save
          </v-btn>
          <v-btn variant="tonal" color="primary" @click="() => { dialog = false; predict() }">
            Run
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <solubility-modal :visible="showInfo" width="auto" @close-dialog="$event => showInfo = $event"></solubility-modal>
</template>

<script>
import KetcherModal from "@/components/KetcherModal";
import SmilesImage from "@/components/SmilesImage";
import SmilesInput from "@/components/SmilesInput";
import SolubilityModal from '@/components/solprop/SolubilityModal'
import ErrorDialog from '@/components/ErrorDialog'
import { API } from "@/common/api";
import { saveAs } from "file-saver";
import * as Papa from "papaparse";
import { useConfirm } from 'vuetify-use-dialog'
import DrawButton from "@/components/DrawButton"

export default {
  name: "SolubilityPrediction",
  components: {
    SmilesImage,
    SmilesInput,
    SolubilityModal,
    KetcherModal,
    ErrorDialog,
    DrawButton
  },
  setup() {
    const createConfirm = useConfirm();
    return { createConfirm }
  },
  data() {
    return {
      itemsPerPage: 10,
      panel: [0],
      pendingTasks: 0,
      solvent: '',
      solute: '',
      temperature: 298,
      refSolvent: null,
      refSolubility: null,
      refTemperature: null,
      soluteHsub: null,
      soluteCpg: null,
      soluteCps: null,
      density: null,
      dialog: false,
      showUploadModal: false,
      results: [],
      currentInputSource: '',
      showKetcher: false,
      tab: "one",
      uploadFile: null,
      selectedColumnCategories: [
        'Model',
        'Density',
        'Solubility(T) [mg/mL]',
        'logST',
        'Melting Point & Activity Coefficient',
        'Solubility(298) [mg/mL]',
        'Uncertainty logS [log10(mol/L)]'
      ],
      columnCategories: {
        'Model': ['model'],
        'Input Ref. Data': ['ref_solvent', 'ref_solubility', 'ref_temp'],
        'Input Solute Data': ['hsub298', 'cp_gas_298', 'cp_solid_298'],
        'logST': ['log_st_1', 'log_st_2'],
        'Solubility(T) [mg/mL]': ['st_1', 'st_2'],
        'Density': ['density'],
        'dGsolvT': ['dg_solv_t'],
        'dHsolvT': ['dh_solv_t'],
        'dSsolvT': ['ds_solv_t'],
        'logS298': ['log_s_298'],
        'Solubility(298) [mg/mL]': ['s_298'],
        'dGsolv298': ['dg_solv_298', 'uncertainty_dg_solv_298'],
        'dHsolv298': ['dh_solv_298', 'uncertainty_dh_solv_298'],
        'Pred. Solute Data': ['pred_hsub298', 'pred_cpg298', 'pred_cps298'],
        'Solute Abraham Parameters': ['E', 'S', 'A', 'B', 'L', 'V'],
        'Messages': ['error_message', 'warning_message'],
        'Uncertainty logS [log10(mol/L)]': ['uncertainty', 'uncertainty_log_s_298'],
        'Melting Point & Activity Coefficient': ['MP_pred', 'MP_std', 'gamma']
      },
      fields: [

      ],
      apiKeyToField: {
        'Solute': 'Solute',
        'Solvent': 'Solvent',
        'Temp': 'Temperature',
        'model': 'Model',
        'ref_solvent': 'Ref. Solvent',
        'ref_solubility': 'Ref. Solubility',
        'ref_temp': 'Ref. Temperature',
        'hsub298': 'Input Hsub298',
        'cp_gas_298': 'Input Cpg298',
        'cp_solid_298': 'Input Cps298',
        'log_st_1': 'logST (method1) [log10(mol/L)]',
        'st_1': 'Solubility (method1) [mg/mL]',
        'log_st_2': 'logST (method2) [log10(mol/L)]',
        'st_2': 'Solubility (method2) [mg/mL]',
        'dg_solv_t': 'dGsolvT',
        'dh_solv_t': 'dHsolvT',
        'ds_solv_t': 'dSsolvT',
        'log_s_298': 'logS298 [log10(mol/L)]',
        'uncertainty_log_s_298': 'Uncertainty logS298 [log10(mol/L)]',
        's_298': 'Solubility(298) [mg/mL]',
        'dh_solv_298': 'dHsolv298',
        'dg_solv_298': 'dGsolv298 [kcal/mol]',
        'uncertainty_dg_solv_298': 'Uncertainty dGsolv298 [kcal/mol]',
        'uncertainty_dh_solv_298': "Uncertainty dHsolv298",
        'error_message': 'Error Messages',
        'warning_message': 'Warning Messages',
        'pred_hsub298': 'Pred. Hsub298 [kcal/mol]',
        'pred_cpg298': 'Pred. Cpg298 [cal/K/mol]',
        'pred_cps298': 'Pred. Cps298 [cal/K/mol]',
        'E': 'E',
        'S': 'S',
        'A': 'A',
        'B': 'B',
        'L': 'L',
        'V': 'V',
        'uncertainty': 'Uncertainty logS [log10(mol/L)]',
        'density': 'Density',
        'MP_pred': 'Melting point (K)',
        'MP_std': 'Std. of melting point (K)',
        'gamma': 'Activity coefficient'
      },
      loading: false,
      showInfo: false,
      batch: false,
      selectedModel: null,
      models: [
        { title: 'Fusion Cycle', value: 'solprop' },
        { title: 'FastSolv', value: 'fastsolv' },
        { title: 'SolProp', value: 'legacy' },
      ],
    }
  },
  computed: {
    colorRowItem() {
      return (item) => {
        return {
          class: {
            'highlight-row': item.item.new === this.results.length
          }
        };
      };
    },
    allfields() {
      return Object.keys(this.columnCategories).map((key) => ({ key: key, title: key }))
    },
    lastPage() {
      return Math.ceil(this.results.length / this.itemsPerPage);
    },
    exportFileName() {
      let baseName = 'askcos'
      if (this.uploadFile) {
        const inputName = this.uploadFile.name
        baseName = inputName.substring(0, inputName.lastIndexOf('.'))
      }
      return baseName + '_solubility_export'
    },
    currentSmiles() {
      switch (this.currentInputSource) {
        case 'solute':
          return this.solute;
        case 'solvent':
          return this.solvent;
        case 'refSolvent':
          return this.refSolvent;
        default:
          return '';
      }
    }
  },
  created() {
    // Prompt user before going back to previous page
    window.addEventListener('beforeunload', (e) => {
      if (this.results.length && !this.loading) {
        // Cancel the event
        e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        e.returnValue = '';
      }
    });

    let urlParams = new URLSearchParams(window.location.search);
    let solute = urlParams.get('solute')
    if (solute) {
      this.solute = solute
    }
    let solvent = urlParams.get('solvent')
    if (solvent) {
      this.solvent = solvent
    }

    this.onSelectedCategory();
  },
  methods: {
    deselectColumn(item) {
      const index = this.selectedColumnCategories.indexOf(item.title);
      if (index !== -1) {
        this.selectedColumnCategories.splice(index, 1);
      }
      this.$nextTick(() => {
        this.onSelectedCategory();
      });
    },
    toggleAllCategories() {
      if (this.selectedColumnCategories.length < this.allfields.length) {
        this.selectedColumnCategories = this.allfields.map(category => category.key);
      } else {
        this.selectedColumnCategories = [];
      }
      this.onSelectedCategory();
    },
    remove(key) {
      this.fields = this.fields.filter(header => header.key !== key)
    },
    clear() {
      this.results = []
    },
    onSelectedCategory(value) {
      if (value) {
        this.selectedColumnCategories = value
      }
      const baseFields = [
        { key: 'Solute', title: this.apiKeyToField['Solute'], sortable: true, removable: false },
        { key: 'Solvent', title: this.apiKeyToField['Solvent'], sortable: true, removable: false },
        { key: 'Temp', title: this.apiKeyToField['Temp'], sortable: true, removable: false },
      ];
      this.selectedColumnCategories.forEach((category) => {
        this.columnCategories[category].forEach((key) => {
          baseFields.push({ key: key, title: this.apiKeyToField[key], sortable: true, removable: true });
        });
      });

      this.fields = baseFields;
    },
    buildRequestBody(model) {
      if (!model) {
        console.error('No model selected')
        return null
      }
      if (model === 'legacy') {
        return {
          task_list: [{
            solvent: this.solvent,
            solute: this.solute,
            temp: this.temperature,
            ref_solvent: this.refSolvent || null,
            ref_solubility: this.refSolubility || null,
            ref_temp: this.refTemperature || null,
            hsub298: this.soluteHsub || null,
            cp_gas_298: this.soluteCpg || null,
            cp_solid_298: this.soluteCps || null,
          }]
        }
      }
      const body = {
        solvent_smiles: [this.solvent],
        solute_smiles: [this.solute],
        temperature: [this.temperature],
      }
      if (this.density != null && this.density !== '' && model === 'solprop') {
        body.density = [Number(this.density)]
      }
      return body
    },
    predict() {
      this.pendingTasks += 1
      this.loading = true
      this.batch = false
      const url = this.selectedModel === 'solprop'
        ? '/api/solubility/fusion-cycle/call-async'
        : this.selectedModel === 'fastsolv'
          ? '/api/fastsolv/call-async'
          : '/api/legacy/solubility/batch/call-async';
      API.runCeleryTask(url, this.buildRequestBody(this.selectedModel))
        .then(output => {
          const inputDensity = this.density != null && this.density !== '' ? Number(this.density) : null
          if (this.selectedModel === 'solprop' ){
            this.results.unshift(...output.map(item => {
               const result = { ...item, model: 'Fusion Cycle' }
              if (inputDensity != null) {
                result.density = inputDensity
              }
              return result
            }))
          } else if (this.selectedModel === 'fastsolv') {
            this.results.unshift(...output.map(item => ({ ...item, model: 'FastSolv' })))
          } else {
            this.results.unshift(...output.map(item => ({ ...item, model: 'SolProp' })))
          }
          this.results[0].new = this.results.length
        })
        .catch(async error => {
          const errorObj = JSON.parse(error.message)
          const isConfirmed = await this.createConfirm({ title: "Alert", contentComponent: ErrorDialog, contentComponentProps: { errorObj: errorObj }, dialogProps: { width: "auto" } })
          if (!isConfirmed)
            return
        })
        .finally(() => {
          this.loading = false;
          this.pendingTasks -= 1;
        })
    },
    predictBatch(data) {
      this.pendingTasks += 1
      this.loading = true
      this.batch = true
      const url = this.selectedModel === 'solprop'
        ? '/api/solubility/fusion-cycle/call-async'
        : this.selectedModel === 'fastsolv'
          ? '/api/fastsolv/call-async'
          : '/api/legacy/solubility/batch/call-async';
      let body
      if (this.selectedModel === 'legacy') {
        body = {
          task_list: data.map(item => ({
            solvent: item.solvent || item.solvent_smiles || '',
            solute: item.solute || item.solute_smiles || '',
            temp: item.temp || item.temperature || 298,
            ref_solvent: item.ref_solvent || null,
            ref_solubility: item.ref_solubility || null,
            ref_temp: item.ref_temp || null,
            hsub298: item.hsub298 || null,
            cp_gas_298: item.cp_gas_298 || null,
            cp_solid_298: item.cp_solid_298 || null,
          }))
        }
      } else {
        body = {
          solvent_smiles: data.map(item => item.solvent || item.solvent_smiles || ''),
          solute_smiles: data.map(item => item.solute || item.solute_smiles || ''),
          temperature: data.map(item => item.temp || item.temperature || 298),
        }
        const densities = data.map(item => item.density != null ? Number(item.density) : null)
        if (densities.some(v => v != null) && this.selectedModel === 'solprop') {
          body.density = densities
        }
      }
      API.runCeleryTask(url, body)
        .then(output => {
          if (this.selectedModel === 'solprop' ){
            this.results.unshift(...output.map((item, idx) => {
               const result = { ...item, model: 'Fusion Cycle', new: this.results.length + output.length }
              const inputDensity = body.density ? body.density[idx] : null
              if (inputDensity != null) {
                result.density = inputDensity
              }
              return result
            }));
          } else if (this.selectedModel === 'fastsolv') {
            this.results.unshift(...output.map(item => ({ ...item, model: 'FastSolv', new: this.results.length + output.length })));
          } else {
            this.results.unshift(...output.map(item => ({ ...item, model: 'SolProp', new: this.results.length + output.length })));
          }
        })
        .catch(async error => {
          const errorObj = JSON.parse(error.message)
          const isConfirmed = await this.createConfirm({ title: "Alert", contentComponent: ErrorDialog, contentComponentProps: { errorObj: errorObj }, dialogProps: { width: "auto" } })
          if (!isConfirmed)
            return
        })
        .finally(() => {
          this.loading = false
          this.pendingTasks -= 1
        })
    },
    handleUploadSubmit() {
      let fileFormat
      if (this.uploadFile) {
      if (this.uploadFile.name.endsWith('.json')) {
        fileFormat = 'json'
      } else if (this.uploadFile.name.endsWith('.csv')) {
        fileFormat = 'csv'
      } else {
        alert('No file selected or file has no name!')
        return
        }
      }
      let reader = new FileReader();
      reader.onload = (e) => {
        let rawData = e.target.result
        let data
        if (fileFormat === 'csv') {
          let result = Papa.parse(rawData, { header: true, skipEmptyLines: true, transform: (value) => value === '' ? null : value })
          if (result.errors.length) {
            alert(result.errors[0].message)
            return
          }
          data = result.data
        } else if (fileFormat === 'json') {
          try {
            data = JSON.parse(rawData)
          } catch (error) {
            alert('Invalid JSON file format')
            return
          }
        }
        this.predictBatch(data)
        this.showUploadModal = false;
        this.uploadFile = null;
      }
      reader.readAsText(this.uploadFile)
    },
    openKetcher(source) {
      this.currentInputSource = source;
      this.showKetcher = true;
      this.$refs['ketcherRef'].smilesToKetcher()
    },
    processRequest() {
      if (this.selectedModel === 'solprop') {
        this.callSolprop();
      } else if (this.selectedModel === 'fastsolv') {
        this.callFastsolv();
      }
    },
    updateSmiles(ketcherSmiles) {
      switch (this.currentInputSource) {
        case 'solute':
          this.solute = ketcherSmiles;
          break;
        case 'solvent':
          this.solvent = ketcherSmiles;
          break;
        case 'refSolvent':
          this.refSolvent = ketcherSmiles;
          break;
      }
    },
    downloadCSV() {
      if (!this.results.length) {
        alert('There are no results to download!')
        return
      }
      let downloadData = Papa.unparse(this.results)
      let blob = new Blob([downloadData], { type: 'data:text/csv;charset=utf-8' })
      saveAs(blob, this.exportFileName + '.csv')
    },
    downloadJSON() {
      if (!this.results.length) {
        alert('There are no results to download!')
        return
      }
      let downloadData = JSON.stringify(this.results)
      let blob = new Blob([downloadData], { type: 'data:text/json;charset=utf-8' })
      saveAs(blob, this.exportFileName + '.json')
    },
  },
}
</script>

<style scoped>
:deep(.highlight-row) {
  background-color: #e0f7fa !important;
  padding: 10px !important;
  transition: background-color 0.3s ease !important;
}

:deep(.highlight-row td:first-child) {
  border-left: 4px solid #00796b;
}

.v-theme--dark {
  :deep(.highlight-row td:first-child) {
    border-left: 4px solid #80cbc4;
  }

  :deep(.highlight-row) {
    background-color: #004d40 !important;
    padding: 10px !important;
    transition: background-color 0.3s ease !important;
  }
}
</style>
