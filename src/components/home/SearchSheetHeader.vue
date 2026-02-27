<template>
    <v-row class="justify-center align-center pa-0 ma-0">
        <v-col cols="12" class="d-flex justify-center align-center text-center pa-0">
            <v-chip border="thin opacity-25" color="surface" variant="flat">
                <span><v-icon icon="mdi-creation" class="text-blue-darken-3"></v-icon> Announcing all new ASKCOSv2.
                    Click <a class="d-inline-block mx-1 text-decoration-none text-primary"
                        href="https://askcos-docs.mit.edu/" target="_blank">here</a> to learn
                    more.</span>
            </v-chip>
        </v-col>
    </v-row>
    <v-row class="justify-center align-center pa-0 ma-0">
        <v-col cols="12" class="d-flex justify-center align-center text-center pa-0">
            <h2 class="text-h2 header font-weight-medium text-center">
                <strong>Explore ASKCOS</strong>
            </h2>
        </v-col>
    </v-row>
    <v-row class="justify-center align-center pa-0 ma-0">
        <v-col cols="12" class="d-flex justify-center align-center">
            <div class="text-body-1 text-medium-emphasis">
                Enter a molecule or reaction SMILES to explore available tasks
            </div>
        </v-col>
    </v-row>
</template>

<script setup>
import { useTheme } from "@/composables/useTheme";
import { computed } from "vue";
const { isDark } = useTheme();

const headerColor = computed(() => {
    return isDark.value ? 'linear-gradient(to right, #ffffff 20%, #80bfff 30%, #4fa7ff 70%, #ffffff 80%)' : 'linear-gradient(to right, #65676b 20%, #006bd6 30%, #0080ff 70%, #8a8e94 80%)';
});
</script>

<style scoped>
.header {
    background: v-bind(headerColor);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-emphasis-color: transparent;
    background-size: 500% auto;
    animation: paint 5s ease-in-out infinite alternate;
}

@keyframes paint {
    0% {
        background-position: 0% 50%;
    }

    100% {
        background-position: 100% 50%;
    }
}
</style>