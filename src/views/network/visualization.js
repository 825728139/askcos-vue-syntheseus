import { getMolImageUrl } from "@/common/drawing";
import { num2str } from "@/common/utils";
import { ref } from 'vue'
export const isDark = ref(false)

// Constants
const COLORS = {
  TARGET: "#1965B0",
  BUYABLE: "#FFEB3B",
  REACTANT_PRODUCT: "#4EB265",
  REACTANT_PRODUCT_NOT_BUYABLE: "#E8601C",
  DEFAULT: "#DC050C",
};

const NODE_TYPES = {
  CHEMICAL: "chemical",
  REACTION: "reaction",
};

const edgeScaling = (min, max, total, value) =>
  value >= 0.25 ? 1.0 : 16 * value * value;

const getNodeColor = (data, target) => {
  if (data.id === target) return COLORS.TARGET;
  if (data.ppg > 0)
    return data.asReactant || data.asProduct
      ? COLORS.REACTANT_PRODUCT
      : COLORS.BUYABLE;
  return data.asReactant || data.asProduct
    ? COLORS.REACTANT_PRODUCT_NOT_BUYABLE
    : COLORS.DEFAULT;
};

// Helper function to create HTML element
const createHTMLElement = (tag, innerHTML) => {
  const el = document.createElement(tag);
  el.innerHTML = innerHTML;
  return el;
};

const makeNodeTitleEl = (node) => {
  let innerHTML = node.id;
  if ("asReactant" in node)
    innerHTML += `<br>${node.asReactant} precedents as reactant`;
  if ("asProduct" in node)
    innerHTML += `<br>${node.asProduct} precedents as product`;
  if ("ppg" in node)
    innerHTML += `<br>${node.ppg > 0 ? `$${node.ppg}/g` : "not buyable"}`;
  return createHTMLElement("div", innerHTML);
};

const makeChemicalDisplayNode = ({
  id,
  data,
  target,
  align = false,
  scale = true,
}) => ({
  id,
  smiles: data.id,
  borderWidth: data.id === target ? 3 : 2,
  color: { border: getNodeColor(data, target) },
  shape: "image",
  image: getMolImageUrl(
    data,
    false,
    true,
    align ? target : undefined,
    true,
    scale ? 80 : undefined
  ),
  title: makeNodeTitleEl(data),
  type: NODE_TYPES.CHEMICAL,
});

const makeReactionDisplayNode = ({ id, data, detail = false }) => {
  const node = {
    id,
    smiles: data.id,
    font: { align: "center" },
    type: NODE_TYPES.REACTION,
  };

  if (detail) {
    const scoreType =
      data.forwardScore !== undefined && data.forwardScore !== null
        ? "Forward"
        : "FF";
    node.label = `${data.modelMetadata.length} model(s) predicted
${scoreType} score: ${num2str(
      scoreType === "Forward" ? data.forwardScore : data.ffScore
    )}
Precursor score: ${num2str(data.retroScore)}`;
  } else {
    node.label = `#${data.rank}`;
  }

  if ("outcomes" in data) {
    Object.assign(node, {
      borderWidth: 2,
      color: { border: COLORS.DEFAULT },
      title: "Selectivity warning! Select this node to see more details",
    });
  } else if ("selecError" in data) {
    node.borderWidth = 2;
    node.color = { border: "#F6C141" };
  }

  return node;
};

const makeDisplayEdge = ({ id, from, to, value }) => {
  const edge = {
    id,
    from,
    to,
    color: { color: isDark.value ? "white" : "black", inherit: false },
  };

  if (value !== undefined) {
    edge.value = value;
    edge.scaling = {
      min: 1,
      max: 5,
      customScalingFunction: edgeScaling,
    };
  }

  return edge;
};

export { makeChemicalDisplayNode, makeReactionDisplayNode, makeDisplayEdge };
