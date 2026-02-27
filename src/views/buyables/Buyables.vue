<template>
  <v-progress-linear :active="fetchLoad" :indeterminate="fetchLoad" color="green-darken-1" absolute
    bottom></v-progress-linear>
  <v-container fluid>
    <bread-crumbs pageTitle="Buyable Compounds" />
    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="10">
        <v-sheet elevation="2" rounded="lg" class="pa-5">
          <v-row class="justify-center" density="compact">
            <v-col cols="12" md="12">
              <v-text-field v-model="searchSmilesQuery" data-cy="buyables-smiles-input" placeholder="SMILES/SMARTS"
                prepend-inner-icon="mdi mdi-flask" density="compact" variant="outlined"
                label="Enter SMILES/SMART to explore" hide-details clearable rounded="pill">
                <template v-slot:append>
                  <v-checkbox-btn v-model="searchRegex" label="Use SMARTS" hide-details class="mr-5">
                  </v-checkbox-btn>
                  <v-menu location="bottom" :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn color="primary" variant="flat" v-bind="props" :disabled="fetchLoad" :loading="fetchLoad"
                        rounded="pill" class="mr-5" data-cy="buyables-select-sources">
                        Select Sources
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item v-for="source in buyablesSources" :key="source" @click="selectSource(source)">
                        <v-row align="center">
                          <v-col cols="auto">
                            <v-list-item-title>
                              {{ source }}
                              <v-icon class="ml-1 mb-2" v-show="selectedSources.includes(source)" icon="mdi-check">
                              </v-icon>
                            </v-list-item-title>
                          </v-col>
                        </v-row>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <v-btn color="success" @click="search" variant="flat" class="mr-5" :loading="showLoader"
                    rounded="pill" data-cy="buyables-search-button">
                    Search
                  </v-btn>
                  <v-btn data-cy="buyables-clear-results-button" variant="tonal" @click="clear()"
                    :disabled="!buyables.length" rounded="pill">
                    Clear Results
                  </v-btn>
                  <v-menu location="bottom" id="tb-submit-settings" :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <v-btn v-show="isAdmin" color="orange-accent-4" v-bind="props" icon="mdi-plus" variant="flat"
                        size="small" class="ml-5" data-cy="add-buyables-button">
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item data-cy="buyables-add-one" @click="showAddModal = !showAddModal">Add
                        One</v-list-item>
                      <v-list-item data-cy="buyables-add-json" @click="showUploadModal = !showUploadModal">Add
                        Buyable(s)</v-list-item>
                    </v-list>
                  </v-menu>
                </template>
                <template v-slot:append-inner>
                  <draw-button v-model:smiles="searchSmilesQuery" size="small" />
                </template>
              </v-text-field>
              <div v-if="!!searchSmilesQuery" class="my-3">
                <smiles-image :smiles="searchSmilesQuery" height="100px"></smiles-image>
              </div>
            </v-col>
          </v-row>
          <v-row class="mb-2 px-5 pt-5">
            <v-col cols="12" md="4">
              <v-slider :rules="[rulesSim.min, rulesSim.max]" v-model="simThresh" label="Similarity Threshold" min="0"
                max="1" step="0.0001" color="primary">
                <template v-slot:append>
                  <v-text-field hide-details data-cy="similarity-input-element" v-model="simThresh" type="number"
                    style="width: 80px" density="compact" variant="outlined" min="0" max="1"></v-text-field>
                </template>
              </v-slider>
            </v-col>
            <v-col cols="12" md="4">
              <v-slider :rules="[rulesRetLim.min, rulesRetLim.max]" v-model="searchLimit" label="Limit Results" min="1"
                max="100" step="1" color="primary">
                <template v-slot:append>
                  <v-text-field v-model="searchLimit" data-cy="result-input-element" type="number" style="width: 80px"
                    density="compact" hide-details variant="outlined" min="1" max="100"></v-text-field>
                </template>
              </v-slider>
            </v-col>
            <v-col cols="12" md="4" class="d-flex justify-space-evenly align-center">
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="10">
        <v-sheet elevation="2" class="d-flex justify-center align-center pa-5" rounded="lg" data-cy="buyables-table">
          <v-data-table v-if="buyables.length" :headers="headers" :items="buyables" :loading="showLoader">
            <template v-slot:item.smiles="{ item }">
              <copy-tooltip :data="item.smiles">
                <smiles-image :smiles="item.smiles" height="80px"></smiles-image>
              </copy-tooltip>
            </template>
            <template v-slot:item.availability="{ item }">
              {{ (item.properties && item.properties[1] && (item.properties[1].value !== "" ||
              item.properties[1].availability)) ? (item.properties[1].value || item.properties[1].availability) :
              "Unknown" }}
            </template>
            <template v-slot:item.lead_time="{ item }" data-cy="buyables-leadtime">
              {{ item.lead_time ? item.lead_time : "Unknown" }}
            </template>
            <template v-slot:item.similarity="{ item }">
              {{ item.similarity ? item.similarity : "1" }}
            </template>
            <template v-slot:item.link="{ item }">
              <v-btn :href="(item.properties && item.properties[0]) ? item.properties[0].value : ''" target="_blank"
                append-icon="mdi-open-in-new"
                :disabled="!item.properties || !item.properties[0] || !item.properties[0].value">Buy Now
              </v-btn>
            </template>
            <template v-slot:item.delete="{ item }">
              <v-icon @click="deleteBuyable(item._id)" data-cy="buyable-delete-item"
                class="text-center">mdi-delete</v-icon>
            </template>
          </v-data-table>
          <div v-else class="text-center">
            <v-img :width="400" cover :src="emptyCart" class="mb-3"></v-img>
            <h2>No Results</h2>
            <p class="text-body-1">Search SMILES/SMARTS to explore</p>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="showAddModal" max-width="600px">
    <v-card>
      <v-card-title class="mt-2">
        <v-col cols="12">Add new buyable compound</v-col>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field data-cy="buyable-smiles-input" :rules="[v => !!v || 'SMILES is required']" label="SMILES"
              v-model="addBuyableSmiles" density="comfortable" variant="outlined" clearable></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-text-field data-cy="buyable-ppg-input" id="pricePerGram" :rules="[v => !!v || 'Price is required']"
              label="Price per gram" v-model="addBuyablePrice" density="comfortable" variant="outlined"
              clearable></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-text-field data-cy="buyable-source-input" id="source" label="Source" v-model="addBuyableSource"
              :rules="[v => !!v || 'Source is required']" density="comfortable" variant="outlined"
              clearable></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-text-field data-cy="buyable-leadtime-input" id="leadtime" label="Lead Time" v-model="addBuyableLeadTime"
              density="comfortable" variant="outlined" clearable></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-textarea data-cy="buyable-properties-input" label="Properties" v-model="addBuyableProps"
              variant="outlined"></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-checkbox label="Allow overwriting exisiting result" v-model="allowOverwrite"></v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn data-cy="add-buyable-close-button" color="blue darken-1" text @click="showAddModal = false">Close</v-btn>
        <v-btn data-cy="add-buyable-entry-button" color="green darken-1" text @click="addBuyable">Add Entry</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showUploadModal" max-width="600px" scrollable>
    <v-card>
      <v-card-title>
        Upload buyable compound file
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <p class="text-body-1 mb-4">
              File uploads should be in JSON format. Optionally, a "properties" field
              containing additional metadata can be specified as an array of JSON objects with "name" and "value"
              fields.
            </p>
            <v-expansion-panels multiple flat>
              <v-expansion-panel title="Example JSON Format" class="text-primary">
                <template v-slot:text>
                  <pre style="white-space: pre-wrap">
                    {{ exJSON }}
                  </pre>
                </template>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-file-input data-cy="buyables-json-upload" label="File" v-model="uploadFile"
              :rules="[v => !!v || 'File is required']" density="comfortable" variant="outlined"
              clearable></v-file-input>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-checkbox data-cy="buyable-overwrite-checkbox" label="Allow overwriting exisiting result"
              v-model="allowOverwrite" hide-details></v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="tonal" @click="showUploadModal = false">Close</v-btn>
        <v-btn data-cy="buyable-upload-submit" color="primary" variant="tonal"
          @click="handleUploadSubmit">Upload</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { API } from "@/common/api";
