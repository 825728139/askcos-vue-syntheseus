<template>
    <v-dialog v-model="showMultiEntryDialog" max-width="600px">
        <v-card>
            <v-card-title class="mt-2">
                <v-col cols="12">Upload banlist JSON</v-col>
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" class="mb-2">
                        <span>
                            Upload a JSON file containing multiple banlist entries.
                        </span>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12">
                        <v-file-input label="JSON file" v-model="multiUploadFile" accept="application/json,.json"
                            density="comfortable" variant="outlined" clearable></v-file-input>
                    </v-col>
                </v-row>

            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDialog">Close</v-btn>
                <v-btn color="green darken-1" data-cy="banlist-file-upload" text :disabled="!multiUploadFile" :loading="isUploading"
                    @click="uploadMultipleEntries">Upload</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { API } from "@/common/api";
import { useSnackbar } from 'vuetify-use-dialog';

const showMultiEntryDialog = defineModel("showMultiEntryDialog", { required: true, default: false })
const pendingTasks = defineModel("pendingTasks", { required: true })
const emit = defineEmits(['loadCollection'])

const multiUploadFile = ref(null);
const isUploading = ref(false);
const createSnackbar = useSnackbar();

const isReactionSmiles = (smiles) => {
    return smiles.includes('>>');
};

const closeDialog = () => {
    showMultiEntryDialog.value = false;
    multiUploadFile.value = null;
};

const uploadMultipleEntries = async () => {
    if (!multiUploadFile.value) return;

    isUploading.value = true;

    const file = multiUploadFile.value;
    pendingTasks.value++;

    const text = await file.text();
    let entries = null;

    if (text) {
        entries = JSON.parse(text);
    }
    if (!Array.isArray(entries)) {
        createSnackbar({ text: "Invalid JSON format. Expected an array of entries.", snackbarProps: { color: 'error', timeout: 3000 } });
        isUploading.value = false;
        multiUploadFile.value = null;
        pendingTasks.value--;
        return;
    }

    let chemicalSuccess = 0;
    let reactionSuccess = 0;
    let errorCount = 0;

    for (const entry of entries) {
        if (!entry.smiles) {
            errorCount++;
            continue;
        }

        const category = isReactionSmiles(entry.smiles) ? 'reactions' : 'chemicals';
        const body = new URLSearchParams({
            description: entry.description || 'no description',
            smiles: entry.smiles,
            active: entry.active !== undefined ? entry.active : true
        }).toString().replace(/\+/g, '%20');

        await API.post(`/api/banlist/${category}/post?${body}`)
            .then(() => {
                if (category === 'chemicals') chemicalSuccess++;
                else reactionSuccess++;
            })
            .catch(() => {
                errorCount++;
            });
    }

    if (chemicalSuccess > 0) emit("loadCollection", "chemicals");
    if (reactionSuccess > 0) emit("loadCollection", "reactions");

    const successParts = [];
    if (chemicalSuccess > 0) successParts.push(`${chemicalSuccess} chemical${chemicalSuccess > 1 ? 's' : ''}`);
    if (reactionSuccess > 0) successParts.push(`${reactionSuccess} reaction${reactionSuccess > 1 ? 's' : ''}`);
    const successMsg = successParts.join(' and ');

    if (errorCount === 0) {
        createSnackbar({ text: `Successfully added ${successMsg}.`, snackbarProps: { color: 'success', timeout: 3000 } });
        showMultiEntryDialog.value = false;
    } else {
        createSnackbar({ text: `Added ${successMsg}. ${errorCount} entries failed.`, snackbarProps: { color: 'warning', timeout: 3000 } });
    }

    isUploading.value = false;
    multiUploadFile.value = null;
    pendingTasks.value--;
};
</script>

