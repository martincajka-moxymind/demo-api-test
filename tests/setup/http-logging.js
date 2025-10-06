// Test-only HTTP logging using axios-logger
// Enables full request/response logging when LOG_HTTP is set (e.g., LOG_HTTP=1 npm test)
import * as AxiosLogger from "axios-logger";
import { http } from "../../src/client/httpClient.js";

const ENABLED = /^(1|true|on|debug)$/i.test(process.env.LOG_HTTP ?? "");

if (ENABLED && http?.interceptors) {
  // Log outgoing requests (method, url, headers, body)
  http.interceptors.request.use((config) =>
    AxiosLogger.requestLogger(config, {
      headers: true,
      data: true,
      prefixText: "[http] ->",
    }),
  );

  // Log responses (status, headers, body) and errors
  http.interceptors.response.use(
    (response) =>
      AxiosLogger.responseLogger(response, {
        headers: true,
        data: true,
        prefixText: "[http] <-",
      }),
    (error) =>
      AxiosLogger.errorLogger(error, {
        headers: true,
        data: true,
        prefixText: "[http] <- ERROR",
      }),
  );
}
