#!/usr/bin/env node
// Validates references.yml files against schemas/references.schema.json.
//
// - JSON Schema (draft-07) validation via ajv + ajv-formats.
// - Extra semantic checks the schema cannot express: unique `id`s and at most
//   one `canonical_for` per channel within a file.
//
// Usage:
//   node scripts/validate-references.mjs [file ...]
// With no args, validates every references*.y(a)ml in the repo (which includes
// schemas/references.example.yml).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import yaml from "js-yaml";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = join(repoRoot, "schemas", "references.schema.json");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(JSON.parse(readFileSync(schemaPath, "utf8")));

/** Recursively collect references*.y(a)ml files, skipping vendored dirs. */
function findReferenceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (["node_modules", ".git"].includes(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...findReferenceFiles(full));
    else if (/references.*\.ya?ml$/.test(entry)) out.push(full);
  }
  return out;
}

/** Semantic checks beyond the JSON Schema. Returns an array of error strings. */
function semanticErrors(doc) {
  const errors = [];
  const refs = Array.isArray(doc?.references) ? doc.references : [];
  const seenIds = new Set();
  const seenCanonical = new Set();
  for (const ref of refs) {
    if (ref?.id) {
      if (seenIds.has(ref.id)) errors.push(`duplicate id: "${ref.id}"`);
      seenIds.add(ref.id);
    }
    if (ref?.canonical_for) {
      if (seenCanonical.has(ref.canonical_for)) {
        errors.push(`more than one canonical_for: "${ref.canonical_for}"`);
      }
      seenCanonical.add(ref.canonical_for);
    }
  }
  return errors;
}

const targets = process.argv.slice(2).map((p) => join(process.cwd(), p));
const files = targets.length ? targets : findReferenceFiles(repoRoot);

if (files.length === 0) {
  console.log("No references*.yml files found — nothing to validate.");
  process.exit(0);
}

let failed = 0;
for (const file of files) {
  const rel = relative(repoRoot, file);
  let doc;
  try {
    doc = yaml.load(readFileSync(file, "utf8"));
  } catch (err) {
    console.error(`FAIL  ${rel}\n      YAML parse error: ${err.message}`);
    failed++;
    continue;
  }
  const schemaOk = validate(doc);
  const semantic = semanticErrors(doc);
  if (schemaOk && semantic.length === 0) {
    console.log(`PASS  ${rel}`);
    continue;
  }
  failed++;
  console.error(`FAIL  ${rel}`);
  for (const e of validate.errors ?? []) {
    console.error(`      ${e.instancePath || "/"} ${e.message}`);
  }
  for (const e of semantic) console.error(`      ${e}`);
}

console.log(`\n${files.length - failed}/${files.length} file(s) valid.`);
process.exit(failed ? 1 : 0);
