<template>
  <v-row class="mt-3 justify-center">
    <v-col cols="12" md="9" data-cy="home-smiles-input-field">
      <v-autocomplete v-model="smilesInput" :search="searchText" variant="outlined"
        label="Type here or draw structure..." prepend-inner-icon="mdi mdi-flask" placeholder="SMILES" hide-details
        clearable rounded="pill" data-cy="home-searchbar" @update:search="onSearchUpdate"
        @focus="showRecentSearches = true" @input="showRecentSearches = false"
        :items="showRecentSearches ? recentSearches : []" menu-icon="" hide-no-data filled item-props>
        <template v-slot:prepend>
          <v-tooltip max-width="200px" location="bottom">
            <template v-slot:activator="{ props }" v-if="enableResolver">
              <v-btn v-bind="props" icon="mdi mdi-server" :class="allowResolve ? 'text-green' : 'text-grey'"
                @click="toggleResolver" variant="flat" data-cy="home-NIH-resolver">
              </v-btn>
            </template>
            <p v-if="!!allowResolve">
              Connection to NIH name resolver is ON, structures may be sent to
              an external service. This can be turned off in the settings menu,
              or by clicking this icon.
            </p>
            <span v-else>Connection to NIH name resolver is OFF, structures will NOT be
              sent to an external service. Target query must be a SMILES string.
              This can be turned on in the settings menu, or by clicking this
              icon.</span>
          </v-tooltip>
        </template>
        <template v-slot:append-inner>
          <DrawButton v-if="!allowResolve" :smiles="smilesInput" @update:smiles="smilesInput = $event" />
          <v-btn v-if="allowResolve" variant="flat" prepend-icon="mdi mdi-magnify" @click="() => {
            resolveSmiles();
          }
          " rounded="pill" color="green" data-cy="home-resolve-btn" class="text-none">Resolve</v-btn>
        </template>
        <template v-slot:append>
          <v-btn variant="flat" color="primary" prepend-icon="mdi mdi-web" size="large" @click="canonicalize()"
            data-cy="home-canonicalize" rounded="pill" class="text-none">Canonicalize</v-btn>
        </template>
      </v-autocomplete>
    </v-col>
  </v-row>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { API } from "@/common/api";
import DrawButton from "@/components/DrawButton";
import { useDebounceFn } from "@vueuse/core";
import { useConfigStore } from "@/store/config";
import { resolveChemName } from "@/common/resolver";
import { useConfirm } from "vuetify-use-dialog";
import { useSettingsStore } from "@/store/settings";

const MAX_SEARCH_HISTORY = 5;

const configStore = useConfigStore();
const settingsStore = useSettingsStore();

const smilesInput = defineModel("smilesInput", {
  required: true,
  default: null,
});

const showRecentSearches = ref(false);
const recentSearches = ref([]);
const searchText = ref("");

const enableResolver = computed({
  get: () => configStore.envs.VITE_ENABLE_SMILES_RESOLVER === "True",
});
const allowResolve = computed({
  get() {
    return settingsStore.allowResolve;
  },
  set(value) {
    settingsStore.allowResolve = value;
  },
});

const createConfirm = useConfirm();

const loadUserSearchHistory = () => {
  const username = localStorage.getItem("username");
  if (!username) return;

  const allSearchHistories =
    JSON.parse(localStorage.getItem("searchHistories")) || {};
  recentSearches.value = (allSearchHistories[username] || []).map((item) => ({
    title: item,
    prependIcon: "mdi-clock-outline",
  }));
};

const resolveSmiles = async () => {
  try {
    smilesInput.value = await resolveChemName(smilesInput.value);
    searchText.value = smilesInput.value;
    showRecentSearches.value = false;
  } catch (error) {
    createConfirm({
      title: "Action Unsuccessful",
      content: error.message,
      dialogProps: { width: "auto" },
    });
  }
};

const canonicalize = async () => {
  try {
    const json = await API.post("/api/rdkit/canonicalize/", {
      smiles: smilesInput.value,
    });
    smilesInput.value = json.smiles;
    searchText.value = smilesInput.value;
  } catch (error) {
    createConfirm({
      title: "Action Unsuccessful",
      content: "Could not canonicalize: " + error.message,
      dialogProps: { width: "auto" },
    });
  }
};

const toggleResolver = () => {
  allowResolve.value = !allowResolve.value;
};

const updateRecentSearches = useDebounceFn((searchValue) => {
  if (!searchValue) return;

  smilesInput.value = searchValue;

  const username = localStorage.getItem("username");
  if (!username) return;

  const allSearchHistories =
    JSON.parse(localStorage.getItem("searchHistories")) || {};
  const userSearches = [
    ...new Set([searchValue, ...(allSearchHistories[username] || [])]),
  ].slice(0, MAX_SEARCH_HISTORY); // Keep only last 5 searches
  allSearchHistories[username] = userSearches;

  localStorage.setItem("searchHistories", JSON.stringify(allSearchHistories));

  recentSearches.value = userSearches.map((item) => ({
    title: item,
    prependIcon: "mdi-history",
  }));
}, 1000);

const onSearchUpdate = (value) => {
  searchText.value = value;
  updateRecentSearches(value);
};

onMounted(() => {
  loadUserSearchHistory();
});

watch(smilesInput, (val) => {
  searchText.value = val || "";
});
</script>
