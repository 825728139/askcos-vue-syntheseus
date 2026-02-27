<template>
    <div>
    <v-container fluid>
        <v-row class="justify-center">
            <v-col cols="12" lg="4" md="12" style="height: calc(100vh - 11rem); overflow-y: auto;" 
                data-cy="tree-view-left-panel">
                <v-sheet elevation="2" class="pa-5 d-flex align-center flex-column" rounded="lg" :border="true">
                    <v-alert type="info" dense class="mb-2" variant="tonal" title="Result details"
                        v-if="trees.length !== 0">
                        <p class="text-body-1" v-if="resultsStore.savedResultInfo.type === 'tree_builder'">
                            Discovered {{ allTrees.length }} trees after exploring
                            {{ resultsStore.savedResultInfo.tbStats.total_chemicals }} total chemicals and
                            {{ resultsStore.savedResultInfo.tbStats.total_reactions }} total reactions.
                        </p>
                        <p v-else>
                            Click on "Show More" below to get more information
                        </p>
                        <v-btn variant="flat" color="primary" @click="resultInfo = true"
                            data-cy="tree-view-show-more">Show More</v-btn>
                    </v-alert>
                    <div v-if="resultsStore.savedResultInfo.type === 'tree_builder'" class="mt-4 align-self-start"
                        style="width:100%">
                        <h6 class="text-h6">Add results to IPP network</h6>
                        <p>
                            Add by tree
                            <i class="fas fa-question-circle ml-1"
                                title="Add the requested number of trees to the IPP network visualization based on the current cluster, sorting, and filtering options."></i>
                        </p>
                        <v-text-field label="First N Trees" variant="outlined" hide-details v-model="numTreesInput"
                            id="tree-view-first-N-trees" data-cy="tree-view-first-N-trees" density="compact" class="mt-2">
                            <template v-slot:append>
                                <v-btn @click="addTreesToIpp()" :disabled="trees.length === 0" variant="tonal"
                                    data-cy="tree-view-add-by-trees-to-ipp" color="primary">Add</v-btn>
                            </template>
                        </v-text-field>
                        <p class="mt-3">
                            Add by depth
                            <i class="fas fa-question-circle ml-1"
                                title="Add results from the full reaction network to the IPP network visualization. Depth is the number of reaction steps to descend. Top-N is the number of precursor suggestions to add for each intermediate."></i>
                        </p>
                        <v-row class="justify-center align-center">
                            <v-col cols="12" md="4" class="d-flex align-center justify-center">
                                <v-text-field label="Depth" variant="outlined" hide-details v-model="maxDepthInput"
                                    id="tree-view-depth" density="compact" class="mt-2">
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" md="4" class="d-flex align-center justify-center">
                                <v-text-field label="Top-N" variant="outlined" hide-details v-model="maxNumInput"
                                    id="tree-view-top-N" density="compact" class="mt-2">
                                </v-text-field>
                            </v-col>
                            <v-col cols="12" md="4" class="d-flex align-center justify-center">
                                <v-btn @click="addResultsToIpp()" :disabled="trees.length === 0" variant="tonal"
                                    data-cy="tree-view-add-by-depth-to-ipp" color="primary">Add</v-btn>
                            </v-col>
                        </v-row>
                    </div>
                    <div v-if="resultsStore.savedResultInfo.type === 'tree_builder'" class="mt-4 align-self-start"
                        style="width:100%">
                        <h6 class="text-h6">Analyze trees</h6>
                        <div class="my-2">
                            <p>Current Tasks:
                                <span v-if="currentTasks.length === 0">No active tasks</span>
                                <span v-else>
                                    <v-chip v-for="(task, index) in currentTasks" :key="index" class="ma-2" color="blue"
                                        dark>
                                        {{ task }}
                                    </v-chip>
                                </span>
                            </p>
                        </div>
                        <v-btn width="100%" @click="runPathwayRanking()" class="my-1" :disabled="trees.length === 0"
                            data-cy="tree-view-score-and-cluster" variant="flat" color="green">SCORE AND CLUSTER PATHWAY</v-btn>
                        <v-btn width="100%" @click="runReactionClassification()" class="my-1"
                            :disabled="trees.length === 0" variant="flat" color="green" 
                            data-cy="tree-view-run-reaction-classification">Run reaction
                            classification</v-btn>
                        <v-menu location="bottom" :close-on-content-click="false">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" append-icon="mdi mdi-menu-down" class="mt-1" width="100%"
                                    data-cy="tree-view-run-pmi-calculation" :disabled="trees.length === 0" 
                                    variant="flat" color="green">Run PMI
                                    calculation</v-btn>
                            </template>
                            <v-list density="compact">
                                <v-list-item @click="runPmiCalculation(true)">For this tree only</v-list-item>
                                <v-list-item @click="runPmiCalculation()">For all trees</v-list-item>
                            </v-list>
                        </v-menu>
                        <v-menu location="bottom" :close-on-content-click="false">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" append-icon="mdi mdi-menu-down" class="mt-1" width="100%"
                                    data-cy="tree-view-count-analogs" :disabled="trees.length === 0" variant="flat" 
                                    color="green">Count analogs</v-btn>
                            </template>
                            <v-list density="compact">
                                <v-list-item @click="runAnalogCounting(true)">For this tree only</v-list-item>
                                <v-list-item @click="runAnalogCounting()">For all trees</v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                    <div v-if="resultsStore.savedResultInfo.type === 'tree_builder'" class="mt-2 align-self-start"
                        style="width:100%">
                        <h6 class="text-h6">Cluster Trees</h6>
                        <v-switch id="clusterSwitch" v-model="cluster" :disabled="clusterDisabled" hide-details
                            label="View by cluster">
                        </v-switch>
                    </div>
                    <div class="align-self-start" style="width:100%">
                        <h6 class="text-h6">Sort trees</h6>
                        <div v-for="(sortInput, index) in treeSortInput" :key="index" class="d-flex flex-gap-2 mb-2">
                            <v-input hide-details :disabled="trees.length === 0" :data-cy="`sort-trees-options-${index + 1}`">
                                <template v-slot:prepend>
                                    {{ index + 1 }}
                                </template>
                                <v-select id="sortingCategory" v-model="sortInput.key" :items="treeSortOptions"
                                    hide-details variant="outlined"
                                    @update:modelValue="setDefaultSortOrder(sortInput)"></v-select>
                                <template v-slot:append>
                                    <v-btn
                                        :icon="sortInput.ascending ? 'mdi-sort-numeric-ascending' : 'mdi-sort-numeric-descending'"
                                        rounded variant="tonal" density="comfortable" data-cy="order-btn"
                                        @click="sortInput.ascending = !sortInput.ascending"></v-btn>
                                    <v-btn icon="mdi-close" size="small" density="compact"
                                        @click="deleteSortField(index)" variant="tonal" color="red" data-cy="order-rmv-btn"
                                        class="ml-2"></v-btn>
                                </template>
                            </v-input>
                        </div>
                        <v-btn @click="addSortField" :disabled="trees.length === 0" variant="outlined" color="primary" data-cy="tree-build-add-sort-field"
                            width="100%">Add sort
                            field</v-btn>
                    </div>
                    <div class="mt-2" style="width:100%">
                        <h6 class="text-h6">Filter trees</h6>
                        <p>
                            Show pathways which
                            <v-btn id="filterInvertCheck" @click="filterInvert = !filterInvert" size="small"
                                variant="flat" color="primary" data-cy="pathways-do-dont">
                                {{ filterInvert ? "do not" : "do" }}
                            </v-btn>
                            include
                            <v-btn id="filterAnyCheck" @click="filterAny = !filterAny" size="small" variant="flat"
                                color="primary" data-cy="pathways-any-all">
                                {{ filterAny ? "any" : "all" }}
                            </v-btn>
                            of the selected components.
                        </p>
                        <a href="#" role="button" v-on:click.stop="() => { this.startDialog = true }">
                            <p data-cy="select-sm-by-image"> Select starting materials by image</p>
                        </a>

                        <v-dialog v-model="startDialog" persistent max-width="1200px" max-height="700px" scrollable>
                            <v-card>
                                <v-card-title class="headline">Filter by starting materials</v-card-title>
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="2" v-for="material in startingMaterialOptions" :key="material">
                                            <v-card class="pa-3" data-cy="sm-img-card">
                                                <v-checkbox v-model="selectedStartingMaterials" :value="material"
                                                    class="my-0 py-0" hide-details></v-checkbox>
                                                <smiles-image class="my-3" :smiles="material"></smiles-image>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" variant="tonal" @click="startDialog = false" data-cy="Ok">OK</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <v-select label="Starting materials" :items="startingMaterialOptions" data-cy="filter-sm"
                            v-model="selectedStartingMaterials" multiple variant="outlined" density="compact"
                            class="mt-1"></v-select>

                        <a href="#" role="button" v-on:click.stop="() => { this.intermediateDialog = true }">
                            <p data-cy="select-intr-by-image">Select intermediates by image</p>
                        </a>
                        <v-dialog v-model="intermediateDialog" persistent max-width="1200px" max-height="700px"
                            scrollable>
                            <v-card>
                                <v-card-title class="headline">Filter by intermediates</v-card-title>
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="2" v-for="intermediate in intermediateOptions" :key="intermediate">
                                            <v-card class="pa-3">
                                                <v-checkbox v-model="selectedIntermediates" :value="intermediate" data-cy="intermediate-img-card"
                                                    class="my-0 py-0" hide-details></v-checkbox>
                                                <smiles-image class="my-3" :smiles="intermediate"></smiles-image>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" variant="tonal"
                                        @click="intermediateDialog = false">OK</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                        <v-select label="Intermediates" :items="intermediateOptions" v-model="selectedIntermediates" data-cy="filter-intermediates"
                            multiple variant="outlined" density="compact" class="mt-1"></v-select>

                        <v-select v-if="reactionClassOptions.length" label="Reaction classes"
                            :items="reactionClassOptions" v-model="selectedReactionClasses" multiple variant="outlined"
                            density="compact" class="mt-1"></v-select>
                    </div>
                </v-sheet>
            </v-col>
            <v-col cols="12" lg="8" style="overflow-y: hide" v-show="trees.length !== 0" class="py-0"
                data-cy="tree-view-right-panel">
                <div class="my-2 d-flex justify-space-around align-center">
                    <v-btn-group variant="outlined" density="comfortable" divided :border="true">
                        <v-btn icon="mdi mdi-chevron-double-left" @click="changeClusterId('first')"
                            data-cy="tree-view-cluster-double-left" :disabled="!cluster"></v-btn>
                        <v-btn icon="mdi mdi-chevron-left" @click="changeClusterId('prev')"
                            data-cy="tree-view-cluster-left" :disabled="!cluster"></v-btn>
                        <v-btn variant="tonal">{{ !cluster ? "Cluster N/A" : currentClusterId === -1 ? "Unclustered" :
                    `Cluster
                            ${currentClusterId + 1} of ${maxClusterId + 1}` }}</v-btn>
                        <v-btn icon="mdi mdi-chevron-right" @click="changeClusterId('next')"
                            data-cy="tree-view-cluster-right" :disabled="!cluster"></v-btn>
                        <v-btn icon="mdi mdi-chevron-double-right" @click="changeClusterId('last')"
                            data-cy="tree-view-cluster-double-right" :disabled="!cluster"></v-btn>
                    </v-btn-group>
                    <v-btn-group variant="outlined" density="comfortable" divided :border="true">
                        <v-btn icon="mdi mdi-chevron-double-left" @click="changeTreeId('first')"
                            data-cy="tree-view-double-left"></v-btn>
                        <v-btn icon="mdi mdi-chevron-left" @click="changeTreeId('prev')"
                            data-cy="tree-view-left"></v-btn>
                        <v-btn variant="tonal">Tree {{ currentTreeId +
                    1 }} of {{ trees.length }}</v-btn>
                        <v-btn icon="mdi mdi-chevron-right" @click="changeTreeId('next')"
                            data-cy="tree-view-right"></v-btn>
                        <v-btn icon="mdi mdi-chevron-double-right" @click="changeTreeId('last')"
                            data-cy="tree-view-double-right"></v-btn>
                    </v-btn-group>
                    <v-btn-group density="compact" divided>
                        <v-btn variant="tonal" @click="addTreeToIpp(currentTree)" data-cy="add-to-ipp"> Add to IPP </v-btn>
                        <v-menu location="bottom" id="tb-submit-settings" :close-on-content-click="true">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" icon="mdi mdi-menu-down" variant="tonal" data-cy="down-btn"/>
                            </template>
                            <v-btn color="blue-grey" @click="showListView = true" data-cy="open-list-view">Open List View</v-btn>
                        </v-menu>
                    </v-btn-group>
                </div>
                <v-sheet class="position-relative elevation-2" rounded="lg">
                    <div id="graph" ref="graph"></div>
                    <div v-if="currentTreeData" id="tree-data-overlay">
                        <table>
                            <tr data-cy="tree-view-table-results" v-for="(value, key) in currentTreeData" :key="key">
                                <th class="px-1">{{ key }}</th>
                                <td class="px-1">{{ Number.isInteger(value) ? value : num2str(value) }}</td>
                            </tr>
                        </table>
                    </div>
                    <network-legend></network-legend>
                    <div class="result-btn d-flex justify-content-center align-items-center flex-gap-2">
                        <v-menu location="top">
                            <template v-slot:activator="{ props }">
                                <v-btn color="primary" size="small" v-bind="props" prepend-icon="mdi mdi-download"
                                    data-cy="tree-explorer-save-results">
                                    Download Results
                                </v-btn>
                            </template>
                            <v-list data-cy="ipp-save-location">
                                <v-list-item @click="downloadData(true)">This tree</v-list-item>
                                <v-list-item @click="downloadData(false)">All trees</v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </v-sheet>
            </v-col>
            <v-col cols="12" md="8" style="overflow-y: hide" v-if="trees.length === 0"
                class="d-flex justify-center align-center">
                <div class="text-center">
                    <v-img :width="400" cover :src="emptyTrees" class="mb-3"></v-img>
                    <h2 class="text-h6">No trees found</h2>
                    <p class="text-body-1">Try a different strategy setting or change filter settings</p>
                </div>
            </v-col>
        </v-row>
    </v-container>
    <js-panel :visible="tabActive && !!selected" :options="detailPanelOptions" @close="clearSelection"
        data-cy="tree-view-node-details">
        <div v-if="selected" class="ma-3">
            <div v-if="selected.type === 'chemical'">
                <div class="text-center">
                    <copy-tooltip :data="selected.smiles">
                        <b>Smiles: </b><span class="smiles">{{ selected.smiles }}</span>
                    </copy-tooltip>
                    <div><b>Price ($/g): </b>{{ selected.data.ppg > 0 ? selected.data.ppg : "not buyable" }}</div>
                    <div v-if="selected.data.source"><b>Source: </b>{{ selected.data.source }}</div>
                    <smiles-image class="my-3" :smiles="selected.smiles"></smiles-image>
                </div>
                <div class="text-center my-3">
                    <v-btn variant="tonal" :href="'/network?tab=IPP&target=' + encodeURIComponent(selected.smiles)" data-cy="synthesize-this-in-ipp"
                        target="_blank">Synthesize
                        this with the Interactive Path Planner</v-btn>
                </div>
                <v-table density="compact">
                    <tbody>
                        <tr>
                            <th>As reactant</th>
                            <td>{{ selected.data["asReactant"] }}</td>
                        </tr>
                        <tr>
                            <th>As product</th>
                            <td>{{ selected.data["asProduct"] }}</td>
                        </tr>
                        <tr v-if="selected.data['scscore']">
                            <th>Synthetic complexity</th>
                            <td>{{ num2str(selected.data["scscore"]) }}</td>
                        </tr>
                        <tr v-if="selected.data['molwt']">
                            <th>Molecular weight</th>
                            <td>{{ selected.data["molwt"].toFixed(2) }}</td>
                        </tr>
                    </tbody>
                </v-table>
            </div>
            <div v-if="selected.type === 'reaction'">
                <div class="text-center">
                    <copy-tooltip :data="selected.smiles">
                        <b>Smiles: </b><span class="smiles">{{ selected.smiles }}</span>
                    </copy-tooltip>
                    <smiles-image class="my-3" :smiles="selected.smiles"
                        :align="settingsStore.ippSettings.alignPrecursorsToProduct"></smiles-image>
                </div>
                <div class="text-center my-3">
                    <v-btn variant="tonal"
                        :href="'/forward?tab=context&rxnsmiles=' + encodeURIComponent(selected.smiles)"
                        data-cy="tree-view-evaluate-reaction" target="_blank">Evaluate reaction</v-btn>
                </div>
                <v-table density="compact">
                    <tbody data-cy="tree-view-reaction-properties">
                        <tr>
                            <th>Plausibility</th>
                            <td id="plausibility">{{ num2str(selected.data["ffScore"]) }}</td>
                        </tr>
                        <tr v-if="selected.data['forwardScore']">
                            <th>Forward predictor score</th>
                            <td id="forward-score">{{ num2str(selected.data["forwardScore"]) }}</td>
                        </tr>
                        <tr v-if="selected.data.modelMetadata && selected.data.modelMetadata[0].source.template">
                            <th>Template score</th>
                            <td>{{ num2str(selected.data.modelMetadata[0].source.template.template_score) }}</td>
                        </tr>
                        <tr v-if="selected.data.modelMetadata && selected.data.modelMetadata[0].source.template">
                            <th>Template examples</th>
                            <td>{{ selected.data.modelMetadata[0].source.template.num_examples }}</td>
                        </tr>
                        <tr v-if="selected.data.modelMetadata && selected.data.modelMetadata[0].source.template">
                            <th>Necessary reagent</th>
                            <td>{{ selected.data.modelMetadata[0].source.template.necessary_reagent || 'None' }}</td>
                        </tr>
                        <tr v-if="selected.data['className']">
                            <th>Reaction class</th>
                            <td id="reaction-class">{{ selected.data["className"] }} ({{ selected.data["classNum"] }})</td>
                        </tr>
                        <tr>
                            <th>Supporting templates</th>
                            <td>
                                <ul v-if="selected.data.modelMetadata && selected.data.modelMetadata.length > 0">
                                    <li v-for="(metadata, index) in selected.data.modelMetadata" :key="index">
                                        <div v-if="metadata.source && metadata.source.template">
                                            <a :href="'/template?id=' + metadata.source.template._id" target="_blank">
                                                {{ metadata.source.template._id }}
                                                <span v-if="metadata.source.template.template_set">({{ metadata.source.template.template_set }})</span>
                                            </a>
                                        </div>
                                    </li>
                                </ul>
                                <div v-else class="text-muted">No template data available</div>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </div>
            <div class="btn-toolbar justify-content-end">
                <ban-button :smiles="selected.smiles" :type="selected.type"></ban-button>
            </div>
        </div>
    </js-panel>

    <js-panel :visible="tabActive && showListView === true" :options="listPanelOptions" @close="showListView = false">
        <div class="m-3">
            <v-pagination v-model="treeListCurrentPage" :length="Math.ceil(trees.length / treeListItemsPerPage)"
                class="mb-3"></v-pagination>
            <v-card v-for="(tree, index) in treeListItems" :key="index" class="mb-3 pa-10 ma-10" :model-value="panel"
                multiple>
                <v-card-title>
                    <span class="text-body-1 ml-2"><b>Tree {{ (treeListCurrentPage - 1) * treeListItemsPerPage + index +
                    1 }} </b></span>
                </v-card-title>
                <v-card-text>
                    <div>
                        <div :id="`treeList-${index}`" class="list-view-tree"></div>
                        <div class="d-flex justify-space-between">
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn-group class="float-right" divided :border="true">
                        <v-btn variant="flat" color="primary" :data-cy='"add-to-ipp-list-"+(index)'
                            @click="addTreeToIpp(trees[(treeListCurrentPage - 1) * treeListItemsPerPage + index])">
                            Add to IPP </v-btn>
                        <v-btn variant="outlined" :data-cy='"view-in-main-window-"+(index)'
                            @click="showListView = false; currentTreeId = (treeListCurrentPage - 1) * treeListItemsPerPage + index;">
                            View in main window
                        </v-btn>
                    </v-btn-group>
                </v-card-actions>
            </v-card>
        </div>
    </js-panel>
    <result-info-modal v-if="trees.length !== 0" :visible="resultInfo"
        @close="$event => resultInfo = $event"></result-info-modal>
    </div>
