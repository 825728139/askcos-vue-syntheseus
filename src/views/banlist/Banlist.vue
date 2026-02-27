<template>
  <v-container fluid>
    <bread-crumbs pageTitle="My Banlist" />
    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="10" class="py-0">
        <v-sheet elevation="2" rounded="lg">
          <v-row class="mb-2 px-5 pt-2">
            <v-col cols="12">
              <p class="text-body-3">
                This page lists chemicals and reactions that you have identified as problematic in some way. Entries
                listed as active will be excluded from retrosynthetic predictions using the interactive path planner and
                tree builder. You can delete or deactivate any of these banned items at any time.
              </p>
            </v-col>
            <v-col cols="12" class="d-flex justify-center">
              <v-btn variant="tonal" data-cy="banlist-add-single-entry" color="teal-darken-1 " @click="showBanItemDialog = true" class="mr-2">
                Add New Entry
              </v-btn>
              <v-btn color="orange" data-cy="banlist-add-multiple-entries" variant="tonal" @click="showMultiEntryDialog = true" class="mr-2">
                Add Multiple Entries
              </v-btn>
              <v-btn variant="tonal" color="red" @click="deleteAll()" data-cy="banlist-reset">Reset</v-btn>
            </v-col>
          </v-row>

          <v-tabs v-model="activeTab" color="primary" align-tabs="center" grow class="mb-0">
            <v-tab>Chemicals</v-tab>
            <v-tab>Reactions</v-tab>
          </v-tabs>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="10">
        <v-sheet width="100%" class="pa-6" rounded="lg" elevation="2" data-cy="banlist-table">
          <v-select v-if="tabItems.length || filterActive !== 'all'" v-model="filterActive" :items="filterOptions"
            item-text="title" item-value="key" label="Filter by status" density="comfortable" variant="outlined"
            hide-details clearable></v-select>
          <v-row v-if="tabItems.length || pendingTasks > 0">
            <v-col cols="12">
              <v-data-table :headers="headers" :items="tabItems" :items-per-page="10" :loading="pendingTasks > 0">
                <template v-slot:item.active="{ item }">
                  <v-btn @click="toggleActivation(item, activeTab === 0 ? 'chemicals' : 'reactions')" small>
                    <v-icon v-if="item.active">mdi-check-circle</v-icon>
                    <v-icon v-else>mdi-cancel</v-icon>
                    {{ item.active ? 'Active' : 'Inactive' }}
                  </v-btn>
                </template>
                <template #item.smiles="{ item }">
                  <copy-tooltip :data="item.smiles">
                    <smiles-image :smiles="item.smiles"></smiles-image>
                  </copy-tooltip>
                </template>
                <template v-slot:item.delete="{ item }">
                  <v-icon
                    @click="activeTab === 0 ? deleteEntry(item.id, 'chemicals') : deleteEntry(item.id, 'reactions')"
                    class="text-center" data-cy="banlist-single-delete" >mdi-delete</v-icon>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
          <v-row v-else class="pa-5">
            <v-col cols="12" class="d-flex justify-center align-center">
              <div v-if="filterActive == 'all'" class="d-flex text-center justify-center align-center flex-column">
                <v-img :width="300" cover :src="banlist"></v-img>
                <h6 class="mt-2 text-h6">No Ban Items</h6>
                <p class="text-body-1">Add banned chemicals/reactions via IPP/Tree Explorer or add manually above</p>
              </div>
              <div v-else class="d-flex text-center justify-center align-center flex-column">
                <v-img :width="300" cover :src="banlist"></v-img>
                <h6 class="mt-2 text-h6">No Ban Items</h6>
                <p class="text-body-1">Try different filter</p>
              </div>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>

    <ban-item-dialog v-model:showBanItemDialog="showBanItemDialog" v-model:pendingTasks="pendingTasks"
      v-model:activeTab="activeTab" @loadCollection="loadCollection" />

    <multi-entry-dialog v-model:showMultiEntryDialog="showMultiEntryDialog" v-model:pendingTasks="pendingTasks"
      @loadCollection="loadCollection" />
  </v-container>
</template>

<script setup>
import banlist from "@/assets/banlist.svg";
import { ref, computed, onMounted } from 'vue';
import SmilesImage from "@/components/SmilesImage";
import CopyTooltip from "@/components/CopyTooltip";
import { API } from "@/common/api";
import dayjs from 'dayjs';
import BreadCrumbs from "@/components/BreadCrumbs"
import BanItemDialog from "@/components/banlist/BanItemDialog"
import MultiEntryDialog from "@/components/banlist/MultiEntryDialog"

const activeTab = ref(0);
const chemicals = ref([]);
const reactions = ref([]);
const showBanItemDialog = ref(false);
const showMultiEntryDialog = ref(false);

const filterActive = ref('all');
const pendingTasks = ref(0);
const filterOptions = ref([
  { key: 'all', title: 'All' },
  { key: 'active', title: 'Active' },
  { key: 'inactive', title: 'Inactive' },
]);

const headers = computed(() => {
  const baseHeaders = [
    { key: 'active', title: 'Active' },
    { key: 'created', title: 'Created' },
    { key: 'smiles', title: 'Chemical' },
    { key: 'description', title: 'Description' },
    { key: 'delete', title: 'Delete' },
  ];

  if (activeTab.value === 1) {
    baseHeaders[2].title = 'Reaction';
  }

  return baseHeaders;
});

const loadCollection = (category) => {
  pendingTasks.value++;
  API.get(`/api/banlist/${category}/get`, null, false)
    .then(json => {
      json.forEach(function (doc) {
        doc.created = dayjs(doc.created).format('MMMM D, YYYY h:mm A');
      });
      if (category === 'chemicals') {
        chemicals.value = json
      } else {
        reactions.value = json
      }
    })
    .finally(() => {
      pendingTasks.value--;
    })
}

onMounted(() => {
  loadCollection('chemicals');
  loadCollection('reactions');
});


const tabItems = computed(() => {
  let items = activeTab.value === 0 ? chemicals.value : reactions.value;
  switch (filterActive.value) {
    case 'active':
      return items.filter(item => item.active === true);
    case 'inactive':
      return items.filter(item => item.active === false);
    default:
      return items;
  }
});

const deleteEntry = (id, category) => {
  pendingTasks.value++;
  API.delete(`/api/banlist/${category}/delete?_id=${id}`)
    .then(() => {
      loadCollection(category);
    })
    .finally(() => {
      pendingTasks.value--;
    });
}

const deleteAll = () => {
  pendingTasks.value++;
  const chemicalsToDelete = chemicals.value;
  chemicalsToDelete.forEach(item => {
    API.delete(`/api/banlist/chemicals/delete?_id=${item.id}`)
  })
  loadCollection("chemicals")

  const reactionsToDelete = reactions.value;
  reactionsToDelete.forEach(item => {
    API.delete(`/api/banlist/reactions/delete?_id=${item.id}`)
  })
  loadCollection("reactions")
  pendingTasks.value--;
}

const toggleActivation = async (item, category) => {
  pendingTasks.value++;
  const action = item.active ? 'deactivate' : 'activate';
  await API.get(`/api/banlist/${category}/${action}`, {
    _id: item.id
  }).then(() => {
    loadCollection(category);
  }).catch((error) => {
    console.error("Error toggling activation:", error);
  }).finally(() => {
    pendingTasks.value--;
  });
};
</script>