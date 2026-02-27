<template>
    <v-dialog v-model="showBanItemDialog" max-width="600px">
        <v-card>
            <v-card-title class="mt-2">
                <v-col cols="12">Add new banlist entry</v-col></v-card-title>

            <v-card-text class="text-justify">
                <v-row>
                    <v-col cols="12">
                        <v-select v-model="newType" item-text="key" item-value="title" data-cy="banlist-new-entry-select"
                            :items="['chemicals', 'reactions']" label="Entry Type" density="comfortable"
                            variant="outlined" hide-details clearable></v-select>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="newSmiles" label="SMILES" data-cy="banlist-new-smiles-input" maxlength="150" autocomplete="off"
                            density="comfortable" variant="outlined" hide-details clearable>
                            <template v-slot:append-inner>
                                <v-btn variant="tonal" data-cy="banlist-new-draw" prepend-icon="mdi mdi-pencil"
                                    @click="openKetcher(newSmiles)">Draw</v-btn>
                            </template>
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" v-if="!!newSmiles">
                        <smiles-image :smiles="newSmiles" height="100px"></smiles-image>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="newDesc" data-cy="banlist-new-description" label="Description" maxlength="150" autocomplete="off"
                            density="comfortable" variant="outlined" hide-details clearable></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="mb-2">
                <v-spacer></v-spacer>
                <v-btn color="success" data-cy="banlist-new-submit" @click="addEntry">Submit</v-btn>
                <v-btn data-cy="banlist-new-cancel" text @click="showBanItemDialog = false">Cancel</v-btn>
            </v-card-actions>
        </v-card>
        <ketcher-modal ref="ketcherRef" v-model="showKetcher" :smiles="newSmiles" @input="showKetcher = false"
            @update:smiles="updateSmiles" />
    </v-dialog>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import KetcherModal from "@/components/KetcherModal";
import { API } from "@/common/api";
import SmilesImage from "@/components/SmilesImage";
import { useSnackbar } from 'vuetify-use-dialog';

const showBanItemDialog = defineModel("showBanItemDialog", { required: true, default: false })
const pendingTasks = defineModel("pendingTasks", { required: true })
const activeTab = defineModel("activeTab", { required: true })
const emit = defineEmits(['loadCollection'])
const ketcherRef = ref(null);
const showKetcher = ref(false);
const newDesc = ref('');
const newActive = ref(true)
const newType = ref("chemicals");
const newSmiles = ref('');
const createSnackbar = useSnackbar();

const addEntry = () => {
    if (!newSmiles.value) {
        createSnackbar({ text: "SMILES is required.", snackbarProps: { color: 'error', timeout: 3000 } });
        return;
    }

    pendingTasks.value++;

    const body = new URLSearchParams({
        description: newDesc.value || 'no description',
        smiles: newSmiles.value,
        active: newActive.value
    }).toString().replace(/\+/g, '%20');

    API.post(`/api/banlist/${newType.value}/post?${body}`)
        .then(() => {
            createSnackbar({ text: `Successfully added ${newType.value === 'chemicals' ? 'chemical' : 'reaction'}.`, snackbarProps: { color: 'success', timeout: 3000 } });
            emit("loadCollection", newType.value === 'chemicals' ? 'chemicals' : 'reactions');
            nextTick(() => {
                if (newType.value === 'chemicals') {
                    activeTab.value = 0;
                } else {
                    activeTab.value = 1;
                }
            });
            newSmiles.value = '';
            newDesc.value = '';
            showBanItemDialog.value = false;
        })
        .catch(() => {
            createSnackbar({ text: "Failed to add entry. Please try again.", snackbarProps: { color: 'error', timeout: 3000 } });
        })
        .finally(() => {
            pendingTasks.value--;
        });
}

const openKetcher = (source) => {
    newSmiles.value = source;
    showKetcher.value = true;
    ketcherRef.value.smilesToKetcher();
};

const updateSmiles = (source) => {
    newSmiles.value = source;
}
</script>