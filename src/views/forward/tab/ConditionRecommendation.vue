<template>
    <v-container fluid class="pa-0">
        <v-sheet elevation="2" rounded="lg" width="100%" class="pa-6" data-cy="forward-condition-recommendation-table">
            <v-row align="center" justify="space-between" class="ma-auto" v-show="!!results.length">
                <v-col>
                    <p v-if="!!score">Reaction score: {{ score.toFixed(3) }}</p>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="auto">
                    <v-btn variant="flat" @click="handleClick" :disabled="evaluating" height="30px" data-cy="cond-rec-get-reaction-score"
                        color="primary mx-2">
                        Get Reaction Score
                    </v-btn>
                </v-col>
            </v-row>

            <v-data-table class="mx-auto my-auto mt-3" v-if="models === 'neuralnetwork' && !pending && results.length"
                :headers="headers" :items="results" v-show="results.length > 0" :items-per-page="10">
                <template v-slot:item.index="{ index }">
                    {{ index + 1 }}
                </template>
                <template v-slot:item.evaluation="{ item }">
                    <td class="text-center">
                        <v-progress-circular indeterminate
                            v-if="pendingRank > 0 && item.evaluation === undefined"></v-progress-circular>

                        <span v-else-if="item.evaluation">
                            <v-icon>mdi-check</v-icon> (rank: {{ item.evaluation }})
                        </span>

                        <span v-else-if="item.evaluation !== undefined && !item.evaluation">
                            <v-icon>mdi-close</v-icon> (rank: N/A)
                        </span>
                    </td>
                </template>
                <template v-slot:item.solvent_score="{ item }">
                    <v-chip :color="getColor(item.solvent_score)" v-if="item.solvent_score">
                        {{ item.solvent_score }}
                    </v-chip>
                    <div v-else>
                        None
                    </div>
                </template>
                <template #item.reagent="{ item }">
                    <template v-if="item.reagent">
                        <copy-tooltip :data="item.reagent" :title="'Click to copy: ' + item.reagent">
                            <smiles-image :smiles="item.reagent" height="80px"></smiles-image>
                        </copy-tooltip>
                    </template>
                    <div v-else>
                        None
                    </div>
                </template>
                <template #item.solvent="{ item }">
                    <template v-if="item.solvent">
                        <copy-tooltip :data="item.solvent" :title="'Click to copy: ' + item.solvent">
                            <smiles-image :smiles="item.solvent" height="80px"></smiles-image>
                        </copy-tooltip>
                    </template>
                    <div v-else>
                        None
                    </div>
                </template>
                <template #item.temperature="{ item }">
                    {{ Math.round(item.temperature) }} &deg;C
                </template>
                <template #item.catalyst="{ item }">
                    <div class="text-center">
                        <template v-if="!!item.catalyst || !!item.catalyst_name_only">
                            <copy-tooltip :data="item.catalyst" :title="'Click to copy: ' + item.catalyst">
                                <smiles-image v-if="!!item.catalyst" :smiles="item.catalyst"></smiles-image>
                            </copy-tooltip>
                        </template>
                        <template v-else>
                            None
                        </template>
                    </div>
                </template>
                <template #item.predict="{ item, index }">
                    <v-btn variant="tonal" @click="emitGoToForward(index)" :id="'predict-conditions-' + index"
                        title="Predict products">
                        <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                </template>
            </v-data-table>

            <v-data-table class="mx-auto my-auto" v-else-if="models === 'neuralnetworkv2' && !pending && results.length"
                :headers="headersAlt" :items="results" v-show="results.length > 0" :items-per-page="10">
                <template v-slot:item.index="{ index }">
                    {{ index + 1 }}
                </template>
                <template v-slot:item.evaluation="{ item }">
                    <td class="text-center">
                        <v-progress-circular indeterminate
                            v-if="pendingRank > 0 && item.evaluation === undefined"></v-progress-circular>

                        <span v-else-if="item.evaluation">
                            <v-icon>mdi-check</v-icon> (rank: {{ item.evaluation }})
                        </span>

                        <span v-else-if="item.evaluation !== undefined && !item.evaluation">
                            <v-icon>mdi-close</v-icon> (rank: N/A)
                        </span>
                    </td>
                </template>
                <template #item.reactants="{ item }">
                    <div v-for="(amount, rct) in item.reactants" class="text-center my-2" :key="rct">
                        <copy-tooltip :data="rct" :title="'Click to copy: ' + rct">
                            <smiles-image :smiles="rct" max-height="80px"></smiles-image>
                        </copy-tooltip>
                        ({{ Number.isFinite(amount) ? amount.toFixed(2) : 'N/A' }})
                    </div>
                </template>
                <template #item.temperature="{ item }">
                    {{ Math.round(item.temperature) }} &deg;C
                </template>
                <template #item.score="{ item }">
                    <v-chip :color="getColor(item.score)" v-if="item.score !== undefined">
                        {{ item.score.toFixed ? item.score.toFixed(3) : item.score }}
                    </v-chip>
                    <div v-else>
                        None
                    </div>
                </template>
                <template v-slot:item.reagents="{ item }">
                    <div v-if="!!item.reagents">
                        <div class="text-center my-2" v-for="(amount, rgt) in item.reagents" :key="rgt">
                            <copy-tooltip :data="rgt" :title="'Click to copy: ' + rgt">
                                <smiles-image :smiles="rgt" max-height="80px"></smiles-image>
                            </copy-tooltip>
                            ({{ Number.isFinite(amount) ? ((amount > 0.01) ? amount.toFixed(2) : amount.toExponential(2)) : 'N/A' }})
                        </div>
                    </div>
                    <span v-else class="text-center">None</span>
                </template>
                <template #item.predict="{ item, index }">
                    <v-btn variant="tonal" @click="emitGoToForward(index)" :id="'predict-conditions-' + index"
                        title="Predict products">
                        <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                </template>
            </v-data-table>


            <v-skeleton-loader v-else-if="!!pending" class="mx-auto my-auto" min-height="80px" type="table">
            </v-skeleton-loader>

            <v-row align="center" justify="space-between" class="mx-auto my-3">
                <v-col cols="12" class="pa-0">
                    <v-alert border="start" type="info" variant="tonal" density="compact" title="Reference">
                        <p>
                            Predict reagents, catalysts, solvents and temperature for a desired transformation
                            using a
                            neural
                            network model.
                            <a class="text-decoration-none text-primary font-weight-medium d-inline-flex align-center"
                                href="https://doi.org/10.1021/acscentsci.8b00357" target="_blank">(ACS Cent. Sci., 2018,
                                4,
                                1465-1476
                                <v-icon size="x-small">mdi-open-in-new</v-icon>
                                )
                            </a>
                        </p>
                    </v-alert>
                </v-col>
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
        </v-sheet>
    </v-container>
