import dotenv from "dotenv";
dotenv.config();

const defaultConfig = {
  baseUrl: process.env.API_BASE_URL || "https://reqres.in/api",
  timeout: Number(process.env.API_TIMEOUT || 5000),
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Inject API key header only if provided
if (process.env.API_KEY) {
  defaultConfig.defaultHeaders["x-api-key"] = process.env.API_KEY;
}

export function getConfig() {
  return defaultConfig;
}
