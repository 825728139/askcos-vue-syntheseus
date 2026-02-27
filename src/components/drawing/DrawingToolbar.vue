<template>
  <v-row class="justify-center">
    <v-col cols="12" md="12" xl="10">
      <v-sheet elevation="2" rounded="lg" class="pa-5">
        <v-row class="justify-center" density="compact">
          <v-col cols="12" md="10" my="10">
            <v-text-field v-model="smiles" class="centered-input" variant="outlined" data-cy="draw-enter-smiles"
              label="Enter a molecule or reaction SMILES" prepend-inner-icon="mdi mdi-flask" placeholder="SMILES"
              hide-details clearable @click:clear="smiles = ''" rounded="pill">
              <template v-slot:append>
                <v-btn variant="flat" data-cy="draw-canonicalize-btn" color="primary" prepend-icon="mdi mdi-web"
                  size="large" @click="canonicalize(smiles)" rounded="pill">Canonicalize</v-btn>
              </template>
              <template v-slot:append-inner>
                <draw-button v-model:smiles="smiles" />
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-sheet>
    </v-col>
  </v-row>

</template>

<script setup>
import { API } from "@/common/api";
import DrawButton from "@/components/DrawButton"
const smiles = defineModel("smiles", { required: true, default: '' })

const canonicalize = () => {
  API.post("/api/rdkit/canonicalize/", { smiles: smiles.value })
    .then((json) => {
      smiles.value = json.smiles;
    })
    .catch((error) => {
      console.error("Could not canonicalize: " + error);
    });
};
</script>