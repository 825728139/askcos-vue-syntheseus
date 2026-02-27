<template>
  <v-container fluid>
    <bread-crumbs pageTitle="My Results" />
    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="10" class="py-0">
        <v-sheet elevation="2" rounded="lg" class="ma-0 pa-10">
          <v-text-field data-cy="results-search-desc" v-model="searchQuery" prepend-inner-icon="mdi mdi-flask"
            density="compact" variant="outlined" label="Search Result Descriptions" hide-details clearable
            id="results-text" rounded="pill">
            <template v-slot:append>
              <v-btn data-cy="results-search" color="primary" variant="flat" class="mr-5" id="results-search"
                rounded="pill">
                Search
              </v-btn>
              <v-btn data-cy="results-multiple-delete" v-if="allResults.length" icon="mdi-delete" class="bg-red mr-5"
                :disabled="selection.length === 0" variant="flat" @click="deleteSelection" id="results-delete">
              </v-btn>
              <v-btn data-cy="results-table-update" icon="mdi-refresh" variant="tonal" @click="update"
                id="results-update">
              </v-btn>
            </template>
          </v-text-field>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="10">
        <v-sheet elevation="2" rounded="lg" class="d-flex justify-center pa-5" data-cy="results-table">
          <v-data-table :loading="pendingTasks > 0" v-if="allResults.length || pendingTasks > 0" :headers="headers"
            item-value="result_id" :items="filteredResults" show-select v-model:expanded="expanded" show-expand
            v-model="selection" :items-per-page="10" :search="searchQuery" @click:row="clickRow" id="results-table"
            :row-props="colorRowItem">
            <template v-slot:top v-if="refreshInterval">
              <span><v-progress-circular indeterminate color="primary" class="mr-2"></v-progress-circular>Some task are
                pending, auto refreshing every 1s ...</span>
            </template>
            <template v-slot:item.delete="{ item }">
              <v-icon data-cy="results-delete-single" @click="deleteResult(item.result_id)"
                class="text-center">mdi-delete</v-icon>
            </template>
            <template v-slot:item.result_state="{ item }">
              <v-chip data-cy="results-state-completed" color="green" variant="flat"
                v-if="item.result_state === 'completed'">
                <v-icon icon="mdi-check-circle" start></v-icon>
                Completed
              </v-chip>
              <v-chip data-cy="results-state-started" color="orange-darken-1" variant="flat"
                v-if="item.result_state === 'started'">
                <v-icon icon="mdi-timer" start></v-icon>
                Started
              </v-chip>
              <v-chip data-cy="results-state-failed" color="red-darken-1" variant="flat"
                v-if="item.result_state === 'failed'">
                <v-icon icon="mdi-alert-circle" start></v-icon>
                Failed
              </v-chip>
            </template>
            <template v-slot:item.public="{ item }">
              <v-icon v-if="item.public === true">
                mdi-check
              </v-icon>
            </template>
            <template v-slot:item.description="{ item }">
              <div>
                <p><strong>{{ item.description || "No Description" }}</strong></p>
                <p v-if="item.num_trees">{{ `Found ${item.num_trees} trees` }}</p>
                <p v-else>No trees found</p>
              </div>
            </template>
            <template v-slot:expanded-row="{ columns, item }">
              <tr>
                <td :colspan="columns.length">
                  <div class="d-flex my-3">
                    <span class="align-center" style="max-width: 400px" v-if="item.tags[0] != ''">
                      <p v-if="item.tags.length > 0" class="text-center mr-3">Tags:
                        <v-chip class="text-center ma-1" v-for="tag in item.tags" :key="tag" small>
                          {{ tag }}
                        </v-chip>
                      </p>
                    </span>
                    <div class="d-flex justify-space-evenly flex-grow-1">
                      <v-btn data-cy="results-view-trees" color="primary" variant="tonal"
                        v-if="item.result_type === 'tree_builder' && item.result_state === 'completed'"
                        :href="`network?tab=TE&id=${item.result_id}`">
                        View trees
                      </v-btn>
                      <v-btn data-cy="results-view-ipp" color="primary" variant="tonal"
                        v-if="item.result_type === 'tree_builder' && item.result_state === 'completed'"
                        :href="`network?tab=IPP&id=${item.result_id}&view=25`">
                        View in IPP
                      </v-btn>
                      <v-btn color="primary" variant="tonal" v-if="item.result_type === 'ipp'" id="view-in-ipp"
                        :href="`network?tab=IPP&id=${item.result_id}`">
                        View in IPP
                      </v-btn>
                      <v-btn data-cy="results-view-settings" color="primary" variant="tonal"
                        v-if="item.result_type === 'tree_builder'" :disabled="item.result_state === 'started'"
                        @click="openSetting(item.result_id)">
                        View Settings
                      </v-btn>
                      <v-btn class="bg-orange-darken-1" variant="tonal" @click="openChangeDescription(item)">
                        Change Description
                      </v-btn>
                      <v-btn data-cy="results-share-result" class="bg-teal-darken-1" variant="tonal"
                        @click="shareResult(item.result_id)">
                        <v-icon color="white">
                          mdi-share
                        </v-icon>
                        Share
                      </v-btn>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </v-data-table>
          <div v-else class="text-center">
            <v-img :width="400" cover :src="results"></v-img>
            <h6 class="mt-2 text-h6">No Results Yet...</h6>
            <p class="mt-2 text-body-1">Try exploring ASKCOS</p>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="treeDialog" max-width="700px" scrollable>
    <v-card>
      <v-card-title class="text-justify">
        <v-col cols="12">Tree Builder Job Settings</v-col>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pt-0">
        <tb-settings-table data-cy="tree-builder-settings-table" v-if="viewSettings" :settings="viewSettings"
          :targetSmiles="targetSmiles" :tbVersion="tbVersion"></tb-settings-table>
        <v-alert v-else type="warning" class="mb-0" dense text>Settings not available.</v-alert>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn data-cy="results-tree-builder-settings-close" color="primary" text
          @click="treeDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showShareModal" max-width="600px">
    <v-card>
      <v-card-title class="text-justify mt-2">
        <v-col cols="12">Share Result</v-col></v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <p>Use the following link to share this result:</p>
            <copy-tooltip data-cy="results-share-link-text" :data="shareLink" no-highlight location="bottom-right">
              <v-text-field v-model="shareLink" readonly allow-copy append-icon="mdi-content-copy">
              </v-text-field>
            </copy-tooltip>
            <v-alert type="warning">Please note that shared results cannot be edited and saved simultaneously by
              multiple
              users.</v-alert>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="showShareModal = false">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showChangeDescriptionModal" max-width="600px">
    <v-card>
      <v-card-title class="text-justify mt-2">
        <v-col cols="12">Change Description</v-col></v-card-title>
      <v-card-text>
        <v-text-field v-model="newDescription" label="New Description" outlined id="new-description"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" text @click="showChangeDescriptionModal = false" id="cancel">Cancel</v-btn>
        <v-btn color="green darken-1" text id="save" @click="saveChangeDescription">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog data-cy="results-share-modal-popup" v-model="showSharedResultModal" max-width="600px">
    <v-card>
      <v-card-title class="text-justify">
        <v-col cols="12">
          View Shared Result
        </v-col></v-card-title>

      <v-card-text>
        <p class="px-3">The following result has been shared with you. It will now appear in your results list.</p>
        <v-container v-if="sharedResult" fluid>
          <v-row>
            <v-col cols="12" sm="3"><strong>Description</strong></v-col>
            <v-col cols="12" sm="9">{{ sharedResult.description }}</v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="3"><strong>Modified</strong></v-col>
            <v-col cols="12" sm="9">{{ sharedResult.modified }}</v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="3"><strong>Type</strong></v-col>
            <v-col cols="12" sm="9">{{ sharedResult.type }}</v-col>
          </v-row>
          <!-- <v-row>
            <v-col cols="12" sm="3"><strong>Tags</strong></v-col>
            <v-col cols="12" sm="9">
              <v-chip v-for="tag in sharedResult.tags" :key="tag" class="mr-1">{{ tag }}</v-chip>
            </v-col>
          </v-row> -->
          <v-row>
            <v-col cols="12" sm="3"><strong>Actions</strong></v-col>
            <v-col cols="12" sm="9">
              <v-btn v-if="sharedResult.type === 'tree_builder' && sharedResult.state === 'completed'" variant="flat"
                color="primary" small class="mr-1" :href="`/network?tab=TE&id=${sharedResult.id}`" target="_blank">
                View trees
              </v-btn>
              <v-btn v-if="sharedResult.type === 'tree_builder' && sharedResult.state === 'completed'" variant="flat"
                color="primary" small class="mr-1" :href="`/network?tab=IPP&id=${sharedResult.id}&view=25`"
                target="_blank">
                View in IPP
              </v-btn>
              <v-btn v-if="sharedResult.type === 'ipp'" color="primary" variant="flat" small class="mr-1"
                :href="`/network?tab=IPP&id=${sharedResult.id}&view=25`" target="_blank">
                View in IPP
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
        <v-alert type="warning" dense> Please note that shared results cannot be edited and saved simultaneously by
          multiple users. </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn data-cy="results-close-shared-modal" color="primary" text
          @click="showSharedResultModal = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick, onUnmounted } from 'vue';
