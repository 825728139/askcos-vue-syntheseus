import { useFastapiStore } from "@/store/fastapi";

const API = {
  pollInterval: 1000,
  pollIntervalLong: 2000,

  getHeaders(data) {
    const headers = {};
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (data && !(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  },

  async fetchHandler(response) {
    if (response.ok) {
      try {
        return await response.json();
      } catch {
        return response.statusText;
      }
    }
    try {
      const json = await response.json();
      throw new Error(JSON.stringify(json));
    } catch (error) {
      throw new Error(response.statusText);
    }
  },

  async request(method, endpoint, data, query = false) {
    const fastapiStore = useFastapiStore();
    const url = query ? `${endpoint}?${new URLSearchParams(data)}` : endpoint;
    const options = {
      method,
      headers: this.getHeaders(data),
      credentials: "include",
    };

    if (method !== "GET" && method !== "DELETE" && !query) {
      options.body = data instanceof FormData ? data : JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const json = await this.fetchHandler(response);

    fastapiStore.logs.unshift({
      endpoint,
      method,
      request: JSON.stringify(data),
      response: json,
    });

    return json;
  },

  get: (endpoint, params, query = true) =>
    API.request("GET", endpoint, params, query),
  post: (endpoint, data, query) => API.request("POST", endpoint, data, query),
  put: (endpoint, data) => API.request("PUT", endpoint, data),
  delete: (endpoint, data, query) =>
    API.request("DELETE", endpoint, data, query),

  async runCeleryTask(endpoint, data, progress) {
    const json = await this.post(endpoint, data);
    return this.pollCeleryResult(json.task_id || json, progress);
  },

  pollCeleryResult(taskId, progress) {
    return new Promise((resolve, reject) => {
      const check = () => {
        this.get(`/api/legacy/celery/task/${taskId}/`, null, false)
          .then((json) => {
            if (json.complete) return resolve(json.output);
            if (json.failed) return reject(new Error("Celery task failed."));
            if (progress) progress(json);
            setTimeout(check, this.pollInterval);
          })
          .catch((error) => {
            if (
              error instanceof TypeError &&
              error.message === "Failed to fetch"
            ) {
              console.error(
                "Unable to fetch celery results due to connection error. Will keep trying."
              );
              setTimeout(check, this.pollIntervalLong);
            } else {
              reject(error);
            }
          });
      };
      check();
    });
  },
};

export { API };
