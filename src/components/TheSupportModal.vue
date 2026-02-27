<template>
    <v-dialog v-model="dialog" activator="parent" max-width="600px">
        <v-card prepend-icon="mdi-email" title="Send support email">
            <v-divider></v-divider>
            <v-card-text class="text-justify">
                <v-row>
                    <v-col cols="12">
                        <v-select v-model="selectedModule" :items="moduleOptions" item-text="text" item-value="value"
                            label="Select module" density="comfortable" variant="outlined" hide-details
                            clearable></v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-select v-model="selectedCategory" :items="categoryOptions" item-text="text"
                            item-value="value" label="Select issue category" density="comfortable" variant="outlined"
                            hide-details clearable></v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="supportSubject" label="Email subject line"
                            placeholder="Subject line (max length: 150 characters)" maxlength="150" autocomplete="off"
                            density="comfortable" variant="outlined" hide-details clearable></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-checkbox v-model="supportShared"
                            label="I wish to share this information with other Consortium members" density="comfortable"
                            hide-details></v-checkbox>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-alert border="start" type="info" density="compact" variant="tonal" class="mb-2 py-2">
                            <template v-slot:text>
                                Clicking "Submit" should launch your email client to send us an email. If this is
                                blocked for some
                                reason, please include the above information in an email you compose separately to
                                {{ contactEmail }}
                            </template>
                        </v-alert>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="mb-2">
                <v-spacer></v-spacer>
                <v-btn variant="tonal" @click="dialog = false">Close</v-btn>
                <v-btn variant="tonal" color="primary" @click="submitSupport">Submit</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { useConfigStore } from "@/store/config";
const configStore = useConfigStore();

const dialog = ref(false);
const selectedModule = ref({ key: "onestep", title: "One-step Retrosynthesis" });
const selectedCategory = ref({ key: "bug", title: "Report a bug" });
const moduleOptions = ref([
    { key: "onestep", title: "One-step Retrosynthesis" },
    { key: "pathplanner", title: "Interactive Path Planning" },
    { key: "treebuilder", title: "Tree Builder" },
    { key: "context", title: "Context Recommendation" },
    { key: "synthpred", title: "Synthesis Predictor" },
    { key: "impurity", title: "Impurity Predictor" },
    { key: "regioselec", title: "Regioselectivity Predictor" },
    { key: "siteselec", title: "Site-Selectivity Predictor" },
    { key: "general", title: "General" },
]);

const categoryOptions = ref([
    { key: "bug", title: "Report a bug" },
    { key: "enhancement", title: "Request an enhancement" },
    { key: "documentation", title: "Documentation" },
    { key: "general", title: "General query" },
]);
const supportSubject = ref("");
const supportShared = ref(false);

const contactEmail = computed({ get: () => configStore.envs.VITE_CONTACT_EMAIL })
const supportEmail = computed({ get: () => configStore.envs.VITE_SUPPORT_EMAILS })

const submitSupport = () => {
    let mailtoString = `mailto:${supportEmail.value}`;
    mailtoString += `?subject=${encodeURIComponent(selectedModule.value.title)} `;
    mailtoString += `| ${encodeURIComponent(selectedCategory.value.title)} `;
    mailtoString += `${supportShared.value ? "| Shared " : ""}`;
    mailtoString += `| ${encodeURIComponent(supportSubject.value)} `;
    mailtoString += "&body=Please add your comments here. Please don't modify the beginning of the subject line; we use this for internal purposes.";
    window.open(mailtoString, "_blank");
    dialog.value = false;
};

</script>