import { getBuyables } from "@/common/buyables";
import { ref, computed, onMounted, watch } from 'vue';
import SmilesImage from "@/components/SmilesImage.vue";
import CopyTooltip from "@/components/CopyTooltip";
import emptyCart from "@/assets/emptyCart.svg";
import { useConfirm, useSnackbar } from 'vuetify-use-dialog';
import BreadCrumbs from "@/components/BreadCrumbs.vue"
import DrawButton from "@/components/DrawButton"

const buyables = ref([]);
const uploadFile = ref(null);
const searchSmilesQuery = ref('');
const searchSourceQuery = ref([]);
const searchRegex = ref(false);
const searchLimit = ref(100);
const simThresh = ref(1.0);
const allowOverwrite = ref(true);
const showAddModal = ref(false);
const showUploadModal = ref(false);
const addBuyableSmiles = ref('');
const addBuyablePrice = ref(1);
const addBuyableSource = ref('');
const addBuyableLeadTime = ref('');
const addBuyableProps = ref('[{"name": "link","value": ""},{"name": "availability","value": ""}]');
const uploadFileFormat = ref('JSON');
const pendingTasks = ref(0);
const buyablesSources = ref([]);
const showKetcher = ref(false);
const ketcherRef = ref(null);
const selectedSources = ref([]);
const isAdmin = ref(false);
const createConfirm = useConfirm();
const createSnackbar = useSnackbar()
const fetchLoad = ref(false)
const exJSON = [
  {
    "smiles": "CCC",
    "ppg": 1,
    "source": "test source 1",
    "lead_time": "1day",
    "properties": {
      "link": "https://test.com/query=CCC",
      "availability": "In-stock"
    }
  },
  {
    "smiles": "CCC",
    "ppg": 1.5,
    "source": "test source 2",
    "lead_time": "1day",
    "properties": {
      "link": "https://test1.com/query=CCC",
      "availability": "In-stock"
    }
  },
]

