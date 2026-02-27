<template>
    <div>
        <div ref='vantaRef' style="height: 100vh" class="d-flex justify-center align-center">
            <v-container fluid>
                <v-row class="d-flex justify-space-between align-center px-16">
                    <v-col cols="12" md="6" lg="5">
                        <h1 class="text-h1 font-weight-bold text-white">ASKCOS</h1>
                        <h6 class="text-h6 font-weight-bold text-white">Computer-aided Design Tools for Organic
                            Synthesis
                        </h6>
                    </v-col>
                    <v-col cols="12" md="6" lg="4" xl="3" class="d-flex justify-center align-center">
                        <v-sheet elevation="10" rounded="lg">
                            <v-form ref="form" class="pa-5" @submit.prevent>
                                <div class="d-flex flex-column">
                                    <v-btn color="primary" size="x-large" block variant="flat"
                                        prepend-icon="mdi-account-key" @click="keycloakLogin" data-cy="keycloakLogin"
                                        class="mb-3">
                                        Single Sign-On Login
                                    </v-btn>
                                    <v-container>
                                        <v-row wrap no-gutters>
                                            <v-col cols="5" class="text-center">
                                                <v-divider class="mt-3" />
                                            </v-col>
                                            <v-col cols="2" class="text-center text-h6">
                                                OR
                                            </v-col>
                                            <v-col cols="5" class="text-center">
                                                <v-divider class="mt-3" />
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </div>
                                <v-text-field label="Username" variant="outlined" v-model="username"
                                    :rules="usernameRules" clearable data-cy="username"></v-text-field>
                                <v-text-field label="Password" variant="outlined" required type="password"
                                    v-model="password" :rules="passwordRules" clearable
                                    data-cy="password"></v-text-field>
                                <div v-if="loginFailure" class="text-red text-center text-subtitle-1">
                                    <p>Either username or password is incorrect</p>
                                </div>
                                <div class="d-flex flex-column">
                                    <v-container>
                                        <v-row wrap no-gutters>
                                            <v-col cols="6" class="text-center">
                                                <v-btn color="primary" size="x-large" @click="login" type="submit"
                                                    variant="flat" data-cy="login">
                                                    Log In
                                                </v-btn>
                                            </v-col>
                                            <v-col cols="6" class="text-center">
                                                <v-btn color="primary" size="x-large" @click="signup" type="submit"
                                                    variant="flat" data-cy="signup">
                                                    Sign Up
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                    <v-divider class="my-4">
                                    </v-divider>
                                    <v-btn color="primary" size="x-large" block variant="tonal"
                                        @click="guestAccountSignup" :disabled="waitGuest" data-cy="guestSignup">
                                        Continue as Guest
                                    </v-btn>
                                </div>
                            </v-form>
                        </v-sheet>
                    </v-col>
                </v-row>
            </v-container>
        </div>
        <v-dialog v-model="showSignupDialog" width="auto">
            <v-sheet elevation="2" max-width="600" rounded="lg" width="100%" class="pa-4 text-center mx-auto">
                <div v-if="!createdAccount && !creationFailure">
                    <v-progress-linear indeterminate color="green"></v-progress-linear>
                    <h2 class="text-h5 my-6">Setting up your account, few moments...</h2>
                </div>
                <div v-if="createdAccount && !creationFailure">
                    <v-icon class="mb-5" color="success" icon="mdi-check-circle" size="112"></v-icon>
                    <h2 class="text-h5 mb-6">Signup was successful!</h2>
                </div>
                <div v-if="creationFailure">
                    <v-icon class="mb-5" color="warning" icon="mdi-alert-circle" size="112"></v-icon>
                    <h2 class="text-h5 mb-6">Signup has failed!</h2>
                </div>

                <v-divider class="mb-4"></v-divider>

                <div class="text-end">
                    <v-btn class="text-none" color="success" variant="flat" width="90"
                        :disabled="!createdAccount && !creationFailure" @click="closeSignup">
                        Done
                    </v-btn>
                </div>
            </v-sheet>
        </v-dialog>
    </div>
</template>

