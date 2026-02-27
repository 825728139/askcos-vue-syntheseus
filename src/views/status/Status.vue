<template>
  <v-container fluid>
    <bread-crumbs pageTitle="Server Status" />
    <v-row class="justify-center my-0">
      <v-col cols="12" md="12" xl="10">
        <CeleryStatus />
      </v-col>
    </v-row>
    <v-row class="justify-center my-0">
      <v-col cols="12" md="12" xl="10">
        <DatabaseStatus />
      </v-col>
    </v-row>
    <v-row class="justify-center my-0">
      <v-col cols="12" md="12" xl="10">
        <ModelStatus />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import CeleryStatus from "@/views/status/components/CeleryStatus.vue";
import ModelStatus from "@/views/status/components/ModelStatus.vue";
import DatabaseStatus from "@/views/status/components/DatabaseStatus.vue";
import BreadCrumbs from "@/components/BreadCrumbs.vue"
</script>
