#!/usr/bin/env node
import { readdir, readFile, mkdir } from "node:fs/promises";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { select } from "@inquirer/prompts";
import { marked } from "marked";
import puppeteer from "puppeteer-core";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INVOICES_DIR = join(ROOT, "invoices");
const OUTPUT_DIR = join(ROOT, "output");
const CHROME_PATH = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";

const css = `
  @page { size: A4; margin: 20mm 18mm; }
  body { font: 11pt/1.5 -apple-system, "Helvetica Neue", Arial, sans-serif; color: #111; }
  h1 { font-size: 22pt; margin: 0 0 4pt; }
  h2 { font-size: 13pt; margin: 18pt 0 6pt; border-bottom: 1px solid #ddd; padding-bottom: 3pt; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
  th, td { padding: 6pt 8pt; border-bottom: 1px solid #eee; text-align: left; }
  th:last-child, td:last-child { text-align: right; }
  ul { padding-left: 18pt; }
  code { font-family: ui-monospace, Menlo, monospace; font-size: 10pt; }
  hr { border: 0; border-top: 1px solid #ddd; margin: 14pt 0; }
`;

const wrapHtml = (body: string): string =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;

const files = (await readdir(INVOICES_DIR))
  .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
  .sort();

if (files.length === 0) {
  console.error(`No invoice markdown files found in ${INVOICES_DIR}`);
  process.exit(1);
}

const choice = await select({
  message: "Which invoice?",
  choices: files.map((f) => ({ name: f, value: f })),
});

const md = await readFile(join(INVOICES_DIR, choice), "utf8");
const html = wrapHtml(await marked.parse(md));

await mkdir(OUTPUT_DIR, { recursive: true });
const outPath = join(OUTPUT_DIR, basename(choice, ".md") + ".pdf");

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({ path: outPath, format: "A4", printBackground: true });
} finally {
  await browser.close();
}

console.log(`Wrote ${outPath}`);
