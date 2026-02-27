<template>
    <v-app-bar color="white" density="compact" elevation="2">
        <v-app-bar-title>Admin Panel</v-app-bar-title>
        <template v-slot:append>
            <v-btn prepend-icon="mdi-home" variant="tonal" color="primary" to="/" class="mr-2">Home</v-btn>
            <v-btn prepend-icon="mdi-logout" variant="tonal" @click="logout">Logout</v-btn>
        </template>
    </v-app-bar>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
// logout function
const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('username')
    router.push('/admin-login');
}
</script>