</template>

<script>
import BanButton from "@/components/BanButton";
import CopyTooltip from "@/components/CopyTooltip";
import JsPanel from "@/components/JsPanel";
import SmilesImage from "@/components/SmilesImage";
import NetworkLegend from "@/components/network/NetworkLegend";
import ResultInfoModal from "@/components/network/ResultInfoModal";
import { API } from "@/common/api";
import { getMolImageUrl } from "@/common/drawing";
import { RetroGraph } from "@/common/graph";
import { num2str } from "@/common/utils";
import { visjsOptionsTreeDefault, visjsOptionsTreeCondensed } from "@/store/init/settings";
import { makeChemicalDisplayNode, makeReactionDisplayNode, makeDisplayEdge } from "@/views/network/visualization";
import { Network } from "vis-network";
import { mapStores } from "pinia";
import { useConfirm, useSnackbar } from 'vuetify-use-dialog';
import { useResultsStore } from "@/store/results";
import { useSettingsStore } from "@/store/settings";
import emptyTrees from '@/assets/emptyTrees.svg'
import { saveAs } from "file-saver";
import { computed } from "vue";
import { useTheme } from "@/composables/useTheme";


function initializeNetwork(data, container, showDetail = true) {
    const options = showDetail ? visjsOptionsTreeDefault : visjsOptionsTreeCondensed;
    return new Network(container, data, options);
}

