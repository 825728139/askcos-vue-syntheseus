<template>
    <v-sheet elevation="2" rounded="lg" width="100%" class="mb-6 pa-6">
        <search-sheet-toolbar />
        <search-sheet-header />
        <launch-pad />
    </v-sheet>
</template>

<script setup>
import LaunchPad from "@/components/home/Launchpad";
import SearchSheetToolbar from "@/components/home/SearchSheetToolbar"
import SearchSheetHeader from "@/components/home/SearchSheetHeader"
</script>