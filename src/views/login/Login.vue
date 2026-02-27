<template>
    <div>
        <div ref="vantaRef" style="height: 100vh" class="d-flex justify-center align-center overflow-auto">
            <v-container fluid>
                <v-row class="d-flex justify-space-between align-center px-16">
                    <v-col cols="12" md="6" lg="5" class="d-flex justify-center align-center flex-column">
                        <div>
                            <h1 class="text-h1 font-weight-bold text-white">ASKCOS</h1>
                            <h6 class="text-h6 font-weight-bold text-white">
                                Computer-aided Design Tools for Organic Synthesis
                            </h6>
                        </div>
                    </v-col>
                    <v-col cols="12" md="6" lg="4" xl="3" class="d-flex justify-center align-center">
                        <v-sheet elevation="10" rounded="lg">
                            <v-form ref="form" class="pa-5" @submit.prevent>
                                <v-text-field label="Username" variant="outlined" v-model="username"
                                    :rules="usernameRules" clearable data-cy="username"
                                    v-show="!showNextStep"></v-text-field>
                                <v-text-field :label="emailRequired ? 'Email (Required)' : 'Email (Optional)'"
                                    variant="outlined" v-model="email" clearable data-cy="email" v-show="showNextStep"
                                    :rules="emailRequired ? emailRules : []"></v-text-field>
                                <v-text-field label="Password" variant="outlined" required
                                    :type="showPassword ? 'text' : 'password'" v-model="password" :rules="passwordRules"
                                    clearable data-cy="password" v-show="!showNextStep"
                                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                    @click:append-inner="showPassword = !showPassword"></v-text-field>
                                <v-text-field label="Company (Optional)" variant="outlined" v-model="company" clearable
                                    data-cy="company" v-show="showNextStep"></v-text-field>
                                <div v-if="loginFailure" class="text-red text-center text-subtitle-1"
                                    v-show="!showNextStep">
                                    <p>Either username or password is incorrect</p>
                                </div>
                                <div class="d-flex flex-column">
                                    <v-container>
                                        <v-row wrap no-gutters v-show="!showNextStep">
                                            <v-col cols="6" class="text-center">
                                                <v-btn color="primary" size="x-large" @click="login" type="submit"
                                                    variant="flat" data-cy="login">
                                                    Log In
                                                </v-btn>
                                            </v-col>
                                            <v-col cols="6" class="text-center">
                                                <v-btn color="primary" size="x-large" @click="showNextSignup"
                                                    type="submit" variant="flat" data-cy="signup">
                                                    Sign Up
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                        <v-row wrap no-gutters v-show="showNextStep">
                                            <v-col cols="6" class="text-center">
                                                <v-btn color="primary" size="x-large" @click="showNextStep = false"
                                                    type="submit" variant="flat" data-cy="signup">
                                                    Back
                                                </v-btn>
                                            </v-col>
                                            <v-col cols="6" class="text-center">
                                                <v-btn color="primary" size="x-large" @click="signup" type="submit"
                                                    variant="flat" data-cy="signup">
                                                    Finish
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                    <v-divider class="my-4"> </v-divider>
                                    <v-btn color="amber" size="x-large" block variant="tonal"
                                        @click="testLogin" data-cy="testLogin">
                                        测试账户登录 (123)
                                    </v-btn>
                                    <v-divider class="my-4"> </v-divider>
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
                    <v-divider class="mb-4"></v-divider>
                    <div class="text-end">
                        <v-btn class="text-none" color="success" variant="flat" width="90"
                            :disabled="!createdAccount && !creationFailure" @click="closeSignup">
                            Close
                        </v-btn>
                    </div>
                </div>
            </v-sheet>
        </v-dialog>
    </div>
</template>

<script setup>
defineOptions({ name: 'LoginView' })
import * as THREE from "three";
import HALO from "vanta/dist/vanta.halo.min";
import { ref, onMounted, computed } from "vue";
import { API } from "@/common/api";
import { useRoute, useRouter } from "vue-router";
import { useConfigStore } from "@/store/config";
import { useConfirm } from "vuetify-use-dialog";

const vantaRef = ref(null);
const username = ref(null);
const password = ref(null);
const email = ref(null);
const company = ref(null);
const showSignupDialog = ref(false);
const createdAccount = ref(false);
const creationFailure = ref(false);
const loginFailure = ref(false);
const showPassword = ref(false);
const route = useRoute();
const router = useRouter();
const waitGuest = ref(false);
const showNextStep = ref(false);
const configStore = useConfigStore();
const createConfirm = useConfirm();
const emailRequired = computed({
    get: () => configStore.envs.VITE_EMAIL_REQUIRED === "True",
});

