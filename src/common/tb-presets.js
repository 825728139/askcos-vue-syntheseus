const TB_PRESETS = {
  shallow: {
    label: "Shallow search",
    info: "30s, fewer templates, high plausibility, less depth/branching",
    settings: {
      expansionTime: 30,
      maxDepth: 4,
      maxBranching: 20,
      numTemplates: 100,
      maxCumProb: 0.995,
      minPlausibility: 0.75,
      returnFirst: false,
    },
  },
  normal: {
    label: "Normal search",
    info: "60s, more templates, medium plausibility, more depth/branching",
    settings: {
      expansionTime: 60,
      maxDepth: 5,
      maxBranching: 20,
      numTemplates: 1000,
      maxCumProb: 0.999,
      minPlausibility: 0.1,
      returnFirst: false,
    },
  },
  deep: {
    label: "Deep search",
    info: "120s, even more templates, low plausibility, even more depth/branching",
    settings: {
      expansionTime: 120,
      maxDepth: 6,
      maxBranching: 25,
      numTemplates: 1000,
      maxCumProb: 0.9999,
      minPlausibility: 0.01,
      returnFirst: false,
    },
  },
  quickest: {
    label: "Shallow - First result",
    info: "Return asap, 30s max, fewer templates, low plausibility, less depth/branching",
    settings: {
      expansionTime: 30,
      maxDepth: 4,
      maxBranching: 20,
      numTemplates: 100,
      maxCumProb: 0.995,
      minPlausibility: 0.01,
      returnFirst: true,
    },
  },
  struggling: {
    label: "Deep - First result",
    info: "Return asap, 180s max, even more templates, very low plausibility, even more depth/branching, buyability or popularity",
    settings: {
      expansionTime: 180,
      maxDepth: 8,
      maxBranching: 25,
      numTemplates: 1000,
      maxCumProb: 0.9999,
      minPlausibility: 0.0001,
      chemicalPopularityLogic: "or",
      chemicalPopularityReactants: 5,
      chemicalPopularityProducts: 5,
      returnFirst: true,
    },
  },
};

export { TB_PRESETS };
