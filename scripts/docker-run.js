#!/usr/bin/env node
import { spawnSync } from "child_process";
import fs from "fs";

// This wrapper adds --env-file .env if present to pass environment variables into docker run
// Usage examples:
//   node scripts/docker-run.js run --rm demo-api-test npm test
//   node scripts/docker-run.js run --rm demo-api-test npm run validate

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/docker-run.js <docker args...>");
  process.exit(2);
}

const prepend = [];
if (fs.existsSync(".env")) {
  // Use --env-file so all key=value pairs are passed to the container
  // Note: Do NOT bake secrets into images; pass at run time.
  prepend.push("--env-file", ".env");
}

// Insert env file flags right after the 'run' subcommand if used
let finalArgs = args;
const runIdx = args.indexOf("run");
if (runIdx !== -1 && prepend.length > 0) {
  finalArgs = [
    ...args.slice(0, runIdx + 1),
    ...prepend,
    ...args.slice(runIdx + 1),
  ];
}

const res = spawnSync("docker", finalArgs, { stdio: "inherit" });
process.exit(res.status ?? 0);