export default {
    name: "TreeView",
    components: {
        BanButton,
        ResultInfoModal,
        CopyTooltip,
        JsPanel,
        SmilesImage,
        NetworkLegend,
    },
    emits: ['switch-tab'],
    props: {
        tabActive: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const createConfirm = useConfirm()
        const createSnackbar = useSnackbar()
        const { isDark } = useTheme();
        const backgroundColor = computed(() => {
            return isDark.value ? 'rgba(48, 48, 48, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        });
        return {
            createConfirm,
            createSnackbar,
            backgroundColor
        }
    },
    data() {
        return {
            startDialog: false,
            intermediateDialog: false,
            panel: [0],
            disabled: false,
            showListView: false,
            selected: null,
            currentTreeId: 0,
            network: null,
            networkData: {},
            cluster: false,
            currentClusterId: 0,
            treeSortInput: [
                { key: "num_reactions", ascending: true },
                { key: "depth", ascending: true },
            ],
            treeListCurrentPage: 1,
            treeListItemsPerPage: 20,
            filterAny: false,
            filterInvert: false,
            reactionClassesByTree: {},
            reactionClassNames: {},
            reactionClassOptions: [],
            selectedReactionClasses: [],
            intermediatesByTree: {},
            intermediateOptions: [],
            selectedIntermediates: [],
            startingMaterialsByTree: {},
            startingMaterialOptions: [],
            selectedStartingMaterials: [],
            analysisTaskRunning: false,
            numTreesInput: 10,
            maxDepthInput: 2,
            maxNumInput: 5,
            infoPanelOptions: {
                id: "infoPanel",
                headerTitle: "Info",
                headerControls: { size: "sm" },
                position: { my: "left-top", at: "left-top", of: "#graph" },
                panelSize: { width: 500, height: 500 },
            },
            detailPanelOptions: {
                id: "detailPanel",
                headerTitle: "Node Details",
                headerControls: { size: "sm" },
                position: { my: "right-top", at: "right-top", of: "#graph" },
                panelSize: { width: 500, height: 600 },
            },
            listPanelOptions: {
                id: "listPanel",
                headerTitle: "List View",
                headerControls: { size: "sm" },
                panelSize: { width: () => (window.innerWidth * 10) / 12, height: "calc(100vh - 22rem)" },
                callback: this.buildTreeList,
            },
            emptyTrees: emptyTrees,
            resultInfo: false,
            currentTasks: [],
        };
    },
    created() {
        this.panelStates = Array(this.treeListItems.length).fill(true)
    },
    computed: {
        trees() {
            return this.allTrees
                .filter((tree, index) => {
                    let logic = this.filterAny ? "some" : "every";
                    let result = true;
                    if (this.cluster) {
                        result &&= tree["graph"]["cluster_id"] === this.currentClusterId;
                    }
                    let filterResults = [];
                    if (this.selectedReactionClasses.length) {
                        filterResults.push(this.selectedReactionClasses[logic]((item) => this.reactionClassesByTree[index].has(item)));
                    }
                    if (this.selectedIntermediates.length) {
                        filterResults.push(this.selectedIntermediates[logic]((item) => this.intermediatesByTree[index].has(item)));
                    }
                    if (this.selectedStartingMaterials.length) {
                        filterResults.push(this.selectedStartingMaterials[logic]((item) => this.startingMaterialsByTree[index].has(item)));
                    }
                    if (filterResults.length) {
                        let filterResult = filterResults[logic]((item) => item);
                        if (this.filterInvert) {
                            filterResult = !filterResult;
                        }
                        result &&= filterResult;
                    }
                    return result;
                })
                .sort((aObj, bObj) => {
                    for (let { key, ascending } of this.treeSortInput) {
                        const a = aObj["graph"][key];
                        const b = bObj["graph"][key];
                        const c = ascending ? 1 : -1;
                        // Sort null values to end regardless of ascending or descending
                        const res = (a === null) - (b === null) || (a - b) * c;
                        if (res) {
                            // Return if comparison is not equal (i.e. 0)
                            return res;
                        }
                    }
                    // All comparisons were equal (i.e. 0)
                    return 0;
                });
        },
        currentTree() {
            // The current tree that is rendered in the main view
            return this.trees[this.currentTreeId];
        },
        currentTreeData() {
            if (this.currentTree) {
                const props = this.currentTree["graph"];
                const data = {
                    Depth: props["depth"],
                    "# Reactions": props["num_reactions"],
                    "Avg. Plausibility": props["avg_plausibility"],
                    "Min. Plausibility": props["min_plausibility"],
                    "Avg. Template Score": props["avg_score"],
                    "Min. Template Score": props["min_score"],
                    "Num. Analogs": props["num_analogs"],
                };
                if (props["precursor_cost"] !== undefined) {
                    data["Total Precursor Cost"] = props["precursor_cost"];
                }
                if (props["atom_economy"] !== undefined) {
                    data["Overall Atom Economy"] = props["atom_economy"];
                }
                if (props["pmi"] !== undefined) {
                    data["Avg. PMI"] = props["pmi"];
                }

                return data;
            } else {
                return null;
            }
        },
        maxClusterId() {
            if (!!this.allTrees.length && "cluster_id" in this.allTrees[0]["graph"]) {
                return Math.max(...this.allTrees.map((tree) => tree["graph"]["cluster_id"]));
            } else {
                return 0;
            }
        },
        minClusterId() {
            if (!!this.allTrees.length && "cluster_id" in this.allTrees[0]["graph"]) {
                return Math.min(...this.allTrees.map((tree) => tree["graph"]["cluster_id"]));
            } else {
                return 0;
            }
        },
        treeListItems() {
            if (this.trees.length > 0) {
                const start = (this.treeListCurrentPage - 1) * this.treeListItemsPerPage;
                const end = start + this.treeListItemsPerPage;
                return this.trees.slice(start, end);
            } else {
                return [];
            }
        },
        treeListMaxPage() {
            if (this.trees.length > 0) {
                return Math.ceil(this.trees.length / this.treeListItemsPerPage);
            } else {
                return 1;
            }
        },
        atomEconomyDisabled() {
            return !!this.allTrees.length && (this.allTrees[0]["graph"]["atom_economy"] === undefined || this.allTrees[0]["graph"]["atom_economy"] === null);
        },
        scoreDisabled() {
            return !!this.allTrees.length && (this.allTrees[0]["graph"]["score"] === undefined || this.allTrees[0]["graph"]["score"] === null);
        },
        depthDisabled() {
            return !!this.allTrees.length && (this.allTrees[0]["graph"]["depth"] === undefined || this.allTrees[0]["graph"]["depth"] === null);
        },
        clusterDisabled() {
            return !!this.allTrees.length && (this.allTrees[0]["graph"]["cluster_id"] === undefined || this.allTrees[0]["graph"]["cluster_id"] === null);
        },
        analogCountDisabled() {
            return !!this.allTrees.length && this.allTrees.some((tree) => tree["graph"]["num_analogs"] === undefined || tree["graph"]["num_analogs"] === null);
        },
        pmiDisabled() {
            return !!this.allTrees.length && this.allTrees.some((tree) => tree["graph"]["pmi"] === undefined || tree["graph"]["pmi"] === null);
        },
        treeSortOptions() {
            const options = [
                { value: "num_reactions", title: "Total number of reactions" },
                { value: "first_step_score", title: "First step score" },
                { value: "first_step_plausibility", title: "First step plausibility" },
                { value: "avg_score", title: "Average score" },
                { value: "min_score", title: "Minimum score" },
                { value: "avg_plausibility", title: "Average plausibility" },
                { value: "min_plausibility", title: "Minimum plausibility" },
                { value: "precursor_cost", title: "Total precursor cost" },
            ];
            if (!this.depthDisabled) {
                options.push({ value: "depth", title: "Length of longest linear path" });
            }
            if (!this.analogCountDisabled) {
                options.push({ value: "num_analogs", title: "Number of possible analogs" });
            }
            if (!this.atomEconomyDisabled) {
                options.push({ value: "atom_economy", title: "Overall atom economy" });
            }
            if (!this.scoreDisabled) {
                options.push({ value: "score", title: "Strategic quotient" });
            }
            if (!this.pmiDisabled) {
                options.push({ value: "pmi", title: "Average PMI" });
            }
            return options;
        },
        target: {
            get() {
                return this.resultsStore.target;
            },
            set(value) {
                this.resultsStore.setTarget(value);
            },
        },
        allTrees: {
            get() {
                return this.resultsStore.trees;
            },
            set(value) {
                this.resultsStore.setTrees(value);
            },
        },
        ...mapStores(useResultsStore, useSettingsStore),
    },
    methods: {
        init() {
            this.buildTree();
        },
        downloadData(currentTree = false) {
            let blob;
            if (currentTree) {
                blob = new Blob([JSON.stringify(this.currentTree)], {
                    type: "data:text/json;charset=utf-8",
                });
            }
            else {
                blob = new Blob([JSON.stringify(this.trees)], {
                    type: "data:text/json;charset=utf-8",
                });
            }
            saveAs(blob, "treeResults.json");
        },
        addResultsToIpp() {
            this.resultsStore.addResultsToDispGraph({ maxDepth: this.maxDepthInput, maxNum: this.maxNumInput })
            this.$emit("switch-tab", "IPP");
        },
        addTreeToIpp(tree) {
            this.resultsStore.addTreeToDispGraph(tree);
            this.$emit("switch-tab", "IPP");
        },
        addTreesToIpp() {
            let selected = this.numTreesInput ? this.trees.slice(0, this.numTreesInput) : this.trees;
            selected.forEach(this.resultsStore.addTreeToDispGraph);
            this.$emit("switch-tab", "IPP");
        },
        loadNodeLinkGraph(data, showDetail = true) {
            /* Load tree in node link format into visjs and add visualization related attributes. */
            const graph = new RetroGraph(data.nodes, data.edges);

            if (showDetail) {
                /* For detail view, add extra visual attributes */
                graph.nodes.update(
                    data.nodes.map((node) => {
                        let dataNode = this.resultsStore.dataGraph.nodes.get(node["smiles"]);
                        if (node["type"] === "chemical") {
                            return makeChemicalDisplayNode({
                                id: node["id"],
                                data: dataNode,
                                target: this.target,
                                align: this.settingsStore.ippSettings.alignNodeImagesToTarget,
                                scale: false,
                            });
                        } else {
                            return makeReactionDisplayNode({
                                id: node["id"],
                                data: dataNode,
                                detail: true,
                            });
                        }
                    })
                );
                graph.edges.update(
                    data.edges.map((edge) => {
                        let from = graph.nodes.get(edge["from"]);
                        let to = graph.nodes.get(edge["to"]);
                        let reaction = from["type"] === "reaction" ? from["smiles"] : to["smiles"];
                        let reactionObj = this.resultsStore.dataGraph.nodes.get(reaction);
                        return makeDisplayEdge({
                            id: edge["id"],
                            from: edge["from"],
                            to: edge["to"],
                            value: reactionObj["averageModelScore"],
                        });
                    })
                );
            } else {
                graph.nodes.update(
                    data.nodes.map((node) => {
                        if (node.type === "chemical") {
                            return {
                                id: node.id,
                                image: getMolImageUrl(node.smiles),
                                shape: "image",
                            };
                        } else {
                            return {
                                id: node.id,
                                shape: "circle",
                            };
                        }
                    })
                );
            }

            return graph;
        },
        buildTree() {
            if (!this.tabActive || !this.currentTree) {
                return;
            }
            this.clearSelection();
            const elem = this.$refs.graph;
            this.networkData = this.loadNodeLinkGraph(this.currentTree, true);
            this.network = initializeNetwork(this.networkData, elem, true);
            this.network.on("selectNode", this.showNode);
            this.network.on("deselectNode", this.clearSelection);
        },
        addSortField() {
            this.treeSortInput.push({
                key: "num_reactions",
                ascending: true,
            });
        },
        deleteSortField(index) {
            this.treeSortInput.splice(index, 1);
        },
        setDefaultSortOrder(sortInput) {
            sortInput.ascending = ["num_reactions", "depth", "precursor_cost"].includes(sortInput.key);
        },
        changeTreeId(op) {
            let max = this.trees.length - 1;
            switch (op) {
                case "next":
                    if (this.currentTreeId < max) {
                        this.currentTreeId += 1;
                    }
                    break;
                case "prev":
                    if (this.currentTreeId > 0) {
                        this.currentTreeId -= 1;
                    }
                    break;
                case "first":
                    this.currentTreeId = 0;
                    break;
                case "last":
                    this.currentTreeId = max;
                    break;
                default:
                    console.error(`Unexpected operation '${op}' for changeTreeId.`);
            }
        },
        changeClusterId(op) {
            switch (op) {
                case "next":
                    if (this.currentClusterId < this.maxClusterId) {
                        this.currentClusterId += 1;
                    }
                    break;
                case "prev":
                    if (this.currentClusterId > this.minClusterId) {
                        this.currentClusterId -= 1;
                    }
                    break;
                case "first":
                    this.currentClusterId = this.minClusterId;
                    break;
                case "last":
                    this.currentClusterId = this.maxClusterId;
                    break;
                default:
                    console.error(`Unexpected operation '${op}' for changeClusterId.`);
            }
        },
        initializeFilterData() {
            if (!this.allTrees.length) {
                return;
            }
            this.initializeReactionClassFilter();
            this.initializeIntermediateFilter();
            this.initializeStartingMaterialFilter();
        },
        initializeReactionClassFilter() {
            const reactionClassesAvailable = this.resultsStore.dataGraph.nodes.get().some((node) => !!node["classNum"]);
            if (!reactionClassesAvailable) {
                return;
            }
            let allClasses = this.allTrees.map((tree) => {
                return Object.fromEntries(
                    tree.nodes
                        .filter((node) => node.type === "reaction")
                        .map((node) => {
                            let dataNode = this.resultsStore.dataGraph.nodes.get(node["smiles"]);
                            return [dataNode["classNum"], dataNode["className"]];
                        })
                );
            });
            this.reactionClassesByTree = Object.fromEntries(
                allClasses.map((classes, index) => {
                    return [index, new Set(Object.keys(classes))];
                })
            );
            this.reactionClassNames = allClasses.reduce((a, b) => Object.assign(a, b), {});
            this.reactionClassOptions = Object.entries(this.reactionClassNames)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([num, name]) => ({ text: `${num}: ${name}`, value: num }));
        },
        initializeIntermediateFilter() {
            this.intermediatesByTree = Object.fromEntries(
                this.allTrees.map((tree, index) => {
                    let intermediates = tree.nodes
                        .filter((node) => {
                            let result = node.type === "chemical" && !this.resultsStore.dataGraph.nodes.get(node["smiles"]).terminal;
                            if (this.resultsStore.savedResultInfo.type === "tree_builder") {
                                result &&= node.smiles !== this.resultsStore.savedResultInfo.smiles;
                            } else if (this.resultsStore.savedResultInfo.type === "graph_optimization") {
                                result &&= this.resultsStore.savedResultInfo.targets.includes(node.smiles);
                            }
                            return result;
                        })
                        .map((node) => node["smiles"]);
                    return [index, new Set(intermediates)];
                })
            );
            this.intermediateOptions = [
                ...Object.values(this.intermediatesByTree).reduce((a, b) => {
                    b.forEach((item) => a.add(item));
                    return a;
                }, new Set()),
            ].sort();
        },
        initializeStartingMaterialFilter() {
            this.startingMaterialsByTree = Object.fromEntries(
                this.allTrees.map((tree, index) => {
                    let startingMaterials = tree.nodes.filter((node) => node.type === "chemical" && this.resultsStore.dataGraph.nodes.get(node["smiles"]).terminal).map((node) => node["smiles"]);
                    return [index, new Set(startingMaterials)];
                })
            );
            this.startingMaterialOptions = [
                ...Object.values(this.startingMaterialsByTree).reduce((a, b) => {
                    b.forEach((item) => a.add(item));
                    return a;
                }, new Set()),
            ].sort();
        },
        showNode(selection) {
            const nodeId = selection.nodes[0];
            const dispNode = this.networkData.nodes.get(nodeId);
            const dataNode = this.resultsStore.dataGraph.nodes.get(dispNode.smiles);
            this.selected = {
                id: dispNode.id,
                smiles: dispNode.smiles,
                type: dispNode.type,
                data: dataNode,
                disp: dispNode,
            };
            if (dataNode.type === "chemical" && !dataNode.source) {
                this.resultsStore.updatePrice([dataNode.id]).then(() => {
                    let newData = this.resultsStore.dataGraph.nodes.get(dispNode.smiles);
                    let newDisp = this.networkData.nodes.get(dispNode.id);
                    this.selected["data"] = newData;
                    this.selected["disp"] = newDisp;
                });
            }
        },
        clearSelection() {
            this.selected = null;
        },
        buildTreeList() {
            /* Callback used by list view panel for drawing trees after panel creation */
            this.treeListItems.forEach((tree, index) => {
                let elem = document.getElementById(`treeList-${index}`);
                let networkData = this.loadNodeLinkGraph(tree, false);
                initializeNetwork(networkData, elem, false);
            });
        },
        async runPathwayRanking() {
            if (this.analysisTaskRunning) {
                alert("An analysis task is already running. Please wait until it finishes before submitting another.");
                return;
            }
            try {
                const confirmed = await this.createConfirm({
                    title: 'Start Pathway Ranking',
                    content: 'This will start a pathway ranking job for this result. If you stay on this page, you will receive a notification once the job is complete. Do you want to continue?',
                    dialogProps: { width: "60%" }
                });

                if (!confirmed) {
                    return;
                }

                this.currentTasks.push('Pathway Ranking');
                const url = `/api/tree-analysis/controller/call-async`;
                const body = {
                    result_id: this.resultsStore.savedResultInfo.id,
                    task: "pathway_ranking",
                };

                const json = await API.post(url, body);
                this.createSnackbar({ text: "Pathway ranking job submitted!", snackbarProps: { timeout: 2000, vertical: true, color: "grey-darken-1" } });

                const output = await API.pollCeleryResult(json);
                if (output.success) {
                    this.createSnackbar({ text: "Pathway ranking job complete! Refresh the page to view updated results.", snackbarProps: { timeout: -1, vertical: true, color: "green" } });
                } else {
                    this.createSnackbar({ text: `Pathway ranking job failed: ${output.error}`, snackbarProps: { timeout: -1, vertical: true, color: "red-darken-1" } });
                }
            } catch (error) {
                this.createSnackbar({ text: "Pathway ranking job failed! Please try again or try submitting a new tree builder job.", snackbarProps: { timeout: -1, vertical: true, color: "red-darken-1" } });
            } finally {
                this.currentTasks = this.currentTasks.filter(task => task !== 'Pathway Ranking');
                this.analysisTaskRunning = false;
            }
        },
        async runAnalogCounting(selectedTree = false) {
            if (this.analysisTaskRunning) {
                alert("An analysis task is already running. Please wait until it finishes before submitting another.");
                return;
            }

            try {
                const confirmed = await this.createConfirm({
                    title: 'Start Analog Counting',
                    content: 'This will start a job to estimate the number of analogs possible for this result. If you stay on this page, you will receive a notification once the job is complete. Do you want to continue?',
                    dialogProps: { width: "60%" },
                });

                if (!confirmed) {
                    return;
                }

                this.currentTasks.push('Analog Counting');
                let selectTreeIdx = -1;
                if (selectedTree) {
                    selectTreeIdx = this.allTrees.indexOf(this.currentTree);
                }

                const url = `/api/tree-analysis/controller/call-async`;
                const body = {
                    result_id: this.resultsStore.savedResultInfo.id,
                    task: "count_analogs",
                    index: selectTreeIdx,
                    min_plausibility: this.resultsStore.savedResultInfo.tbSettings["filter_threshold"],
                };

                const json = await API.post(url, body);
                this.createSnackbar({ text: "Analog counting job submitted!", snackbarProps: { timeout: 2000, vertical: true, color: "grey-darken-1" } });

                const output = await API.pollCeleryResult(json);
                if (output.success) {
                    this.createSnackbar({ text: "Analog counting job complete! Refresh the page to view updated results.", snackbarProps: { timeout: -1, vertical: true, color: "green" } });
                } else if (output.error) {
                    this.createSnackbar({ text: `Analog counting job failed: ${output.error}`, snackbarProps: { timeout: -1, vertical: true, color: "red-darken-1" } });
                }
            } catch (error) {
                this.createSnackbar({ text: "Analog counting job failed! Please try again or try submitting a new tree builder job.", snackbarProps: { timeout: -1, vertical: true, color: "red-darken-1" } });
            } finally {
                this.currentTasks = this.currentTasks.filter(task => task !== 'Analog Counting');
                this.analysisTaskRunning = false;
            }
        },
        async runReactionClassification() {
            if (this.analysisTaskRunning) {
                alert("An analysis task is already running. Please wait until it finishes before submitting another.");
            }
            try {
                const confirmed = await this.createConfirm({
                    title: 'Start Reaction Classification',
                    content: 'This will start a reaction classification job for this result. If you stay on this page, you will receive a notification once the job is complete. Do you want to continue?',
                    dialogProps: { width: "60%" }
                });
                if (!confirmed) {
                    return;
                }
                this.currentTasks.push('Reaction Classification');
                const url = `/api/tree-analysis/controller/call-async`;
                const body = {
                    result_id: this.resultsStore.savedResultInfo.id,
                    task: "reaction_classification",
                };
                const json = await API.post(url, body);
                this.createSnackbar({ text: "Reaction classification job submitted!", snackbarProps: { timeout: 2000, vertical: true, color: "grey-darken-1" } });
                const output = await API.pollCeleryResult(json);
                if (output.success) {
                    this.currentTasks = this.currentTasks.filter(task => task !== 'Reaction Classification');
                    this.createSnackbar({ text: "Reaction classification job complete! Refresh the page to view updated results.", snackbarProps: { timeout: -1, vertical: true, color: "green" } });
                } else {
                    this.currentTasks = this.currentTasks.filter(task => task !== 'Reaction Classification');
                    this.createSnackbar({ text: `Reaction classification job failed: ${output.error}`, snackbarProps: { timeout: -1, vertical: true, color: "red-darken-1" } });
                }
            } catch (error) {
                this.currentTasks = this.currentTasks.filter(task => task !== 'Reaction Classification');
                this.createSnackbar({ text: "Reaction classification job failed! Please try again or try submitting a new tree builder job.", snackbarProps: { timeout: -1, vertical: true, color: "red-darken-1" } });
            }
        },
        async runPmiCalculation(selectedTree = false) {
            if (this.analysisTaskRunning) {
                alert("An analysis task is already running. Please wait until it finishes before submitting another.");
                return;
            }

            try {
                const confirmed = await this.createConfirm({
                    title: 'Start PMI Calculation',
                    content: 'This will start a PMI calculation job for this result. Please note that this analysis will take a long time and depends on the number of trees and reactions. If you stay on this page, you will receive a notification once the job is complete. Do you want to continue?',
                    dialogProps: { width: "60%" }
                });
                if (!confirmed) {
                    return;
                }
                this.currentTasks.push('PMI Calculation');
                let selectTreeIdx = -1;
                if (selectedTree) {
                    selectTreeIdx = this.allTrees.indexOf(this.currentTree);
                }

                const url = `/api/tree-analysis/controller/call-async`;
                const body = {
                    result_id: this.resultsStore.savedResultInfo.id,
                    task: "pmi_calculation",
                    index: selectTreeIdx,
                };

                const json = await API.post(url, body);
                this.createSnackbar({ text: "PMI job submitted!", snackbarProps: { timeout: 2000, vertical: true, color: "grey-darken-1" } });

                await API.pollCeleryResult(json);
                this.createSnackbar({ text: "PMI calculation job is complete! Refresh the page to view updated results.", snackbarProps: { timeout: -1, vertical: true, color: "green" } });
            } catch (error) {
                this.createSnackbar({ text: "PMI calculation job failed! Please try again or try submitting a new tree builder job.", snackbarProps: { timeout: -1, vertical: true, color: "red-darken-1" } });
            } finally {
                this.currentTasks = this.currentTasks.filter(task => task !== 'PMI Calculation');
                this.analysisTaskRunning = false;
            }
        },
        num2str,
    },
    watch: {
        allTrees(newVal) {
            if (newVal.length) {
                this.initializeFilterData();
            }
        },
        cluster() {
            this.currentClusterId = this.minClusterId;
            this.currentTreeId = 0;
        },
        currentTree(newVal) {
            if (newVal) {
                this.buildTree();
            } else {
                // this.network.destroy();
            }
        },
        tabActive(newVal) {
            if (newVal) {
                this.init();
            }
        },
        trees() {
            this.currentTreeId = 0;
        },
        treeListItems() {
            if (this.showListView) {
                // Build vis-networks on next tick to allow v-for divs to be created first
                this.$nextTick(this.buildTreeList);
            }
        },
    },
};
</script>

<style>
#graph {
    width: 100%;
    height: calc(100vh - 14rem);
}

#tree-data-overlay {
    position: absolute;
    top: 2px;
    left: 2px;
    padding: 0.5rem;
    background-color: v-bind(backgroundColor);
}

.list-view-tree {
    height: 300px;
    border: 1px solid lightgray;
}

.vis-tooltip {
    padding: 0.5rem !important;
    background-color: #5194e1 !important;
    font-family: unset !important;
    text-align: center !important;
}
</style>