const rulesSim = {
  min: v => v >= 0 || `The Min is 0`,
  max: v => v <= 1 || `The Max is 1`
}

const rulesRetLim = {
  min: v => v >= 1 || `The Min is 1`,
  max: v => v <= 100 || `The Max is 100`
}

const headers = computed(() => {
  let headers = [
    { key: 'smiles', title: 'SMILES', align: 'center', width: '500px' },
    { key: "availability", title: 'Availability', align: 'center' },
    { key: 'ppg', title: 'Price ($/g)', align: 'center' },
    { key: 'lead_time', title: 'Lead Time', align: 'center' },
    { key: 'source', title: 'Source', align: 'center' },
    { key: 'similarity', title: 'Similarity', align: 'center' },
    { key: 'link', title: 'Link', align: 'center' }
  ]
  if (buyables.value.length > 0 && isAdmin.value) {
    headers.push({
      key: 'delete', title: '', align: 'center'
    })
  }
  return headers
});

const clear = async (skipConfirm = false) => {
  if (!skipConfirm) {
    const isConfirmed = await createConfirm({
      title: 'Please Confirm',
      content: 'This will clear all of your current results. Continue anyway?',
      dialogProps: { width: "auto" }
    });
    if (!isConfirmed) return;
  }

  searchSmilesQuery.value = "";
  searchSourceQuery.value = [];
  selectedSources.value = []
  buyables.value = [];
  searchLimit.value = 100;
  simThresh.value = 1
};

const showLoader = computed(() => {
  return pendingTasks.value > 0
});

const fetchAdminStatus = async () => {
  try {
    const res = await API.get("/api/user/am-i-superuser", null, false);
    isAdmin.value = res;
  } catch (error) {
    console.error("Error fetching admin status:", error);
  }
};
const openKetcher = (source) => {
  searchSmilesQuery.value = source;
  showKetcher.value = true;
  ketcherRef.value.smilesToKetcher();
};

const fetchSources = async () => {
  fetchLoad.value = true;
  await API.get('/api/buyables/sources', null, false)
    .then(json => {
      buyablesSources.value = json.sources
      fetchLoad.value = false;
    });
}

onMounted(async () => {
  await fetchAdminStatus()
  await fetchSources()
  selectedSources.value = [...buyablesSources.value]
  let urlParams = new URLSearchParams(window.location.search);
  let query = urlParams.get('q');
  if (query) {
    searchSmilesQuery.value = query;
    search();
  }
});

const search = () => {
  pendingTasks.value++;
  getBuyables(
    searchSmilesQuery.value,
    searchSourceQuery.value,
    searchRegex.value,
    searchLimit.value,
    simThresh.value,
  )
    .then(json => {
      buyables.value = json['result'];
    })
    .finally(() => {
      pendingTasks.value--
    })
};


