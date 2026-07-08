import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "node_modules", "dist", "build", "coverage", "tmp", ".codex", ".agents"]);
const ignoredFiles = new Set(["package-lock.json", "security-audit.mjs"]);
const forbiddenFiles = [
  ".env",
  ".env.local",
  "backend/.env",
  "dashboard/.env",
  "dashboard/.env.local",
  "mobile/.env",
  "google-services.json",
  "mobile/google-services.json",
  "GoogleService-Info.plist"
];

const secretPatterns = [
  { name: "Firebase Web API key", pattern: /AIza[0-9A-Za-z_-]{20,}/ },
  { name: "Proyecto Firebase real", pattern: /tesis-acac7/ },
  { name: "Firebase sender real", pattern: /398721050399/ },
  { name: "Firebase measurement real", pattern: /G-X2V42NQ5H8/ },
  { name: "Conexion PostgreSQL real", pattern: /postgres(?:ql)?:\/\/(?!USER:PASSWORD@HOST\/DATABASE)/i }
];

function listFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...listFiles(join(directory, entry.name)));
      continue;
    }
    if (entry.isFile() && !ignoredFiles.has(entry.name)) files.push(join(directory, entry.name));
  }
  return files;
}

const findings = [];

for (const file of forbiddenFiles) {
  if (existsSync(join(root, file))) findings.push({ file, issue: "Archivo local sensible presente" });
}

for (const file of listFiles(root)) {
  const size = statSync(file).size;
  if (size > 1024 * 1024) continue;
  const text = readFileSync(file, "utf8");
  for (const pattern of secretPatterns) {
    if (pattern.pattern.test(text)) {
      findings.push({ file: relative(root, file), issue: pattern.name });
    }
  }
  if (text.includes("-----BEGIN PRIVATE KEY-----") && !text.includes("REPLACE_ME")) {
    findings.push({ file: relative(root, file), issue: "Llave privada no placeholder" });
  }
}

if (findings.length > 0) {
  console.error("Security audit found sensitive material:");
  for (const finding of findings) {
    console.error(`- ${finding.file}: ${finding.issue}`);
  }
  process.exit(1);
}

console.log("Security audit passed. No known local secrets were found.");
