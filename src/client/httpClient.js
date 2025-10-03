import axios from "axios";
import { getConfig } from "../config/index.js";

const cfg = getConfig();

export const http = axios.create({
  baseURL: cfg.baseUrl,
  timeout: cfg.timeout,
});

http.interceptors.request.use((config) => {
  if (cfg.defaultHeaders) {
    config.headers = { ...cfg.defaultHeaders, ...config.headers };
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      // Basic debug logging – could be improved with a logger later
      // eslint-disable-next-line no-console
      console.error("HTTP Error", {
        status: err.response.status,
        url: err.config?.url,
        method: err.config?.method,
        data: err.response.data,
      });
    }
    return Promise.reject(err);
  },
);
