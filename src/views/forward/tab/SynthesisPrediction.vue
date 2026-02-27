<template>
    <v-container fluid class="pa-0">
        <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6" data-cy="synthesis-prediction-table">
            <v-row align="center" justify="space-between" class="mx-auto my-auto" v-show="!!results.length">
                <v-spacer></v-spacer>
                <v-col cols="auto">
                    <v-btn variant="flat" @click="dialog = true" height="30px" color="primary mx-2" data-cy="synthesis-prediction-export">
                        Export
                    </v-btn>
                </v-col>
            </v-row>

            <v-data-table v-if="!pending && results.length" :headers="headers" :items="results"
                v-show="results.length > 0" :items-per-page="10">
                <template #item.outcome="{ item }">
                    <copy-tooltip :data="item.outcome" :title="'Click to copy: ' + item.outcome">
                        <smiles-image :smiles="item.outcome" height="80px"></smiles-image>
                    </copy-tooltip>
                </template>
                <template #item.prob="{ item }">
                    {{ item.prob.toFixed(4) }}
                </template>
                <template #item.score="{ item }">
                    {{ item.score.toFixed(3) }}
                </template>
                <template #item.mol_wt="{ item }">
                    {{ item.mol_wt.toFixed(1) }}
                </template>
                <template #item.predict_impurities="{ item, index }">
                    <v-btn variant="tonal" @click="emitGoToImpurity(item.outcome)" :id="'predict-impurities-' + index"
                        title="Predict products">
                        <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                </template>
                <template #item.predict_selectivity="{ item, index }">
                    <v-btn variant="tonal" @click="goToSelectivity(item.outcome)"
                        :id="'predict-regio-selectivities-' + index" title="Predict products">
                        <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
            <v-skeleton-loader v-if="!!pending" class="mx-auto" min-height="100px" type="table"></v-skeleton-loader>
            <v-row align="center" justify="space-between" class="mx-auto my-3">
                <v-alert border="start" type="info" variant="tonal" density="compact" title="Reference">
                    <p>
                        Predict most likely outcomes of a chemical reaction using either
                        <br />
                        1) a template-free WLN model for predicting likely bond changes
                        <a class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center"
                            href="https://doi.org/10.1039/C8SC04228D">
                            (Chem. Sci., 2019, 10, 370-377 <v-icon size="x-small">mdi-open-in-new</v-icon>)</a>, or
                        <br />
                        2) a template-free augmented Transformer model for end-to-end prediction.
                        <a class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center"
                            href="https://www.nature.com/articles/s41467-020-19266-y">
                            (Nat. Commun., 2020, 11, 5575 <v-icon size="x-small">mdi-open-in-new</v-icon>)</a>, or
                        <br />
                        3) a template-free Graph2SMILES model for end-to-end prediction.
                        <a class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center"
                            href="https://doi.org/10.1021/acs.jcim.2c00321">
                            (J. Chem. Inf. Model., 2022, 62, 15, 3503–3513 <v-icon
                                size="x-small">mdi-open-in-new</v-icon>)</a>
                    </p>
                </v-alert>
            </v-row>

            <v-row v-if="!pending && results.length === 0" cols="12" class="pa-0 mt-4">
                <v-col>
                    <div class="d-flex flex-column align-center justify-center text-center">
                        <img src="@/assets/emptyForwardSyn.svg" :width="400" class="mb-3" cover />
                        <h2>No Results</h2>
                        <p class="text-body-1">Begin a new prediction above</p>
                    </div>
                </v-col>
            </v-row>

            <v-dialog v-model="dialog" max-width="600px" persistent>
                <v-card>
                    <v-card-title class="headline">Export Results</v-card-title>
                    <v-card-text>
                        <v-text-field v-model="filename" @input="updateFilename($event.target.value)"
                            density="comfortable" variant="outlined" placeholder="Filename" hide-details clearable
                            type="string"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="red darken-1" text @click="dialog = false">Cancel</v-btn>
                        <v-btn color="green darken-1" text @click="emitDownloadForward()">Save</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-sheet>
    </v-container>
</template>

<script setup>
import SmilesImage from "@/components/SmilesImage.vue";
import { ref } from 'vue'
import CopyTooltip from "@/components/CopyTooltip";

const dialog = ref(false)
const filename = ref('forward.csv')

const { results, models, pending } = defineProps({
    inheritAttrs: false,
    results: {
        type: Array,
        default: []
    },
    models: {
        type: String,
        default: ''
    },
    pending: {
        type: Number,
        default: 0
    },
})

const headers = ref([
    { key: 'rank', title: 'Rank', align: 'center', },
    { key: 'outcome', title: 'Product', align: 'center' },
    { key: 'prob', title: 'Probability', align: 'center' },
    { key: 'score', title: 'Max. Score', align: 'center' },
    { key: 'mol_wt', title: 'Molecular Weight', align: 'center' },
    { key: 'predict_impurities', title: 'Predict impurities', align: 'center', },
    { key: 'predict_selectivity', title: 'Predict regio-selectivities', align: 'center', }
])

const emits = defineEmits()

const emitDownloadForward = () => {
    emits('download-forward')
    dialog.value = false
}

const emitGoToImpurity = (index) => {
    emits('go-to-impurities', index);
}

const goToSelectivity = (index) => {
    emits('go-to-selectivity', index);
}

const updateFilename = (newFilename) => {
    emits('update:filename', newFilename);
};


</script>
