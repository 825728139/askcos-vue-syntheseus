<template>
  <v-container fluid style="min-height: calc(100vh-50px)">
    <v-row class="justify-center">
      <v-col cols="12" md="12" xl="12">
        <v-sheet elevation="2">
          <v-tabs v-model="tab" color="primary" align-tabs="center" grow class="mb-4">
            <v-tab @click="replaceRoute('IPP')" value="IPP">Interactive Path Planner</v-tab>
            <v-tab @click="replaceRoute('RP')" value="RP">One-step Retrosynthesis</v-tab>
            <v-tab @click="replaceRoute('TE')" value="TE" :disabled="!treeViewVisible">Tree Explorer</v-tab>
          </v-tabs>
        </v-sheet>
        <v-window v-model="tab" :class="tab === 'IPP' ? 'elevation-2 rounded-lg' : 'elevation-0'" :touch="false">
          <v-window-item value="IPP">
            <NetworkView :tab-active="tab === 'IPP'" @update:treeViewVisible="($event) => treeViewVisible = $event"
              ref="network" />
          </v-window-item>
          <v-window-item value="RP">
            <RetroView />
          </v-window-item>
          <v-window-item value="TE" eager>
            <TreeView ref="treeDetail" :tab-active="tab === 'TE'" @switch-tab="$event => tab = $event" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import NetworkView from "@/views/network/tabs/NetworkView";
import RetroView from "@/views/network/tabs/RetroView";
import TreeView from "@/views/network/tabs/TreeView";
import { useResultsStore } from "@/store/results";
import { useConfirm } from 'vuetify-use-dialog';

export default {
  name: "Network",
  components: {
    NetworkView,
    RetroView,
    TreeView
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const resultsStore = useResultsStore();
    const network = ref(null);
    const treeDetail = ref(null);
    const treeViewVisible = ref(false);
    const tab = ref("IPP");
    const createConfirm = useConfirm();


    const replaceRoute = (tab) => {
      const newPath = { path: '/network', query: { tab: tab, id: route.query.id } }
      router.replace(newPath)
    }

    const loadResultFromURL = async (payload) => {
      await resultsStore.loadResult(payload)
    };

    onMounted(() => {
      treeViewVisible.value = false;
      let urlParams = route.query;
      let urlTab = urlParams.tab;
      if (urlTab) {
        tab.value = urlTab;
      }

      let resultId = urlParams.id;
      if (resultId) {
        treeViewVisible.value = true;
      }
      let numTrees = urlParams.view;
      if (resultId) {
        loadResultFromURL({ resultId: resultId, numTrees: numTrees }).then(
          () => {
            init(tab.value);
          }
        ).catch((e) => {
          createConfirm({ title: "Result load failed", content: e, dialogProps: { width: "auto" } })
        })
      }
    });

    const init = (tab) => {
      if (tab === "IPP" && network.value) {
        network.value.init();
      } else if (tab === "TE" && treeDetail.value) {
        treeDetail.value.init();
      }
    };

    watch(route, async (newRoute, _oldRoute) => {
      if (newRoute.path === '/network') {
        tab.value = newRoute.query.tab
      }
    })


    return {
      replaceRoute,
      treeViewVisible,
      network,
      treeDetail,
      tab,
    };
  },
};
</script>