<script setup>
import * as THREE from "three";
import HALO from 'vanta/dist/vanta.halo.min'
import { ref, onMounted, inject } from 'vue';
import { API } from "@/common/api";
import { useRoute, useRouter } from "vue-router";

const vantaRef = ref(null);
const username = ref(null);
const password = ref(null);
const showSignupDialog = ref(false);
const createdAccount = ref(false);
const creationFailure = ref(false);
const loginFailure = ref(false);
const route = useRoute();
const router = useRouter();
const keycloak = inject('$keycloak')
const waitGuest = ref(false);

const usernameRules = ref([
    value => {
        if (value) return true

        return 'Username is required'
    },
])

const passwordRules = ref([
    value => {
        if (value) return true
        return 'Password is required'
    },
])

onMounted(() => {
    HALO({
        el: vantaRef.value,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        size: 0.50,
        baseColor: 0x1a59,
        backgroundColor: 0x2035b1,
    })
})

const login = () => {
    if (!username.value || !password.value) {
        return
    }
    loginFailure.value = false;
    const formData = new FormData();
    formData.append("username", username.value);
    formData.append("password", password.value);

    API.post('/api/admin/token', formData).then((json) => {
        // Store the token in local storage
        localStorage.setItem('accessToken', json.access_token);
        localStorage.setItem('username', username.value);
        localStorage.setItem('authProvider', 'local');
        // object with path
        const urlParams = route.query;
        const redirect = urlParams.redirect;

        if (redirect) {
            router.push(decodeURIComponent(redirect))
        }
        else {
            const lastRoute = localStorage.getItem('lastRoute') || '/';
            router.push(lastRoute);
        }
    }).catch(() => {
        loginFailure.value = true;
    })
}

const keycloakLogin = () => {
    const baseCallback = `${window.location.origin}/sso-callback`;
    try { sessionStorage.setItem('kc-login-initiated', '1'); } catch (e) { console.debug('flag set failed', e); }
    try {
        const rawRedirect = route.query.redirect ? decodeURIComponent(route.query.redirect) : (localStorage.getItem('lastRoute') || '/');
        const safeRedirect = (!rawRedirect || rawRedirect.startsWith('/login')) ? '/' : rawRedirect;
        sessionStorage.setItem('kc-redirect', safeRedirect);
        const params = new URLSearchParams();
        if (safeRedirect) params.set('redirect', encodeURIComponent(safeRedirect));
        const effectiveRedirect = params.toString() ? `${baseCallback}?${params.toString()}` : baseCallback;
        keycloak.login({
            prompt: 'login',
            redirectUri: effectiveRedirect
        });
    } catch (e) {
        console.error('Keycloak login failed', e);
    }
}

const signup = () => {
    if (!username.value || !password.value) {
        return
    }
    // show dialog for creation of user
    createdAccount.value = false;
    creationFailure.value = false;
    loginFailure.value = false;
    showSignupDialog.value = true;

    const formData = new FormData();
    formData.append("username", username.value);
    formData.append("password", password.value);

    // For creating a superuser
    let is_superuser = false;
    if (username.value.startsWith("admin_")) {
        is_superuser = true;
    }

    formData.append("is_superuser", is_superuser);

    API.post('/api/user/register', formData, true).then(() => {
        createdAccount.value = true;
        login()
    }).catch(() => {
        creationFailure.value = true;
    })
}

const guestAccountSignup = () => {
    waitGuest.value = true;
    setTimeout(function () {
        waitGuest.value = false;
    }, 2000);
    const randomId = Math.random().toString(36).substring(2, 8);
    const guestUsername = 'guest_' + randomId;
    const guestPassword = randomId;

    const formData = new FormData();
    formData.append('username', guestUsername);
    formData.append('password', guestPassword);

    API.post('/api/user/register', formData, true).then(() => {
        username.value = guestUsername;
        password.value = guestPassword;
        login();
    }).catch(() => {
        creationFailure.value = true;
    })
}

const closeSignup = () => {
    showSignupDialog.value = false;
}

</script>

<style lang="scss"></style>