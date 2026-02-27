<template>
    <v-container fluid>
        <v-row class="justify-center">
            <v-col cols="12" md="12" xl="10">
                <div class="my-5">
                    <h5 class="text-h4 text-blue">Hello, {{ username }}!</h5>
                </div>
            </v-col>
        </v-row>
        <v-row dense v-if="isAdmin && !dataLoading">
            <v-alert density="compact" type="warning" title="Warning" class="my-2" closable>
                <template v-slot:text>
                    <p class="text-body-1">
                        We trust you have received the usual lecture from the local System
                        Administrator. It usually boils down to these three things:
                    </p>
                    <p class="text-body-1">#1) Respect the data of others.</p>
                    <p class="text-body-1">#2) Think before you click.</p>
                    <p class="text-body-1">#3) With great power comes great responsibility.</p>
                </template>
            </v-alert>
            <v-col cols="12">
                <v-sheet rounded="lg" elevation="2" class="pa-5">
                    <v-data-table :headers="headers" :items="tableItems" multi-sort show-select v-model="selection"
                        item-value="username" height="500" :loading=dataLoading>
                        <template v-slot:top>
                            <v-toolbar flat>
                                <v-toolbar-title>ASKCOS Users</v-toolbar-title>
                                <v-select label="Filter by account type" density="comfortable" variant="outlined"
                                    hide-details clearable :items="filterOptions" item-text="title" item-value="key"
                                    v-model="filterSelected" class="mr-3"></v-select>
                                <v-checkbox v-model="filterCreatedDate" label="Show account older than 30 days"
                                    hide-details></v-checkbox>
                                <v-menu location="end">
                                    <template v-slot:activator="{ props }">
                                        <v-btn color="primary" dark v-bind="props" append-icon="mdi-chevron-down"
                                            v-if="selection.length" variant="flat">
                                            Bulk Operation
                                        </v-btn>
                                    </template>

                                    <v-list>
                                        <v-list-item v-if="showMakeAdminButton">
                                            <v-btn variant="tonal" color="warning" @click="mutateAll('admin')">Make
                                                selected admins</v-btn>
                                        </v-list-item>
                                        <v-list-item v-if="showMakeNormalButton">
                                            <v-btn variant="tonal" color="primary" @click="mutateAll('normal')">Make
                                                selected normal users</v-btn>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-btn variant="tonal" color="primary" @click="mutateAll('enable')">Unlock
                                                selected
                                                accounts</v-btn>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-btn variant="tonal" color="primary" @click="mutateAll('disable')">Lock
                                                selected
                                                accounts</v-btn>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-btn variant="tonal" color="error" @click="mutateAll('delete')">Delete
                                                selected accounts</v-btn>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" variant="flat" prepend-icon="mdi-plus"
                                    @click="openDialogNewUser = true">New
                                    User</v-btn>
                            </v-toolbar>
                        </template>
                        <template v-slot:item.is_superuser="{ item }">
                            <span v-if="item.is_superuser === true">Admin</span>
                            <span v-else>Not Admin</span>
                        </template>
                        <template v-slot:item.disabled="{ item }">
                            <span v-if="item.disabled === true">Yes</span>
                            <span v-else>No</span>
                        </template>
                        <template v-slot:item.accountType="{ item }">
                            <v-chip :color="getColor(item.accountType)">
                                {{ item.accountType }}
                            </v-chip>
                        </template>
                        <template v-slot:item.last_login="{ item }">
                            <span>{{ formatDateWithoutTimezone(item.last_login) }}</span>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-menu location="end">
                                <template v-slot:activator="{ props }">
                                    <v-btn color="primary" dark v-bind="props" append-icon="mdi-chevron-down"
                                        :disabled="selection.length !== 0">
                                        More
                                    </v-btn>
                                </template>

                                <v-list>
                                    <v-list-item v-if="!(item.accountType === 'Guest' || item.accountType === 'Admin')">
                                        <v-btn variant="tonal" color="warning"
                                            @click="mutate(item.username, 'admin')">Make
                                            admin</v-btn>
                                    </v-list-item>
                                    <v-list-item
                                        v-if="!(item.accountType === 'Guest' || item.accountType === 'Normal')">
                                        <v-btn variant="tonal" color="primary"
                                            @click="mutate(item.username, 'normal')">Make
                                            normal user</v-btn>
                                    </v-list-item>
                                    <v-list-item v-if="!(item.disabled === false)">
                                        <v-btn variant="tonal" color="primary"
                                            @click="mutate(item.username, 'enable')">Unlock
                                            Account</v-btn>
                                    </v-list-item>
                                    <v-list-item v-if="!(item.disabled === true)">
                                        <v-btn variant="tonal" color="primary"
                                            @click="mutate(item.username, 'disable')">Lock
                                            Account</v-btn>
                                    </v-list-item>
                                    <v-list-item v-if="!(item.accountType === 'Guest')">
                                        <v-btn variant="tonal" color="primary"
                                            @click="mutate(item.username, 'pwd')">Edit
                                            Password</v-btn>
                                    </v-list-item>
                                    <v-list-item v-if="!(item.accountType === 'Guest')">
                                        <v-btn variant="tonal" color="primary"
                                            @click="mutate(item.username, 'email')">Edit
                                            Email</v-btn>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-btn variant="tonal" color="error"
                                            @click="mutate(item.username, 'delete')">Delete
                                            Account</v-btn>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </template>
                    </v-data-table>
                </v-sheet>
            </v-col>
        </v-row>
        <v-row class="d-flex flex-row justify-center align-center" v-if="!isAdmin && !dataLoading">
            <v-col cols="12" sm="3">
                <v-sheet class="pa-5 rounded-lg" elevation="2">
                    <h4 class="text-h4">Profile</h4>
                    <v-divider></v-divider>
                    <div class="d-flex flex-column justify-center align-center mt-1">
                        <v-img :src="wp" width="200" style="border-radius: 50%;"></v-img>
                    </div>
                </v-sheet>
            </v-col>
            <v-col cols="12" sm="4" class="d-flex flex-row justify-center align-center">
                <v-sheet class="pa-5 rounded-lg" elevation="2">
                    <h4 class="text-h4">Email</h4>
                    <v-divider></v-divider>
                    <p class="text-body-1">{{ userEmail }}</p>
                    <v-btn color="warning" class="mr-2" @click="mutate(username, 'email')" size="small">Update
                        Email</v-btn>
                    <h4 class="mt-4 text-h4">Password</h4>
                    <v-divider></v-divider>
                    <p class="text-body-1">Last Login:
                        <timeago :datetime="userLastLogin" :converter-options="{
                        includeSeconds: true,
                        addSuffix: false,
                        useStrict: false,
                    }" auto-update />
                        ago
                    </p>
                    <v-btn color="warning" class="mr-2" @click="mutate(username, 'pwd')" size="small">Change
                        Password</v-btn>
                    <v-alert text="If you wish to delete this account you can do so by clicking below"
                        title="Danger Zone" type="warning" class="mt-2" density="compact" color="#FF0000"
                        variant="outlined"></v-alert>
                    <v-btn color="error" @click="mutate(username, 'delete')" size="small" class="mt-2">Delete
                        Account</v-btn>
                </v-sheet>
            </v-col>
        </v-row>
        <loader v-if="dataLoading" />
    </v-container>
    <new-user-dialog-box v-model:openDialog="openDialogNewUser" />
    <edit-user-dialog-box v-model:openDialog="openDialogEditEmail" v-model:value="newEmail" @updateValue="changeEmail()"
        label="Email" />
    <edit-user-dialog-box v-model:openDialog="openDialogEditPassword" v-model:value="newPassword"
        @updateValue="changePassword()" label="Password" :hide="true" />

