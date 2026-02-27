<template>
  <v-container fluid>
    <bread-crumbs pageTitle="Drawing" />
    <drawing-toolbar v-model:smiles="smiles" />
    <drawing-result v-model:smiles="smiles" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import DrawingToolbar from "@/components/drawing/DrawingToolbar"
import DrawingResult from "@/components/drawing/DrawingResult"
import BreadCrumbs from "@/components/BreadCrumbs"

const smiles = ref('')
</script>