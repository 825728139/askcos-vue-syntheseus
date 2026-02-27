<template>
  <v-container class="fill-height" fluid style="min-height: calc(100vh-50px);">
    <v-row class="justify-center align-center">
      <v-col cols="12" md="12" xl="10" class="d-flex justify-center align-center flex-column">
        <v-expand-transition>
          <search-sheet v-show="show" />
        </v-expand-transition>

        <v-expand-transition>
          <div v-if="pendingTasks > 0 && username" class="mb-6 d-flex align-center">
            <v-card>
              <v-card-text>
                <p class="text-subtitle-2"><v-progress-circular color="primary" indeterminate
                    class="mr-2"></v-progress-circular>Fetching previous results
                </p>
              </v-card-text>
            </v-card>
          </div>
          <div v-if="recentResults.length > 0 && username" class="w-100 mb-6">
            <v-carousel v-model="pages" hide-delimiters height="200px" show-arrows="hover">
              <v-carousel-item v-for="(group, index) in groupedResults" :key="index">
                <v-sheet height="100%" width="85%"
                  :class="'mx-auto d-flex justify-center align-center' + (isDark ? ' cus-bg-grey-darken-5' : ' bg-grey-lighten-4')">
                  <v-row align="center" justify="center" height="100%">
                    <v-col v-for="(result, idx) in group" :key="idx" cols="4">
                      <v-sheet height="180px" elevation="2" rounded="lg" class="pa-4 d-flex justify-center flex-column">
                        <v-row>
                          <v-col cols="7" class="flex-column d-flex justify-center">
                            <p class="text-subtitle-2"><b>Description: </b>{{ result.description.length > 15 ?
                              result.description.substring(0, 15) + '...' : result.description }}</p>
                            <p class="text-subtitle-2"><b>State: </b>{{ result.result_state }}</p>
                            <p class="text-subtitle-2"><b>Last Updated: </b>
                              <timeago :datetime="new Date(result.modified).toISOString()" :converter-options="{
                                includeSeconds: true,
                                addSuffix: false,
                                useStrict: false,
                              }" auto-update />
                              ago
                            </p>
                            <p class="text-subtitle-2"><b>Type: </b>{{ result.result_type }}</p>
                          </v-col>
                          <v-col cols="5" class="flex-column d-flex justify-center">
                            <smiles-image height="120px" :smiles="result.target_smiles" allow-copy></smiles-image>
                          </v-col>
                        </v-row>
                        <v-row class="ma-0">
                          <v-col class="d-flex justify-center">
                            <v-btn-group v-if="result.result_state === 'completed'" size="small" density="compact"
                              divided rounded variant="tonal" class="pa-0" color="primary">
                              <v-btn size="small" data-cy="results-view-tree"
                                v-if="result.result_type === 'tree_builder'"
                                :href="`network?tab=TE&id=${result.result_id}`">View trees</v-btn>
                              <v-btn size="small" v-if="result.result_type === 'ipp'" data-cy="results-view-ipp" id="view-in-ipp"
                                :href="`network?tab=IPP&id=${result.result_id}`">View in IPP</v-btn>
                              <v-btn size="small" data-cy="results-delete-single"
                                @click="deleteResult(result.result_id)" class="text-center" color="red"
                                prepend-icon="mdi-delete">delete</v-btn>
                            </v-btn-group>
                            <v-btn v-if="result.result_state === 'started'" color="primary" variant="tonal"
                              prepend-icon="mdi-refresh" @click="fetchRecentResults">Refresh</v-btn>
                            <v-btn v-if="result.result_state === 'failed'" variant="tonal"
                              data-cy="results-delete-single" @click="deleteResult(result.result_id)"
                              class="text-center" color="red" prepend-icon="mdi-delete">delete</v-btn>
                          </v-col>
                        </v-row>
                      </v-sheet>
                    </v-col>
                  </v-row>
                </v-sheet>
              </v-carousel-item>
            </v-carousel>
            <div class="text-center">
              Page {{ pages + 1 }} of {{ Math.ceil(recentResults.length / 3) }}
            </div>
          </div>
        </v-expand-transition>
        <v-expand-transition>
          <info-sheet v-show="show" />
        </v-expand-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { API } from "@/common/api";
import InfoSheet from "@/components/home/InfoSheet";
import SearchSheet from "@/components/home/SearchSheet";
import SmilesImage from "@/components/SmilesImage";
import { useTheme } from "@/composables/useTheme";

const { isDark } = useTheme();

const username = ref(localStorage.getItem("username"))
const show = ref(false);
const recentResults = ref([]); // New reactive variable for recent results
const totalItems = ref(1);
const pendingTasks = ref(0);
const route = useRoute();
const pages = ref(0);

onMounted(() => {
  show.value = true;
  if (username.value) { fetchRecentResults(); } // Fetch recent results on mount
});

// Function to fetch recent results (mock implementation)
const fetchRecentResults = async () => {
  try {
    pendingTasks.value += 1;
    const response = await API.get("/api/results/list", null, false);
    if (Array.isArray(response)) {
      response.forEach(doc => {
        doc.created = new Date(doc.created + "Z").toLocaleString();
        doc.modified = new Date(doc.modified + "Z").toLocaleString();
      });
      // Sort and set recent results in one go
      recentResults.value = response.sort((a, b) => new Date(b.modified) - new Date(a.modified));
      totalItems.value = recentResults.value.length; // Set total items directly
    } else {
      console.error("API did not return an array as expected:", response);
    }
  } catch (error) {
    console.error("Error fetching results:", error);
  } finally {
    pendingTasks.value -= 1;
  }
};

// Computed property to group results into sets of three
const groupedResults = computed(() => {
  const groups = [];
  for (let i = 0; i < recentResults.value.length; i += 3) {
    groups.push(recentResults.value.slice(i, i + 3));
  }
  return groups;
});

// Function to delete a result
const deleteResult = async (resultId) => {
  try {
    pendingTasks.value += 1;
    // Make an API call to delete the result
    const json = await API.delete(`/api/results/destroy?result_id=${resultId}`);
    if (json.success) {
      // Update the local state to remove the deleted result
      recentResults.value = recentResults.value.filter(result => result.id !== resultId);
    }
  } catch (error) {
    console.error("Error deleting result:", error);
  } finally {
    pendingTasks.value -= 1;
    fetchRecentResults()
  }
};

watch(route, (to) => {
  if (to.name === 'Home') {
    fetchRecentResults();
  }
});
</script>

<style scoped>
.custom-carousel {
  height: 300px;
  /* Adjust this to a specific height if needed */
  min-height: 300px;
  /* Set a minimum height for the carousel */
}

.cus-bg-grey-darken-5 {
  background-color: #121212
}
</style>
