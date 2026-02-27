import { API } from "@/common/api";

const NO_SOURCE = "none";
const NO_SOURCE_QUERY = [null, ""];
const NO_SOURCE_TEXT = "No Source";

const sourceQueryToArgs = (sources) => {
  const filteredSources = sources.filter(
    (source) => !NO_SOURCE_QUERY.includes(source)
  );
  return filteredSources.length !== sources.length
    ? [...filteredSources, NO_SOURCE]
    : sources;
};

const sourceArgsToDisplay = (sources) =>
  sources
    .map((source) => (source === NO_SOURCE ? NO_SOURCE_TEXT : source))
    .join(", ");

const processSources = (sources) =>
  sourceQueryToArgs(typeof sources === "string" ? sources.split(",") : sources);

const getBuyables = (smiles, sources, regex, returnLimit, tanSim) => {
  const params = new URLSearchParams();
  if (smiles) params.append("q", smiles);
  if (sources)
    processSources(sources).forEach((source) =>
      params.append("source", source)
    );
  if (regex) params.append("regex", regex);
  if (returnLimit) params.append("returnLimit", returnLimit);
  if (tanSim) params.append("sim_threshold", tanSim);

  return API.get("/api/buyables/list-buyables", params);
};

const lookupBuyables = (smiles, sources, canonicalize) => {
  const body = { smiles };
  if (sources) body.source = processSources(sources);
  if (canonicalize) body.canonicalize = canonicalize;
  return API.post("/api/buyables/lookup", body);
};

export {
  NO_SOURCE,
  NO_SOURCE_QUERY,
  NO_SOURCE_TEXT,
  getBuyables,
  lookupBuyables,
  sourceQueryToArgs,
  sourceArgsToDisplay,
};
