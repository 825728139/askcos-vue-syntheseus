<template>
    <v-row class="justify-center">
        <v-col cols="12" md="10" class="d-flex justify-center text-center">
            <v-empty-state title="Page not found" text="This page didn't bond with any of our known pages"
                :image="pageNotFoundSrc">
                <template v-slot:actions>
                    <v-btn variant="tonal" to="/">Take me home</v-btn>
                </template>
            </v-empty-state>
        </v-col>
    </v-row>
</template>

<script setup>
import { ref } from 'vue'
import pageNotFound from "@/assets/pageNotFound.svg";

const pageNotFoundSrc = ref(pageNotFound)
</script>