<template>
    <v-container fluid>
        <bread-crumbs pageTitle="Molecular Complexity" />
        <v-row class="justify-center">
            <v-col cols="12" md="12" xl="10">
                <v-sheet elevation="2" rounded="lg" class="pa-5">
                    <v-row class="justify-center" density="compact">
                        <v-col cols="12" md="10" my="10">
                            <v-text-field v-model="smiles" data-cy="molcom-smiles-input" class="centered-input"
                                variant="outlined" label="Enter a molecule SMILES" prepend-inner-icon="mdi mdi-flask"
                                placeholder="SMILES" hide-details clearable @click:clear="smiles = ''" rounded="pill">
                                <template v-slot:append-inner>
                                    <draw-button v-model:smiles="smiles" />
                                </template>
                                <template v-slot:append>
                                    <v-btn data-cy="molcom-submit-button" type="submit" variant="flat" color="success"
                                        class="mr-5" :loading="!batch && loading" rounded="pill" @click="predict"
                                        :disabled="!smiles">Submit</v-btn>
                                    <v-btn data-cy="molcom-clear-button" variant="tonal" class="mr-5"
                                        :disabled="results.length === 0" @click="clear()" rounded="pill">
                                        Clear Results
                                    </v-btn>
                                </template>
                            </v-text-field>
                            <div v-if="!!smiles" class="my-3">
                                <smiles-image :smiles="smiles" height="100px"></smiles-image>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row class="justify-center" density="compact">
                        <v-col cols="12" md="10">
                            <v-select v-model="selectedComplexityMetrics" :items="complexityMetrics"
                                label="Select Complexity Metrics" multiple chips data-cy="molcom-complexity-metrics"
                                hide-details variant="outlined" class="mt-2" clearable></v-select>
                        </v-col>
                    </v-row>
                </v-sheet>
            </v-col>
        </v-row>

        <v-row class="justify-center">
            <v-col v-show="pendingTasks > 0 || results.length" cols="12" md="12" xl="10">
                <v-sheet elevation="2" class="pa-4" rounded="lg" data-cy="molcom-table">
                    <v-row class="mt-3" style="overflow-x:scroll">
                        <v-col cols="12">
                            <v-menu location="bottom">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-show="!!results.length" color="primary" v-bind="props"
                                        prepend-icon="mdi mdi-download" variant="flat" data-cy="molcom-download"
                                        class="ma-3">
                                        Download
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item data-cy="molcom-download-csv" @click="downloadCSV()">Download
                                        CSV</v-list-item>
                                    <v-list-item data-cy="molcom-download-json" @click="downloadJSON()">Download
                                        JSON</v-list-item>
                                </v-list>
                            </v-menu>
                            <v-data-table :items="results" :headers="resultsHeaders" :items-per-page="10"
                                :loading="pendingTasks > 0" :row-props="colorRowItem">
                                <template v-slot:loading>
                                    <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                                </template>
                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-sheet>
            </v-col>
            <v-col v-show="!results.length && pendingTasks === 0" cols="12" md="12" xl="10">
                <v-sheet elevation="2" rounded="lg" class="pa-4">
                    <div class="d-flex flex-column align-center justify-center text-center">
                        <img src="@/assets/report.svg" :width="400" class="mb-3" cover />
                        <h2>No Results</h2>
                        <p class="text-body-1">Begin a new prediction above</p>
                    </div>
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { API } from "@/common/api";
import { ref, onMounted, computed } from 'vue';
import SmilesImage from "@/components/SmilesImage.vue";
import BreadCrumbs from "@/components/BreadCrumbs"
import DrawButton from "@/components/DrawButton"
import { useConfirm } from 'vuetify-use-dialog';
import * as Papa from "papaparse";
import { saveAs } from "file-saver";

const selectedComplexityMetrics = ref(['balan', 'bertz']);

const complexityMetricsName = {
    balan: 'Balaban J Score',
    bertz: 'Bertz Complexity (CT) Score',
    boettcher: 'Boettcher Score',
    hallkieralpha: "Kier's alpha-modified shape indices",
    ipc: 'IPC: Bonchev & Trinajstic',
    proudfoot: "Proudfoot's Cm index",
    sascore: 'Ertl SA_Score',
    scscore: 'Coley SCScore',
    spatial: 'Spatial Score',
    twc: "Rücker's total walk count (twc) index",
};

const complexityMetrics = Object.entries(complexityMetricsName).map(([value, title]) => ({ title, value }));

const loading = ref(false);
const batch = ref(false);
const results = ref([]);
const pendingTasks = ref(0);

const createConfirm = useConfirm();

const colorRowItem = computed(() => {
    return (item) => {
        return {
            class: {
                'highlight-row': item.item.new === results.value.length
            }
        };
    };
});

const clear = () => {
    results.value = []
};

const predict = () => {
    pendingTasks.value += 1
    loading.value = true
    batch.value = false
    const url = '/api/molecular-complexity/call-async'
    const body = {
        "smiles": smiles.value,
        "complexity_metrics": selectedComplexityMetrics.value
    }
    API.runCeleryTask(url, body)
        .then(output => {
            if (output.result && !Array.isArray(output.result)) {
                results.value.unshift(output.result)
            } else if (Array.isArray(output.result)) {
                results.value.unshift(...output.result)
            }
            if (results.value.length > 0) {
                results.value[0].new = results.value.length
            }
        })
        .catch(async error => {
            const errorObj = JSON.parse(error.message)
            const isConfirmed = await createConfirm({ title: "Alert", contentComponent: ErrorDialog, contentComponentProps: { errorObj: errorObj }, dialogProps: { width: "auto" } })
            if (!isConfirmed)
                return
        })
        .finally(() => {
            loading.value = false;
            pendingTasks.value -= 1;
        })
}

const downloadCSV = () => {
    if (!results.value.length) {
        alert('There are no results to download!')
        return
    }

    const allKeys = new Set();
    results.value.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys).map(key => ({
        title: key
    }));

    const downloadData = Papa.unparse({
        fields: headers.map(header => header.title),
        data: results.value.map(item => headers.map(header => item[header.title] !== undefined ? item[header.title] : ''))
    });

    let blob = new Blob([downloadData], { type: 'data:text/csv;charset=utf-8' })
    saveAs(blob, "molcom.csv")
};
const downloadJSON = () => {
    if (!results.value.length) {
        alert('There are no results to download!')
        return
    }
    let downloadData = JSON.stringify(results.value)
    let blob = new Blob([downloadData], { type: 'data:text/json;charset=utf-8' })
    saveAs(blob, 'molcom.json')
};

const smiles = ref('');

const resultsHeaders = computed(() => {
    let s = new Set();

    results.value.forEach(item => {
        for (let key in item) {
            s.add(key)
        }
    });

    s.delete("new")

    let res = Array.from(s).map(a => {
        return {
            value: a,
            title: complexityMetricsName[a] || a.toUpperCase(),
            sortable: true
        }
    });

    return res
})

onMounted(() => {

});
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