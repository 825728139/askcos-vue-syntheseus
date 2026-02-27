import { defineStore } from "pinia";

export const useFastapiStore = defineStore("fastapi", {
  state: () => ({
    logs: [],
  }),
  actions: {
    addLogs({ endpoint, method, request, response }) {
      this.logs.push({ endpoint, method, request, response });
    },
    clearLogs() {
      this.logs = []; // Clears all logs
    },
  },
});
