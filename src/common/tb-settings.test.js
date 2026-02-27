/* eslint-disable no-undef */
import {
  tbSettingsJsToApi,
  tbSettingsPyToApi,
  tbSettingsPyToJs,
} from "@/common/tb-settings";

const pySettings = {
  smiles: "N#Cc1c(-c2cccc(Br)c2)cc(-c2ccc(N3CCOCC3)nc2)nc1N",
  version: 1,
  max_depth: 4,
  max_branching: 20,
  expansion_time: 30,
  template_count: 100,
  max_chemicals: null,
  max_reactions: null,
  max_iterations: null,
  max_cum_template_prob: 0.995,
  max_ppg: null,
  max_scscore: null,
  max_elements: null,
  min_history: null,
  termination_logic: { and: ["buyable"], or: [] },
  filter_threshold: 0.75,
  template_set: "reaxys",
  template_prioritizer_version: 1,
  buyables_source: null,
  known_bad_reactions: [],
  forbidden_molecules: [],
  return_first: false,
  max_trees: 500,
  score_trees: true,
  cluster_trees: true,
  cluster_method: "hdbscan",
  cluster_min_samples: 5,
  cluster_min_size: 5,
  json_format: "treedata",
};

const jsSettings = {
  quick: "normal",
  version: 1,
  maxDepth: 5,
  maxBranching: 20,
  expansionTime: 60,
  maxChemicals: null,
  maxReactions: null,
  maxIterations: null,
  maxTemplates: null,
  buyableLogic: "and",
  maxPPGLogic: "none",
  maxPPG: 100,
  maxScscoreLogic: "none",
  maxScscore: 0,
  chemicalPropertyLogic: "none",
  chemicalPropertyC: 0,
  chemicalPropertyN: 0,
  chemicalPropertyO: 0,
  chemicalPropertyH: 0,
  chemicalPopularityLogic: "none",
  chemicalPopularityReactants: 0,
  chemicalPopularityProducts: 0,
  buyablesSource: [],
  buyablesSourceAll: true,
  returnFirst: false,
  maxTrees: 500,
  templatePrioritizers: [
    { template_set: "reaxys", version: 1, attribute_filter: [] },
  ],
  precursorScoring: "RelevanceHeuristic",
  atomMapper: "RXNMapper",
  numTemplates: 1000,
  maxCumProb: 0.999,
  minPlausibility: 0.1,
  allowSelec: true,
  clusterTrees: true,
  clusterMethod: "hdbscan",
  clusterMinSamples: 5,
  clusterMinSize: 5,
  classifyReactions: false,
  redirectToGraph: false,
};

test("can convert py settings to api", () => {
  const result = tbSettingsPyToApi(pySettings);
  // Check output size
  expect(Object.keys(result).length).toBe(21);
  // Check keys
  const expectedKeys = [
    "smiles",
    "version",
    "max_depth",
    "max_branching",
    "expansion_time",
    "template_count",
    "filter_threshold",
    "template_set",
    "template_prioritizer_version",
    "return_first",
    "max_trees",
    "score_trees",
    "cluster_trees",
    "cluster_method",
    "cluster_min_samples",
    "cluster_min_size",
    "json_format",
    "buyable_logic",
    "max_cum_prob",
    "banned_reactions",
    "banned_chemicals",
  ];
  expect(Object.keys(result)).toStrictEqual(expectedKeys);
});

test("can convert py settings to js", () => {
  const result = tbSettingsPyToJs(pySettings);
  // Check output size
  expect(Object.keys(result).length).toBe(17);
  // Check keys
  const expectedKeys = [
    "version",
    "maxDepth",
    "maxBranching",
    "expansionTime",
    "numTemplates",
    "minPlausibility",
    "returnFirst",
    "maxTrees",
    "clusterTrees",
    "clusterMethod",
    "clusterMinSamples",
    "clusterMinSize",
    "buyableLogic",
    "maxCumProb",
    "templatePrioritizers",
    "buyablesSourceAll",
    "buyablesSource",
  ];
  expect(Object.keys(result)).toStrictEqual(expectedKeys);
});

test("can convert js settings to api", () => {
  const result = tbSettingsJsToApi(jsSettings);
  // Check output size
  expect(Object.keys(result).length).toBe(34);
  // Check keys
  const expectedKeys = [
    "version",
    "max_depth",
    "max_branching",
    "expansion_time",
    "max_chemicals",
    "max_reactions",
    "max_iterations",
    "max_templates",
    "buyable_logic",
    "max_ppg_logic",
    "max_ppg",
    "max_scscore_logic",
    "max_scscore",
    "chemical_property_logic",
    "max_chemprop_c",
    "max_chemprop_n",
    "max_chemprop_o",
    "max_chemprop_h",
    "chemical_popularity_logic",
    "min_chempop_reactants",
    "min_chempop_products",
    "return_first",
    "max_trees",
    "template_count",
    "max_cum_prob",
    "filter_threshold",
    "cluster_trees",
    "cluster_method",
    "cluster_min_samples",
    "cluster_min_size",
    "classify_reactions",
    "template_prioritizers",
    "store_results",
    "json_format",
  ];
  expect(Object.keys(result)).toStrictEqual(expectedKeys);
});
