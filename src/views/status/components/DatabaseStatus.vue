<template>
  <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6">
    <v-card-title>
      <v-row align="center" justify="center">
        <v-col cols="auto">
          <h3 class="text-h5">Database Status</h3>
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
      <v-data-table v-model:expanded="expanded" :headers="headers" :items="data" show-expand item-value="name"
        :items-per-page="100">
        <template v-slot:item.url="{ item }">
          <router-link v-if="item.url" :to="item.url">
            <v-btn color="primary">
              Search Collection
            </v-btn>
          </router-link>
        </template>
        <template v-slot:expanded-row="{ columns, item }">
          <td :colspan="columns.length">
            <v-table density="compact" class="text-left">
              <thead>
                <tr>
                  <th class="text-left">{{ item.field }}</th>
                  <th class="text-left">Documents</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(value, key) in item.details" :key="key">
                  <td>{{ key }}</td>
                  <td>{{ value }}</td>
                </tr>
              </tbody>
            </v-table>
          </td>
        </template>
        <template #bottom></template>
      </v-data-table>
    </div>

    <div v-if="loading">
      <v-skeleton-loader class="mx-auto" min-height="60px" type="table">
      </v-skeleton-loader>
    </div>

  </v-sheet>
</template>


<script setup>
import { API } from "@/common/api";
import { ref, onMounted } from "vue";
import { useConfirm } from 'vuetify-use-dialog';

const createConfirm = useConfirm()
const data = ref([]);
const headers = [
  { key: 'name', title: 'Collection Name' },
  { key: 'description', title: 'Description' },
  { key: 'total', title: 'Total Documents' },
  { key: 'url', title: '' },
  { key: 'show_details', title: '' }];
const loading = ref(false);
const expanded = ref([])
const date = ref(new Date())

const getStatus = async () => {
  loading.value = true;
  try {
    const json = await API.get('/api/status/database/get', null, false);
    data.value = json['collections'];
    date.value = new Date();
  } catch (error) {
    createConfirm({ title: "Action Unsuccessful", content: "Database Status " + error, dialogProps: { width: "auto" } })
  } finally {
    loading.value = false;
  }
};

onMounted(() => getStatus())

</script>
