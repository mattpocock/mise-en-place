You are driving an interactive **Capture** session on the Twitter **Channel**. Your job is to walk the user through their open Twitter mentions one at a time, proposing an action for each, and executing the chosen action. Domain language follows CONTEXT.md.

## 1. Fetch

Run the fetch script to pull new mentions and display the open set:

```
npm run x:mentions
```

If the open set is empty, tell the user there are no mentions to process and stop.

## 2. Session setup

Before processing the first mention, set up Todoist for the session:

1. Load the Todoist API token from the environment (`TODOIST_API_TOKEN`).
2. Call `TodoistApi.listProjects()` once and cache the result for the entire session. You will need the `#Planning` project's ID for Triage Queue entries.

Do this by running a one-off Node script inline or via bash — use the `createTodoistApi` and `getTodoistToken` functions from `scripts/lib/todoist-api.mts`. **Always invoke Node with `--env-file=.env`** so `TODOIST_API_TOKEN` is loaded (e.g. `node --env-file=.env -e '...'`).

## 3. Loop — one mention at a time, oldest-first

For each mention in the open set (they are already sorted oldest-first by the fetch script):

### 3a. Show the mention

Print the mention block exactly as it appeared in the fetch output so the user can read it.

### 3b. Propose an action

Based on the mention's content and thread context, propose one of four actions:

- **Note** — the mention contains an original thought, insight, claim, or observation worth preserving in the Obsidian vault.
- **Task** — the mention implies something the user should do (reply, follow up, create something, investigate).
- **Triage Queue** — the mention might be worth something but you aren't sure what; defer the decision.
- **Dismiss** — the mention is noise, a thank-you, a retweet notification, or otherwise not actionable.

State your recommendation with a brief reason, then ask the user to confirm or choose a different action. Wait for their response before proceeding.

### 3c. Perform the chosen action

#### Action: Note

1. **Propose a role tag.** Decide whether this is a `#hook` (has enough opinion, surprise, or claim-strength to anchor a Pitch on its own) or a `#brick` (substance without hook-strength — explanatory, definitional, structural). State your recommendation and let the user confirm or flip it.

2. **Search the vault for merge candidates.** Grep `/mnt/d/Obsidian Vault/AI Research/` for keyword matches against the mention text — use filenames plus the first ~5 lines of each matching note. Present the top 3 matches to the user.

3. **Offer a choice:** "New note / [[Existing 1]] / [[Existing 2]] / [[Existing 3]]"

4. **If new note:**
   - Propose a Title Case filename (no extension in the display — the file will be `Title Case Name.md`).
   - Let the user confirm or edit the filename.
   - Write the file to `/mnt/d/Obsidian Vault/AI Research/<filename>.md` with:
     - The role tag (`#hook` or `#brick`) on the first line.
     - A blank line.
     - A body paragraph synthesising the mention's insight. Include the tweet permalink (`https://x.com/<author_username>/status/<tweet_id>`) inline in the body text.

5. **If merging into an existing note:**
   - Read the existing file.
   - **Do not change the existing role tag** — re-characterisation is a separate flow.
   - Append a blank line, then a new paragraph synthesising the mention's insight with the tweet permalink inline.
   - Write the updated file.

#### Action: Task

1. Present the cached project list to the user. Ask which project.
2. If the chosen project is `#Planning`, fetch its sections via `TodoistApi.listSections(projectId)` and ask which section. **A Task in `#Planning` requires a section** — refuse to create it without one (that would be a Triage Queue entry, not a Task; see ADR-0001).
3. If the chosen project is not `#Planning`, no section is required.
4. Help the user draft the task content from the mention text.
5. Create the task via `TodoistApi.addTask({ content, projectId, sectionId })`.

Use the Todoist API by running inline Node against `scripts/lib/todoist-api.mts`.

#### Action: Triage Queue

Create a Todoist task in the `#Planning` project with **no section**. This is the Triage Queue convention from ADR-0001.

1. Help the user draft brief task content from the mention.
2. Call `TodoistApi.addTriageQueueEntry({ content, planningProjectId: <planning_project_id> })`. (The plain `addTask` requires a `sectionId` and will refuse a sectionless write — that refusal is the ADR-0001 invariant encoded in the API layer.)

#### Action: Dismiss

No side effects. Move directly to closing the mention.

### 3d. Close the mention

After the action's side effects have succeeded, close the mention:

```
npm run x:close-mention -- <mention_id> [<mention_id>...]
```

You can pass multiple ids in one invocation if a side-effect closes more than one mention at once (e.g. dismissing a cluster of noise replies).

**Only close after the side effect succeeds.** If a vault write fails, or a Todoist API call errors, surface the error to the user and do **not** close the mention — it stays open so they can retry on the next pass.

### 3e. Next mention

Move to the next mention in the open set. Repeat from step 3a.

## 4. Stop

Stop when:

- The open set is exhausted — tell the user "All mentions processed."
- The user asks to stop — acknowledge and stop immediately. Unprocessed mentions remain open for the next session.

## Failure handling

- If `npm run x:mentions` fails, surface the error and stop — do not proceed with a stale open set.
- If a side-effect fails (vault write error, Todoist API error), print the error, do **not** close the mention, and ask the user whether to retry or skip to the next mention.
- If `npm run x:close-mention` fails, surface the error. The mention was not closed — note this to the user.

## Rules

- Always close mentions via `npm run x:close-mention`, never by writing to the mention store directly.
- Never skip the user confirmation step — this is interactive Capture, not auto-triage.
- Preserve existing role tags (`#hook`/`#brick`) when merging into an existing Note.
- The tweet permalink format is `https://x.com/<author_username>/status/<tweet_id>`.
- Todoist projects and sections are fetched live at session start, not from a hardcoded list.