import BreadCrumbs from "@/components/BreadCrumbs";
import CopyTooltip from "@/components/CopyTooltip";
import TbSettingsTable from '@/components/TbSettingsTable.vue';
import results from "@/assets/emptyResults.svg";
import { API } from "@/common/api";

const allResults = ref([]);
const totalItems = ref(1);
const pendingTasks = ref(0);
const selection = ref([]);
const selectAll = ref(false);
const expanded = ref([]);
const searchQuery = ref("");
const showSharedResultModal = ref(false);
const showShareModal = ref(false);
const showChangeDescriptionModal = ref(false);
const newDescription = ref("");
const selectedResultId = ref(null);
const shareLink = ref("");
const sharedResult = ref(null);
const sortDescending = ref(true);
const treeDialog = ref(false);
const viewSettings = ref(null);
const targetSmiles = ref("")
const refreshInterval = ref(null);
const tbVersion = ref(null);
const headers = ref([
  { key: 'description', title: 'Result', },
  { key: 'modified', title: 'Modified' },
  { key: 'result_state', title: 'State' },
  { key: 'result_type', title: 'Type' },
  { key: 'public', title: 'Shared' },
  { key: 'delete', title: 'Delete' },
]);
const isReqInProgress = ref(false);

const clickRow = (_event, { item }) => {
  const index = expanded.value.findIndex(i => i === item.result_id);
  if (index !== -1) {
    expanded.value.splice(index, 1)
  } else {
    expanded.value.push(item.result_id);
  }
}

