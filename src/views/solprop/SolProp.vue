<template>
    <v-container fluid style="min-height: calc(100vh-50px)">
        <v-row class="justify-center">
            <v-col cols="12" md="12" xl="10">
                <v-sheet elevation="2">
                    <v-tabs v-model="tab" color="primary" align-tabs="center" grow class="mb-4">
                        <v-tab @click="replaceRoute('solpred')" value="solpred">Solubility Prediction</v-tab>
                        <v-tab @click="replaceRoute('solscreen')" value="solscreen">Solvent Screening</v-tab>
                    </v-tabs>
                </v-sheet>
                <v-window v-model="tab" class="elevation-0">
                    <v-window-item value="solpred">
                        <SolubilityPredict />
                    </v-window-item>
                    <v-window-item value="solscreen">
                        <SolventScreen />
                    </v-window-item>
                </v-window>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SolubilityPredict from "@/views/solprop/tabs/SolubilityPredictView";
import SolventScreen from "@/views/solprop/tabs/SolventScreenView";

export default {
    name: 'SolProp',
    components: {
        SolubilityPredict,
        SolventScreen,
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const tab = ref("solpred");

        const replaceRoute = (tab) => {
            router.replace({ path: '/solprop', query: { tab } })
        }

        onMounted(() => {
            let urlParams = route.query;
            let urlTab = urlParams.tab;
            if (urlTab !== null) {
                tab.value = urlTab;
            }
        });

        watch(route, async (newRoute, _oldRoute) => {
            if (newRoute.path === '/solprop') {
                tab.value = newRoute.query.tab
            }
        })

        return {
            replaceRoute,
            tab,
        };
    },
}
</script>