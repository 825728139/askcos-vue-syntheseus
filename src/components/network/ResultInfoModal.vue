<template>
    <v-dialog v-model="propsShow" scrollable width="800px">
        <v-card>
            <v-card-title>
                Result Info
            </v-card-title>
            <v-card-text>
                <v-expansion-panels multiple>
                    <v-expansion-panel title="Saved Result Details" data-cy="tree-builder-result-details">
                        <template v-slot:text>
                            <v-table class="mb-0">
                                <tr>
                                    <th>Description:</th>
                                    <td>{{ savedResultInfo.description }}</td>
                                </tr>
                                <tr>
                                    <th>Modified:</th>
                                    <td>{{ savedResultInfo.modifiedDisp }}</td>
                                </tr>
                                <tr>
                                    <th>Result type:</th>
                                    <td>{{ savedResultInfo.type }}</td>
                                </tr>
                                <tr>
                                    <th>Tags</th>
                                    <td>
                                        <v-chip v-for="tag in savedResultInfo.tags" :key="tag" class="mr-1">{{ tag
                                            }}</v-chip>
                                    </td>
                                </tr>
                            </v-table>
                        </template>
                    </v-expansion-panel>
                    <v-expansion-panel v-if="savedResultInfo.type === 'tree_builder'" title="Tree Builder Job Settings"
                        data-cy="tree-builder-job-settings">
                        <template v-slot:text>
                            <tb-settings-table v-if="savedResultInfo.tbSettings" :settings="savedResultInfo.tbSettings"
                                :targetSmiles="savedResultInfo.target"
                                :tbVersion="savedResultInfo.tbVersion"></tb-settings-table>
                        </template>
                    </v-expansion-panel>
                    <v-expansion-panel title="Tree Builder Job Statistics" data-cy="tree-builder-job-statistics">
                        <template v-slot:text>
                            <v-table class="mb-0">
                                <tr v-for="(value, key) in savedResultInfo.tbStats" :key="key">
                                    <th>{{ key[0].toUpperCase() + key.slice(1).replaceAll("_", " ") + ":" }}</th>
                                    <td>{{ Number.isInteger(value) ? value : value.toFixed(2) }}</td>
                                </tr>
                            </v-table>
                        </template>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="() => { propsShow = false }">Ok</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <!-- <b-modal v-if="savedResultInfo.id" id="result-info-modal" title="Result Info" size="lg" centered scrollable ok-only>
        <b-card-group columns style="column-count: 1">
            <b-card header="Saved Result Details" no-body>
                <b-table-simple class="mb-0">
                    <b-tr>
                        <b-th>Description:</b-th>
                        <b-td>{{ savedResultInfo.description }}</b-td>
                    </b-tr>
                    <b-tr>
                        <b-th>Modified:</b-th>
                        <b-td>{{ savedResultInfo.modifiedDisp }}</b-td>
                    </b-tr>
                    <b-tr>
                        <b-th>Result type:</b-th>
                        <b-td>{{ savedResultInfo.type }}</b-td>
                    </b-tr>
                    <b-tr>
                        <b-th>Tags</b-th>
                        <b-td>
                            <b-badge v-for="tag in savedResultInfo.tags" :key="tag" class="mr-1">{{ tag }}</b-badge>
                        </b-td>
                    </b-tr>
                </b-table-simple>
            </b-card>
    

        </b-card-group>
    </b-modal> -->
</template>

<script>
import { defineComponent, computed } from "vue";
import TbSettingsTable from "@/components/TbSettingsTable";
import { useResultsStore } from "@/store/results";

export default defineComponent({
    name: "ResultInfoModal",
    props: {
        visible: {
            type: Boolean,
            default: false,
        }
    },
    components: {
        TbSettingsTable,
    },
    setup(props, context) {
        const propsShow = computed({
            get() {
                return props.visible;
            },
            set(newValue) {
                context.emit('close', newValue)
            }
        })
        const resultsStore = useResultsStore();

        const savedResultInfo = computed(() => resultsStore.savedResultInfo);

        return {
            savedResultInfo,
            propsShow
        };
    },
});
</script>