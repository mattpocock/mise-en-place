#!/usr/bin/env node
import { createTodoistApi, getTodoistToken } from "./lib/todoist-api.mts";

const token = getTodoistToken();
const api = createTodoistApi(token);

console.log("--- Listing projects ---");
const projects = await api.listProjects();
for (const p of projects) {
  console.log(`  [${p.id}] ${p.name}`);
}

const planning = projects.find((p) => p.name === "Planning");
if (!planning) {
  console.error("\nNo project named 'Planning' found. Available projects listed above.");
  process.exit(1);
}
console.log(`\nFound #Planning project: ${planning.id}`);

console.log("\n--- Listing sections in #Planning ---");
const sections = await api.listSections(planning.id);
if (sections.length === 0) {
  console.log("  (no sections)");
} else {
  for (const s of sections) {
    console.log(`  [${s.id}] ${s.name}`);
  }
}

const timestamp = new Date().toISOString();
const taskContent = `[smoke test, safe to delete] ${timestamp}`;

console.log(`\n--- Creating test task in #Planning (no section) ---`);
const task = await api.addTask({
  content: taskContent,
  projectId: planning.id,
});
console.log(`  Created task [${task.id}]: "${task.content}"`);
console.log(`  Project: ${planning.name} (${planning.id})`);
console.log(`  Section: none (Triage Queue)`);
console.log(`\nSmoke test passed. Delete the task in Todoist or via API: DELETE /rest/v2/tasks/${task.id}`);
