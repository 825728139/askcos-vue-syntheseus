export const commands = {
  home: {
    name: "Home",
    path: "/",
    params: ["smiles"],
  },
  status: {
    name: "Server Status",
    path: "/status",
  },
  ipp: {
    name: "Interactive Path Planner",
    path: "/network",
    tab: "IPP",
    params: ["smiles"],
  },
  retro: {
    name: "One-step Retrosynthesis",
    path: "/network",
    tab: "RP",
    params: ["smiles"],
  },
};
