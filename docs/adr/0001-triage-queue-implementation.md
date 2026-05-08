# Triage Queue lives in `#Planning` with no section

The **Triage Queue** (CONTEXT.md) is implemented as the **unsectioned area of the `#Planning` project in Todoist** — *not* the Todoist Inbox, despite the Inbox being the obvious choice.

Items in `#Planning` with a section assigned are **Tasks**. Items in `#Planning` with no section are the **Triage Queue**. Items elsewhere in Todoist are also Tasks.

## Why not the Todoist Inbox

The Inbox collects everything Todoist itself doesn't know where to put — quick-adds from mobile, email forwards, integrations. Using it as the Triage Queue would mix "stuff I haven't decided about yet" with "stuff Todoist is dumping here." Splitting them by project keeps the Triage Queue a deliberate, walkable surface.

## Consequences

- Code that creates a Triage Queue entry must target `#Planning` with **no** `section_id`.
- Code that creates a Task must supply both `project_id` and `section_id` (or pick a project other than `#Planning`).
- "Move from Triage Queue to Task" = assign a section to a `#Planning` item.