</template>


<script setup>
import SmilesImage from "@/components/SmilesImage.vue";
import { ref } from 'vue'
import CopyTooltip from "@/components/CopyTooltip";

const { results, models, pending } = defineProps({
    inheritAttrs: false,
    results: {
        type: Array,
        default: [],
    },
    models: {
        type: String,
        default: ""
    },
    pending: {
        type: Number,
        default: 0
    },
    pendingRank: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    evaluating: {
        type: Boolean,
        default: false
    }
})

const headers = ref([
    { key: 'index', title: '#', align: 'center', },
    // { key: 'evaluation', title: 'Rank', align: 'center', },
    { key: 'solvent', title: 'Solvent', align: 'center' },
    { key: 'reagent', title: 'Reagents', align: 'center' },
    { key: 'catalyst', title: 'Catalyst', align: 'center', },
    { key: 'temperature', title: 'Temperature', align: 'center', },
    { key: 'solvent_score', title: 'Solvent Score', align: 'center', },
    { key: 'predict', title: 'Predict with conditions', align: 'center' }
])


const headersAlt = ref([
    { key: 'index', title: '#', align: 'center', },
    // { key: 'evaluation', title: 'Rank', align: 'center', },
    { key: 'reactants', title: 'Reactants (Amount)', align: 'center' },
    { key: 'reagents', title: 'Reagents (Amount)', align: 'center', },
    { key: 'temperature', title: 'Temperature', align: 'center', },
    { key: 'score', title: 'Score', align: 'center' },
    { key: 'predict', title: 'Predict with conditions', align: 'center' }
])


const getColor = (score) => {
    if (score === 1) return 'green'
    else return 'orange'
}

const emits = defineEmits()

const emitGoToForward = (index) => {
    emits('go-to-forward', index);
}

const handleClick = () => {
    emits('evaluate');
}

</script>
