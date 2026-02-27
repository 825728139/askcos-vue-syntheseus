<template>
    <v-row v-if="username">
        <v-col class="d-flex flew-row justify-center align-center">
            <v-menu location="end">
                <template v-slot:activator="{ props }">
                    <v-btn color="orange-darken-1" dark v-bind="props" variant="tonal" prepend-icon="mdi-star"
                        append-icon="mdi-chevron-down" rounded="pill" class="text-none">
                        Favorites
                    </v-btn>
                </template>
                <v-list rounded="lg">
                    <template v-for="(item, index) in favoritesMenu">
                        <v-list-item :to="item.link" v-if="item.selected" :key="index">
                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                        </v-list-item>
                    </template>
                    <v-divider></v-divider>
                    <v-list-item prepend-icon="mdi-pencil" @click="showEditFav = true">Edit Favorites</v-list-item>
                </v-list>
            </v-menu>
            <v-spacer></v-spacer>
            <span class="text-body-1 mr-1">Logged in as{{ superuser ? " superuser" : "" }},</span>
            <v-chip color="primary" to="/admin" :disabled="username.startsWith('guest_')">
                <v-icon start icon="mdi-account-circle"></v-icon>
                <span class="text-body-1" data-cy="home-username"><strong>{{ username }}</strong></span>
            </v-chip>
        </v-col>
    </v-row>
    <v-dialog v-model=showEditFav width="auto">
        <v-card>
            <v-card-title>
                <span class="text-h5">Edit Favorites</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-list>
                    <v-list-item v-for="item in favoritesMenu" :key="item.link"
                        @click="item.selected = !item.selected;">
                        <v-list-item-title>
                            {{ item.title }}
                            <v-icon class="ml-1 mb-2" v-show="item.selected" icon="mdi-check">
                            </v-icon>
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="showEditFav = false; saveFav()" color="success">
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { API } from '@/common/api'
import { useConfirm } from 'vuetify-use-dialog';
import { useRouter } from "vue-router";

const showEditFav = ref(false);
const username = ref(localStorage.getItem("username"))
const favLocalStorage = ref(localStorage.getItem(`${username.value}_fav`))
const superuser = ref(false);
const favoritesMenu = ref([
    { title: "Interactive Path Planner/Tree Builder", link: '/network?tab=IPP', selected: true },
    { title: "Retrosynthesis Prediction", link: '/network?tab=RP', selected: true },
    { title: "Condition Recommendation", link: '/forward?tab=context', selected: false },
    { title: "Product Prediction", link: "/forward?tab=forward", selected: false },
    { title: "Impurity Prediction", link: "/forward?tab=impurity", selected: false },
    { title: "Regioselectivity Prediction", link: "/forward?tab=selectivity", selected: false },
    { title: "Aromatic C-H Functionalization", link: "/forward?tab=sites", selected: false },
    { title: "Solubility Prediction", link: "/forward?tab=sites", selected: false },
    { title: "Solvent Screening", link: "/solprop?tab=solscreen", selected: false },
    { title: "Buyables", link: "/buyables", selected: false },
    { title: "Drawing", link: "/drawing", selected: false },
    { title: "Server Status", link: "/status", selected: false },
    { title: "Logs", link: "/logs", selected: false },
    { title: "My Results", link: "/results", selected: false },
    { title: "My Banlist", link: "/banlist", selected: false }
])
const createConfirm = useConfirm();
const router = useRouter();

onMounted(() => {
    if (favLocalStorage.value) {
        favoritesMenu.value = JSON.parse(favLocalStorage.value);
    }
    if (username.value) { amISuperUser() }
})

const saveFav = () => {
    favLocalStorage.value = JSON.stringify(favoritesMenu.value);
    localStorage.setItem(`${username.value}_fav`, favLocalStorage.value);
}

const amISuperUser = async () => {
    try {
        superuser.value = await API.get('/api/user/am-i-superuser', null, false);
    }
    catch {
        const isConfirmed = await createConfirm({ title: 'Login Error', content: 'Session expired, please re-login', dialogProps: { width: "auto" } })
        localStorage.removeItem("accessToken");
        localStorage.removeItem("username");
        if (!isConfirmed) {
            router.go(0);
            return;
        }
        superuser.value = false
        router.push("/login");
    }
}
</script>
