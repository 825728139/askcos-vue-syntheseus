<template>
  <v-container id="settings">
    <v-row>
      <v-col cols="12" class="text-center pa-0">
        <div>Target: {{ targetSmiles }}</div>
      </v-col>
      <v-col cols="12" align="center" justify="center" class="pa-0">
        <copy-tooltip :data="targetSmiles">
          <smiles-image v-if="targetSmiles" :smiles="targetSmiles" max-width="300px" />
        </copy-tooltip>
      </v-col>
    </v-row>
    <v-row>
      <v-table col="12" class="p-2">
        <template v-slot:default>
          <tbody>
            <tr v-if="settings.template_set">
              <th>Template set:</th>
              <td>Name: {{ settings.template_set }}</td>
              <td>Version: {{ settings.template_prioritizer_version || 'N/A' }}</td>
            </tr>
            <template v-else-if="settings.template_prioritizers">
              <tr v-for="(tp, index) in settings.template_prioritizers" :key="index">
                <th v-if="index === 0">Template prioritizers:</th>
                <th v-else></th>
                <td>Template set: {{ tp.template_set }}</td>
                <td>Version: {{ tp.version || 'N/A' }}</td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="(option, index) in settings.expand_one_options['retro_backend_options']" :key="index">
                <th v-if="index === 0">Retro options:</th>
                <th v-else></th>
                <td>Backend: {{ option.retro_backend }}</td>
                <td>Model Name: {{ option.retro_model_name }}</td>
              </tr>
            </template>
            <tr>
              <th>Tree builder version:</th>
              <td>{{ tbVersion === 2 ? "MCTS" : "Retro Star" }}</td>
              <td></td>
            </tr>
            <tr>
              <th>Expansion settings:</th>
              <td>Max. depth: {{ settings.build_tree_options.max_depth }}</td>
              <td>Max. branching factor: {{ settings.build_tree_options.max_branching }}</td>
            </tr>
            <tr>
              <th></th>
              <td>Num. templates: {{ settings.expand_one_options.retro_backend_options[0].max_num_templates }}</td>
              <td>Max cum. prob: {{ settings.expand_one_options.retro_backend_options[0].max_cum_prob }}</td>
            </tr>
            <tr>
              <th></th>
              <td>Expansion time (s): {{ settings.build_tree_options.expansion_time }}</td>
              <td>Max iterations: {{ settings.build_tree_options.max_iterations || "N/A" }}</td>
            </tr>
            <tr>
              <th></th>
              <td>Max chemicals: {{ settings.build_tree_options.max_chemicals || "N/A" }}</td>
              <td>Max reactions: {{ settings.build_tree_options.max_reactions || "N/A" }}</td>
            </tr>
            <template v-if="!!settings.build_tree_options.buyable_logic">
              <tr>
                <th>Stop criteria for Buyables ({{ settings.build_tree_options.buyable_logic.toUpperCase() }})</th>
                <td colspan=2>Chemical found in buyables database</td>
              </tr>
            </template>
            <template v-if="!!settings.build_tree_options.chemical_popularity_logic">
              <tr>
                <th>Stop criteria for Chemical Popularity
                  ({{ settings.build_tree_options.chemical_popularity_logic.toUpperCase() }})</th>
                <td colspan=2>
                  Min. popularity: <br />
                  <span v-if="!!settings.build_tree_options.min_chempop_reactants">
                    occurrences as reactant &geq; {{ settings.build_tree_options.min_chempop_reactants }};
                  </span>
                  <span v-if="!!settings.build_tree_options.min_chempop_products">
                    occurrences as product &geq; {{ settings.build_tree_options.min_chempop_products }};
                  </span>
                </td>
              </tr>
            </template>
            <template v-if="!!settings.build_tree_options.chemical_property_logic">
              <tr>
                <th>Stop criteria for Chemical Property
                  ({{ settings.build_tree_options.chemical_property_logic.toUpperCase() }})</th>
                <td colspan=2>
                  Max. element counts: <br />
                  <span v-if="!!settings.build_tree_options.max_chemprop_c">C &leq; {{
          settings.build_tree_options.max_chemprop_c }};</span>
                  <span v-if="!!settings.build_tree_options.max_chemprop_n">N &leq; {{
          settings.build_tree_options.max_chemprop_n }};</span>
                  <span v-if="!!settings.build_tree_options.max_chemprop_h">H &leq; {{
          settings.build_tree_options.max_chemprop_h }};</span>
                  <span v-if="!!settings.build_tree_options.max_chemprop_o">O &leq; {{
          settings.build_tree_options.max_chemprop_o }};</span>
                </td>
              </tr>
            </template>
            <template v-if="!!settings.build_tree_options.max_ppg_logic">
              <tr>
                <th>Stop criteria for Max PPG ({{ settings.build_tree_options.max_ppg_logic.toUpperCase() }})</th>
                <td colspan=2> Max. chemical price ($/g):
                  <span v-if="!!settings.build_tree_options.max_ppg"> {{ settings.build_tree_options.max_ppg }}</span>
                </td>
              </tr>
            </template>
            <template v-if="!!settings.build_tree_options.max_scscore_logic">
              <tr>
                <th>Stop criteria for Max SCScore ({{ settings.build_tree_options.max_scscore_logic.toUpperCase() }})
                </th>
                <td colspan=2> Max. SCScore:
                  <span v-if="!!settings.build_tree_options.max_scscore"> {{ settings.build_tree_options.max_scscore
                    }}</span>
                </td>
              </tr>
            </template>
            <tr>
              <th>Evaluation settings:</th>
              <td>Min. plausibility: {{ settings.expand_one_options['filter_threshold'] }}</td>
              <td></td>
            </tr>
            <tr>
              <th>Buyables source(s):</th>
              <td>{{ buyablesSources }}</td>
              <td></td>
            </tr>
            <tr v-if="!!settings.expand_one_options['banned_chemicals']">
              <th>Banned chemicals(s):</th>
              <td>{{ settings.expand_one_options['banned_chemicals'].length }}</td>
              <td></td>
            </tr>
            <tr v-if="!!settings.expand_one_options['banned_reactions']">
              <th>Banned reactions:</th>
              <td>{{ settings.expand_one_options['banned_reactions'].length }}</td>
              <td></td>
            </tr>
          </tbody>
        </template>
      </v-table>
    </v-row>
  </v-container>
</template>

<script>
import CopyTooltip from "@/components/CopyTooltip";
import SmilesImage from "@/components/SmilesImage";
import { sourceQueryToArgs, sourceArgsToDisplay } from "@/common/buyables";

export default {
  name: 'TbSettingsTable',
  components: {
    CopyTooltip,
    SmilesImage,
  },
  props: {
    id: {
      type: String,
      default: 'settings-table'
    },
    settings: {
      type: Object,
      default: () => ({}),
    },
    targetSmiles: {
      type: String,
      default: ''
    },
    tbVersion: {
      type: [String, Number],
      default: 2
    }
  },
  computed: {
    buyablesSources() {
      if (this.settings['buyables_source']) {
        return sourceArgsToDisplay(sourceQueryToArgs(this.settings.buyables_source))
      } else {
        return 'All'
      }
    },
  },
}
</script>
