<template>
    <v-dialog v-model="openDialog" max-width="600px">
        <v-card prepend-icon="mdi-account" title="Add New User">
            <v-divider />
            <v-card-text>
                <v-text-field v-model="newUsername" variant="outlined" label="Username" hide-details clearable
                    class="my-2"></v-text-field>
                <v-text-field v-model="newEmail" variant="outlined" label="Email" hide-details clearable
                    class="my-2"></v-text-field>
                <v-text-field v-model="newPassword" variant="outlined" label="Password" type="password" hide-details
                    clearable class="my-2"></v-text-field>
                <v-checkbox label="Make admin" v-model="newSuperuser" class="my-2"></v-checkbox>
            </v-card-text>
            <v-divider />
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="tonal" @click="openDialog = false">Close</v-btn>
                <v-btn variant="tonal" color="primary" @click="addUser()">Submit</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { useSnackbar } from 'vuetify-use-dialog';
import { API } from "@/common/api";
import { ref } from 'vue'

const openDialog = defineModel("openDialog", { default: false, required: true })
const newUsername = ref('')
const newPassword = ref('')
const newEmail = ref('')
const newSuperuser = ref(false)

const createSnackbar = useSnackbar()
const addUser = () => {
    if (!newUsername.value || !newPassword.value || !newEmail.value) {
        createSnackbar({ text: "Please fill in all fields", snackbarProps: { timeout: 3000 } });
        return;
    }

    let body = {
        username: newUsername.value,
        password: newPassword.value,
        email: newEmail.value,
        is_superuser: newSuperuser.value,
    };

    API.post('/api/user/register', body, true)
        .then(async response => {
            console.log(response.Error)
            if (response === "OK") {
                await fetchData();
                createSnackbar({ text: "User added successfully!", snackbarProps: { timeout: 3000 } });
                clearUserFields();
            }
        })
        .catch((err) => {
            const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
            const detail = match[1];
            createSnackbar({ text: `Failed to add user: ${detail}`, snackbarProps: { timeout: 3000 } });
            clearUserFields();
        })
        .finally(() => {
            openDialog.value = false;
        });
};

const clearUserFields = () => {
    newUsername.value = '';
    newPassword.value = '';
    newEmail.value = '';
    newSuperuser.value = false;
};
</script>