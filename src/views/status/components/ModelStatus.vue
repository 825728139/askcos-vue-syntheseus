<template>
  <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6">
    <v-card-title>
      <v-row align="center" justify="space-between">
        <v-col>
          <h3 class="text-h5">Model Server Status</h3>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="auto">
          <span class="text-body-2 mr-3">Last Update:
            <timeago :datetime="date" :converter-options="{
              includeSeconds: true,
              addSuffix: false,
              useStrict: false,
            }" auto-update />
            ago
          </span>
          <v-btn icon @click="getStatus" :disabled="loading">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <div v-if="!loading">
      <v-data-table :headers="headers" :items="data" :items-per-page="100">
        <template v-slot:item.ready="{ item }">
          <v-icon :color="item.ready ? 'success' : 'error'"
            :icon="item.ready ? 'mdi-check-circle' : 'mdi-alert-circle'" />
        </template>
        <template v-slot:item.available_model_names="{ item }">
          <div v-if="item.available_model_names && item.available_model_names.length > 0">
            <div v-for="modelName in item.available_model_names" :key="modelName" class="my-2">
              {{ modelName.trim() }}
            </div>
          </div>
        </template>
        <template #bottom></template>
      </v-data-table>
    </div>
    <div v-if="loading">
      <v-skeleton-loader class="mx-auto" min-height="150px" type="table">
      </v-skeleton-loader>
    </div>
  </v-sheet>
</template>

<script setup>
import { API } from "@/common/api";
import { onMounted, ref } from "vue"
import { useConfirm } from 'vuetify-use-dialog';

const createConfirm = useConfirm()
const data = ref([]);
const date = ref(new Date());

const headers = [
  { key: 'name', title: 'Model Name' },
  { key: 'description', title: 'Model Description' },
  { key: 'available_model_names', title: 'Available Model Names' },
  { key: 'ready', title: 'Online' },
];

const loading = ref(false);

const getStatus = async () => {
  loading.value = true;

  try {
    const json = await API.get('/api/admin/get-backend-status', null, false);
    data.value = json['modules'];
    date.value = new Date();
  } catch (error) {
    createConfirm({ title: "Action Unsuccessful", content: "Model Status " + error, dialogProps: { width: "auto" } })
  } finally {
    loading.value = false;
  }
};

onMounted(() => getStatus())
</script>