const checkAndRefreshResults = () => {
  const hasNonCompletedResults = allResults.value.some(result => result.result_state === "started");

  if (hasNonCompletedResults) {
    if (!refreshInterval.value) {
      refreshInterval.value = setInterval(() => {
        if (!isReqInProgress.value) { // Check if no request is in progress
          isReqInProgress.value = true; // Set the flag to true
          update(true).finally(() => {
            isReqInProgress.value = false; // Reset the flag when the request completes
          });
        }
      }, 1000);
    }
  } else {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
      refreshInterval.value = null;
    }
  }
};

const sortedAllResults = computed(() => {
  return allResults.value.sort((a, b) => {
    const dateA = new Date(a.modified);
    const dateB = new Date(b.modified);

    if (dateA < dateB) return sortDescending.value ? 1 : -1;
    if (dateA > dateB) return sortDescending.value ? -1 : 1;
    return 0;
  });
})

const isRecentlyUpdated = (updatedAt) => {
  const highlightThreshold = 30000; // e.g., 60 seconds
  let ans = Date.now() - new Date(updatedAt).getTime() < highlightThreshold;
  return ans
};

const colorRowItem = computed(() => {
  return (item) => {
    return {
      class: {
        'highlight-row': isRecentlyUpdated(item.item.modified)
      }
    };
  };
});

const filteredResults = computed(() => {
  if (!searchQuery.value) return sortedAllResults.value;

  return sortedAllResults.value.filter(item => {
    const descriptionMatch = item.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    return descriptionMatch;
  });
});

const getCurrentBaseUrl = () => {
  const url = window.location.href;
  const pathArray = url.split('/');
  const protocol = pathArray[0];
  const host = pathArray[2];

  return `${protocol}//${host}`;
};

const baseUrl = getCurrentBaseUrl();

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  let sharedId = urlParams.get("shared");
  if (sharedId) {
    await addSharedResult(sharedId);
    await update();
    showSharedResultModal.value = true;
  } else {
    await update();
  }
});

watch(selectAll, (newVal) => {
  if (newVal) {
    selection.value = allResults.value.map((res) => res.result_id);
  } else {
    selection.value = [];
  }
});