const emailRules = ref([
    (value) => {
        if (value) return true;
        return "Email is required";
    },
]);

const usernameRules = ref([
    (value) => {
        if (value) return true;
        return "Username is required";
    },
    (value) => {
        if (value.length >= 3 && value.length <= 25) return true;
        return "Username must be at least 3 characters and at most 25 characters";
    },
    (value) => {
        if (/^[a-z][a-z\d]*_?[a-z\d]+$/i.test(value)) return true;
        return "Username must start with a letter. It can only contain letters, numbers, and one underscore";
    },
    // Add SSO login check in the future (No _sso)
]);

const passwordRules = ref([
    (value) => {
        if (value) return true;
        return "Password is required";
    },
]);

onMounted(() => {
    HALO({
        el: vantaRef.value,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        size: 0.5,
        baseColor: 0x1a59,
        backgroundColor: 0x2035b1,
    });
});

const login = () => {
    if (!username.value || !password.value) {
        return;
    }
    loginFailure.value = false;
    const formData = new FormData();
    formData.append("username", username.value);
    formData.append("password", password.value);

    API.post("/api/admin/token", formData)
        .then((json) => {
            // Store the token in local storage
            localStorage.setItem("accessToken", json.access_token);
            localStorage.setItem("username", username.value);
            localStorage.setItem("authProvider", "local");
            // object with path
            const urlParams = route.query;
            const redirect = urlParams.redirect;

            if (redirect) {
                router.push(decodeURIComponent(redirect));
            } else {
                const lastRoute = localStorage.getItem("lastRoute") || "/";
                router.push(lastRoute);
            }
        })
        .catch((error) => {
            if (error.message === "Unauthorized") {
                loginFailure.value = true;
            } else {
                createConfirm({
                    title: "Alert",
                    content: "An internal server error occurred. Please try again later.",
                    dialogProps: { width: "auto", confirmText: "OK", showCancel: false },
                });
            }
        });
};

const signup = () => {
    if (
        !username.value ||
        !password.value ||
        (emailRequired.value && !email.value)
    ) {
        return;
    }

    // showNextStep dialog for creation of user
    createdAccount.value = false;
    creationFailure.value = false;
    loginFailure.value = false;
    showSignupDialog.value = true;

    const formData = new FormData();
    formData.append("username", username.value);
    formData.append("password", password.value);
    if (emailRequired.value && email.value) {
        formData.append("email", email.value);
    }

    API.post("/api/user/register", formData, true)
        .then(() => {
            createdAccount.value = true;
            localStorage.setItem("newAccount", "true");
            login();
        })
        .catch(() => {
            creationFailure.value = true;
        });
};

const showNextSignup = () => {
    if (!username.value || !password.value) {
        return;
    }
    showNextStep.value = true;
};

const guestAccountSignup = () => {
    waitGuest.value = true;
    setTimeout(function () {
        waitGuest.value = false;
    }, 2000);
    const randomIdUserName = Math.random().toString(36).substring(2, 8);
    const randomIdPassword = Math.random().toString(36).substring(2, 8);
    const guestUsername = "guest_" + randomIdUserName;
    const guestPassword = randomIdPassword;

    const formData = new FormData();
    formData.append("username", guestUsername);
    formData.append("password", guestPassword);

    API.post("/api/user/register", formData, true)
        .then(() => {
            username.value = guestUsername;
            password.value = guestPassword;
            localStorage.setItem("guestAccount", "true");
            login();
        })
        .catch(() => {
            creationFailure.value = true;
        });
};

const closeSignup = () => {
    showSignupDialog.value = false;
};

const testLogin = () => {
    // 设置测试账户的认证信息
    localStorage.setItem("accessToken", "test-token-123");
    localStorage.setItem("username", "123");
    localStorage.setItem("authProvider", "test");

    // 获取重定向路径或上次访问路径
    const urlParams = route.query;
    const redirect = urlParams.redirect;

    if (redirect) {
        router.push(decodeURIComponent(redirect));
    } else {
        const lastRoute = localStorage.getItem("lastRoute") || "/";
        router.push(lastRoute);
    }
};
</script>