const handleUploadSubmit = () => {
  if (!uploadFile.value) {
    alert('Please select a file to upload');
    return;
  }
  pendingTasks.value++;

  let formData = new FormData();
  formData.append('file', uploadFile.value);
  formData.append('format', uploadFileFormat.value === "JSON" ? 'json' : "csv");
  formData.append('allowOverwrite', allowOverwrite.value);
  formData.append('returnLimit', 200);

  API.post('/api/buyables/upload', formData)
    .then(json => {
      if (json.error) {
        alert(json.error)
        return
      }
      createSnackbar({ text: 'Out of ' + json.total_count + ' entries, successfully added ' + json.inserted_count + ', updated ' + json.updated_count + ', and skipped ' + json.duplicate_count + ' duplicates. Only adding (up to) ' + 2 * searchLimit.value + ' documents to the list below', snackbarProps: { timeout: -1, vertical: true } })
      if (json.inserted.length > 0) {
        buyables.value.unshift(...json.inserted)
      }
      if (json.updated.length > 0) {
        for (const updated of json.updated) {
          let inList = false
          for (const buyable of buyables.value) {
            if (buyable._id === updated._id) {
              inList = true
              buyable.ppg = updated.ppg
              buyable.source = updated.source
              break
            }
          }
          if (!inList) {
            buyables.value.unshift(updated)
          }
        }
      }
    })
    .catch((err) => {
      alert(err)
    })
    .finally(() => {
      showUploadModal.value = false;
      uploadFile.value = null;
      pendingTasks.value--;
      fetchSources()
    });
};


const addBuyable = () => {
  pendingTasks.value++;
  let body = {
    smiles: addBuyableSmiles.value,
    ppg: addBuyablePrice.value,
    source: addBuyableSource.value,
    lead_time: addBuyableLeadTime.value,
    properties: JSON.parse(addBuyableProps.value),
    allowOverwrite: allowOverwrite.value,
  };
  API.post('/api/buyables/create', body)
    .then(json => {
      if (json.error || !json.success) {
        createSnackbar({ text: "Error adding buyable compound", snackbarProps: { timeout: -1, vertical: true } })
      } else {
        if (json.inserted) {
          buyables.value.unshift(json.result)
        }
        if (json.updated) {
          for (const buyable of buyables.value) {
            if (buyable._id === json.result._id) {
              buyable.ppg = json.result.ppg
              buyable.source = json.result.source
            }
          }
        }
        if (json.duplicate == true) {
          createSnackbar({ text: "Compound already exists in database! Check allow overwrite checkbox to allow overwriting!", snackbarProps: { timeout: -1, vertical: true } })
        }
        if (json.success) {
          createSnackbar({ text: "Complete!", snackbarProps: { timeout: -1, vertical: true } })
          showAddModal.value = !showAddModal.value;
        }
      }
    })
    .finally(() => {
      pendingTasks.value--;
      fetchSources()
    });
};


const deleteBuyable = (_id) => {
  const confirmDelete = async () => {
    const isConfirmed = await createConfirm({
      title: 'Please Confirm',
      content: 'Click "OK" to confirm deleting this entry',
      dialogProps: { width: "auto" }
    });

    if (!isConfirmed) return;

    // User confirmed, now call the API
    pendingTasks.value++;

    const params = new URLSearchParams();
    params.append('pk', encodeURIComponent(_id));

    return API.delete(`/api/buyables/destroy?${params.toString()}`)
  }

  confirmDelete()
    .then(json => {
      if (json['success'] === true) {
        const indexToDelete = buyables.value.findIndex(b => b._id === _id);
        if (indexToDelete !== -1) {
          buyables.value.splice(indexToDelete, 1);
          createSnackbar({ text: "Complete!", snackbarProps: { timeout: -1, vertical: true } })
        }
      }
      if (json.error !== null) {
        alert(json.error)
      }
    })
    .finally(() => {
      pendingTasks.value--;
      fetchSources()
    });
};

const selectSource = (source) => {
  const index = selectedSources.value.indexOf(source);
  if (index === -1) {
    selectedSources.value.push(source);
  } else {
    selectedSources.value.splice(index, 1);
  }
  searchSourceQuery.value = [...selectedSources.value];
};

watch(uploadFile, (file) => {
  if (file) {
    if (file.name.endsWith('.json')) {
      uploadFileFormat.value = 'JSON'
    } else if (file.name.endsWith('.csv')) {
      uploadFileFormat.value = 'CSV'
    }
  }
});


</script>

<style scoped>
.left-justify {
  text-align: justify;
  text-justify: inter-word;
}
</style>