const shareResult = async (id) => {
  pendingTasks.value += 1;
  try {
    const params = new URLSearchParams();
    params.append('result_id', id);
    const json = await API.get("/api/results/share", params.toString());
    shareLink.value = baseUrl + json.url;
    await nextTick();
    showShareModal.value = true;
    for (const res of allResults.value) {
      if (res.id === id) {
        res.public = true;
        break;
      }
    }
  } catch (error) {
    alert("Could not share result: " + error);
  } finally {
    pendingTasks.value -= 1;
  }
}


const openSetting = async (id) => {
    pendingTasks.value += 1;
  try {
    const json = await API.get("/api/results/retrieve", { result_id: id });
    if (json) {
      treeDialog.value = true
      targetSmiles.value = json.target_smiles
      viewSettings.value = json.settings
      tbVersion.value = json.result.version
    }
  } finally {
    pendingTasks.value -= 1;
  }
}

async function addSharedResult(id) {
  pendingTasks.value += 1;
  try {
    const json = await API.post(`/api/results/add?result_id=${id}`);
    json.result.created = json.result.created.toString()
    json.result.modified = json.result.modified.toString()
    sharedResult.value = json.result;
  } catch (error) {
    alert("Could not add shared result: " + error);
  } finally {
    pendingTasks.value -= 1;
  }
}

watch(allResults, () => {
  checkAndRefreshResults();
});

const update = async (supressLoading = false) => {
  if (!supressLoading) {
    pendingTasks.value += 1;
  }
  try {
    const response = await API.get("/api/results/list", null, false);
    if (Array.isArray(response)) {
      response.forEach(doc => {
        doc.created = new Date(doc.created + "Z").toLocaleString();
        doc.modified = new Date(doc.modified + "Z").toLocaleString();
      });
      allResults.value = response;
      totalItems.value = response.length;
    } else {
      console.error("API did not return an array as expected:", response);
    }
  } catch (error) {
    console.error("Error fetching results:", error);
  } finally {
    if (!supressLoading) {
      pendingTasks.value -= 1;
      checkAndRefreshResults();
    }
  }
}

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});

const openChangeDescription = (item) => {
  selectedResultId.value = item.result_id;
  newDescription.value = item.description || "";
  showChangeDescriptionModal.value = true;
};

const saveChangeDescription = async () => {
  if (!selectedResultId.value) return;
  pendingTasks.value += 1;
  try {
    const list = await API.get("/api/results/list", null, false);
    const current = Array.isArray(list)
      ? list.find((r) => r.result_id === selectedResultId.value)
      : null;
    if (!current) {
      alert("Could not find the selected result in the latest list.");
      return;
    }
    const updated = {
      description: newDescription.value,
      revision: Number(current.revision ?? 0) + 1,
    };
    await API.put(`/api/results/update?result_id=${encodeURIComponent(selectedResultId.value)}`, updated);
    showChangeDescriptionModal.value = false;
    await update();
  } catch (error) {
    alert("Could not update description: " + error);
  } finally {
    pendingTasks.value -= 1;
  }
};

const deleteSelection = () => {
  if (window.confirm(`This will permanently delete ${selection.value.length} results. Continue?`)) {
    pendingTasks.value += 1;
    for (const id of selection.value) {
      deleteResult(id, true);
    }
    selection.value = [];
    pendingTasks.value -= 1;
  }
}

const deleteResult = (id, skipConfirm = false) => {
  if (skipConfirm || window.confirm('Click "OK" to confirm deleting this result')) {
    pendingTasks.value += 1;
    try {
      const json = API.delete(`/api/results/destroy?result_id=${id}`);
      if (json.success) {
        allResults.value = allResults.value.filter(result => result.id !== id)
      }
    } finally {
      pendingTasks.value -= 1;
      update()
    }
  }
}
</script>

<style scoped>
:deep(.highlight-row) {
  background-color: #e0f7fa;
  border-left: 4px solid #00796b;
  padding: 10px;
  transition: background-color 0.3s ease;
}

:deep(.highlight-row td:first-child) {
  border-left: 4px solid #00796b;
}

.v-theme--dark {
  :deep(.highlight-row) {
    background-color: #004d40;
    border-left: 4px solid #80cbc4;
    padding: 10px;
    transition: background-color 0.3s ease;
  }

  :deep(.highlight-row td:first-child) {
    border-left: 4px solid #80cbc4;
  }
}
</style>