</template>

<script setup>
import EditUserDialogBox from "@/components/admin/EditUserDialogBox"
import NewUserDialogBox from "@/components/admin/NewUserDialogBox"
import Loader from "@/components/admin/Loader"
import { ref, onMounted, computed } from 'vue'
import { API } from "@/common/api";
import { useSnackbar } from 'vuetify-use-dialog';
import wp from "@/assets/wp.png"

const createSnackbar = useSnackbar()
const username = ref(localStorage.getItem('username'))
const userEmail = ref('')
const userLastLogin = ref('')
const newPassword = ref('')
const newEmail = ref('')
const selectedUser = ref('')
const isAdmin = ref(false)
const users = ref([])
const selection = ref([]);
const filterOptions = ref([
    { key: 'Guest', title: 'Guest' },
    { key: 'Normal', title: 'Normal' },
    { key: 'Admin', title: 'Admin' },
]);
const headers = ref([
    { title: 'Username', key: 'username' },
    { title: 'Email', key: 'email' },
    { title: 'Account Type', key: 'accountType' },
    { title: 'Disabled', key: 'disabled' },
    { title: 'Last Login', key: 'last_login' },
    { title: 'Actions', key: 'actions', align: 'center' },
])
const openDialogNewUser = ref(false)
const openDialogEditPassword = ref(false)
const openDialogEditEmail = ref(false)
const usersDict = ref({})
const filterSelected = ref(null)
const filterCreatedDate = ref(false)
const dataLoading = ref(true)

const tableItems = computed(() => {
    const daysOld = 30;
    const currentDate = new Date();
    let items = users.value;
    if (filterSelected.value !== null) {
        items = items.filter(item => item.accountType === filterSelected.value);
    }
    if (filterCreatedDate.value === true) {
        items = items.filter(item => {
            const itemDate = new Date(item.last_login);
            const diffTime = Math.abs(currentDate - itemDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > daysOld;
        });
    }
    return items;
})

const formatDateWithoutTimezone = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    return date.toLocaleString('en-US', options); // Adjust the locale as needed
};

