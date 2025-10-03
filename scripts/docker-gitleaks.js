#!/usr/bin/env node
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

// Resolve current working directory in a docker-friendly format
function toDockerPath(p) {
  // Use Node's path utilities for cross-platform compatibility
  if (process.platform === "win32") {
    const parsed = path.parse(p);
    const drive = parsed.root[0].toLowerCase();
    const rest = p.slice(2).replace(/\\/g, "/");
    return `/${drive}${rest}`;
  }
  return p;
}

const dockerPath = toDockerPath(process.cwd());
const argv = process.argv.slice(2);
let mode = "staged"; // staged|full
const wantJson = argv.includes("--json");
const wantDebug = argv.includes("--debug");
argv.forEach((a) => {
  if (a.startsWith("--mode=")) mode = a.split("=")[1];
});

if (!fs.existsSync(".gitleaks.toml")) {
  console.error(".gitleaks.toml not found in repo root");
  process.exit(2);
}

if (wantDebug) {
  console.log("Wrapper debug: host dockerPath=", dockerPath);
  ["src/client/httpClient.js", ".gitleaks.toml"].forEach((f) => {
    if (fs.existsSync(f)) console.log(" -", f);
  });
}

const baseArgs = [
  "run",
  "--rm",
  "-e",
  "MSYS_NO_PATHCONV=1",
  "-v",
  `${dockerPath}:/repo`,
  "-w",
  "/repo",
  "ghcr.io/gitleaks/gitleaks:latest",
];

if (mode === "staged") {
  baseArgs.push("protect", "--staged", "--config", ".gitleaks.toml", "-v");
} else {
  baseArgs.push(
    "detect",
    "--source",
    "/repo",
    "--config",
    ".gitleaks.toml",
    "-v",
  );
}
if (wantJson) {
  baseArgs.push(
    "--report-format",
    "json",
    "--report-path",
    "gitleaks-report.json",
  );
}

if (wantDebug) {
  console.log("Docker command (mode=%s):", mode);
  console.log(["docker", ...baseArgs].join(" "));
}

const res = spawnSync("docker", baseArgs, { stdio: "inherit" });
process.exit(res.status ?? 0);