const changePassword = async () => {
    openDialogEditPassword.value = false;
    await API.post('/api/user/reset-password', { username: selectedUser.value, password: newPassword.value }, true)
        .then(async response => {
            console.log(response.Error)
            if (response === "OK") {
                await fetchData()
                createSnackbar({ text: "Successfully changed password!", snackbarProps: { timeout: 3000 } });
            }
        })
        .catch((err) => {
            const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
            const detail = match[1];
            createSnackbar({ text: `Failed to change password: ${detail}`, snackbarProps: { timeout: 3000 } });
        }).finally(() => {
            selectedUser.value = "";
            newPassword.value = "";
        })
}


const changeEmail = async () => {
    openDialogEditEmail.value = false;
    await API.post('/api/user/update', { username: selectedUser.value, email: newEmail.value }, true)
        .then(async response => {
            console.log(response.Error)
            if (response === "OK") {
                await fetchData()
                createSnackbar({ text: "Successfully changed email!", snackbarProps: { timeout: 3000 } });
            }
        })
        .catch((err) => {
            const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
            const detail = match[1];
            createSnackbar({ text: `Failed to change email: ${detail}`, snackbarProps: { timeout: 3000 } });
        }).finally(() => {
            selectedUser.value = "";
            newEmail.value = "";
        })
}


onMounted(async () => {
    await fetchData()
})

const fetchData = async () => {
    dataLoading.value = true
    try {
        // check if the username is admin
        isAdmin.value = await API.get("/api/user/am-i-superuser", null, false);

        usersDict.value = {};

        if (isAdmin.value) {
            let response = await API.get("/api/user/get-all-users", null, false);
            if (Array.isArray(response)) {
                response.forEach((user) => {
                    usersDict.value[user.username] = user;
                    if (user.username.startsWith('guest_')) {
                        usersDict.value[user.username].accountType = "Guest"
                    } else if (user.is_superuser) {
                        usersDict.value[user.username].accountType = "Admin"
                    } else {
                        usersDict.value[user.username].accountType = "Normal"
                    }
                })
                users.value = Object.values(usersDict.value)
            } else {
                console.error("API did not return an array as expected:", response);
            }
        } else {
            let response = await API.get("/api/user/get-current-user", null, false);
            if (response) {
                userEmail.value = response.email
                userLastLogin.value = response.last_login
            }
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    } finally {
        dataLoading.value = false;
    }
}

const mutate = async (username, method) => {
    try {
        let response;
        switch (method) {
            case 'email':
                openDialogEditEmail.value = true;
                selectedUser.value = username;
                break;
            case 'pwd':
                openDialogEditPassword.value = true;
                selectedUser.value = username;
                break;
            case 'admin':
                response = await API.get('/api/user/promote', { username: username }, true);
                break;
            case 'normal':
                response = await API.get('/api/user/demote', { username: username }, true);
                break;
            case 'disable':
                response = await API.post('/api/user/update', { username: username, disabled: true }, true);
                break;
            case 'enable':
                response = await API.post('/api/user/update', { username: username, disabled: false }, true);
                break;
            case 'delete':
                response = await API.delete('/api/user/delete', { username: username }, true);
                break;
        }

        if (response && response === "OK") {
            await fetchData();
            createSnackbar({ text: `Successfully ${method}d user!`, snackbarProps: { timeout: 3000 } });
        }
    } catch (err) {
        const match = err.toString().match(/\"detail\":\"([^\"]+)\"/);
        const detail = match ? match[1] : 'Unknown error';
        createSnackbar({ text: `Failed to ${method} user: ${detail}`, snackbarProps: { timeout: 3000 } });
    }
};

const mutateAll = async (method) => {
    try {
        const promises = selection.value.map(username => mutate(username, method));
        await Promise.all(promises);
        if (method === 'delete') {
            selection.value = [];
        }
    } catch (error) {
        console.error(`Error in bulk ${method}:`, error);
    }
};

const showMakeAdminButton = computed(() => {
    return selection.value.some(username =>
        usersDict.value[username].accountType === 'Normal'
    ) && !selection.value.some(username =>
        usersDict.value[username].accountType === 'Admin'
    );
});

const showMakeNormalButton = computed(() => {
    return selection.value.some(username =>
        usersDict.value[username].accountType === 'Admin'
    ) && !selection.value.some(username =>
        usersDict.value[username].accountType === 'Normal'
    );
});

const getColor = (type) => {
    if (type === "Admin") return 'green'
    if (type === "Normal") return 'blue'
    else return 'orange'
}
</script>