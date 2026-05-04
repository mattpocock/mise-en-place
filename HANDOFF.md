# Hand-off

Things that came up while building `CONTEXT.md` but didn't make it into the canonical glossary. Treat as a working list of vision, open threads, and known gaps.

## Vision / meta-goal

The repo exists not just to name the language but to grow into "an environment where AI agents can use the same language as me and access tools to go where I'm going." `CONTEXT.md` is step one (language). Future steps:

- Tooling that reads/writes the Pitch List as a real artifact
- Agents that can Capture from Channels into Notes
- Agents that can Adapt transcripts into Articles and Newsletters
- A way to navigate the Note graph programmatically (the Obsidian vaults already exist on disk: `/mnt/d/Obsidian Vault/AI Research`, `/mnt/d/Obsidian Vault/AI Coding Glossary`)

The repo name is a metaphor (mise en place); the vocabulary inside is not. The cooking analogy was explicitly rejected as a source of terms.

## The Pitch realisation

Late in the session, Matt named the key consequence: "I might need to be managing pitches as a first-class artifact."

This is the most actionable next step. Implications:

- A **Pitch List** needs a real home — file, folder, app, or dedicated tooling — not vibes
- A **Pitch** carries: linked Hook(s), linked Bricks, working title, thumbnail concept, status (alive/killed/shipped)
- An agent could maintain the Pitch List, suggest promotions (Brick → Hook), and audit pitch coverage against recent Captures

Designing this is the obvious next branch. Worth its own session.

## Named gaps (Matt's own framing)

- **No content calendar.** "I don't really have a content calendar or a set of ideas that I'm working through. I mostly just come up with things as I go, which means my output is pretty spotty." The **Pitch List** concept exists to fix this; the practice of *filling it* doesn't yet.
- **Packaging is hard and currently done on-the-fly.** Specifically: YouTube title + thumbnail; Twitter/LinkedIn framing copy; AI Hero CMS title + description. Matt flagged "I think I could do a better job there" — doing Packaging at Pitch time (as the model now prescribes) is the proposed fix, but the practice isn't established.
- **Repo Maintenance is honest overhead.** Worth budgeting deliberately so it doesn't eat output time.

## Open threads (named in conversation, not resolved)

- **Compose, Ship, Promote, Pitch (verb)** as named Tasks — discussed as candidates, only **Capture, Film, Adapt, Repo Maintenance** got into the glossary. **Ship** appears in the Pipeline section but isn't a defined term. **Promote** (Brick → Hook) was discussed as a useful named operation but not added.
- **Tweet vs Thread.** A Tweet is currently a Deliverable kind. Whether a Thread is a separate Deliverable or just a long Tweet wasn't resolved. LinkedIn long-form posts share the same question.
- **Course / Cohort pipeline.** The Landscape Video pipeline (Capture → Pitch → Film → Adapt → Ship) is well-named; the Course/Cohort pipeline is not. Course authoring has its own ubiquitous language in `~/repos/matt/course-video-manager/CONTEXT.md` — the relationship between *that* language and *this* one was deferred.
- **AI Hero CMS** is referenced as both a Channel and the host for Articles and Courses. Its internal model wasn't explored.
- **Notes flowing directly into Course content (without a Pitch).** Captured as a relationship, but the *act* of incorporating a Note into a Course isn't a named Task.

## Debatable decisions (worth revisiting)

- **Where Packaging lives.** Current model: core Packaging on the Pitch, per-Channel variants at ship time. Matt was on the fence — "It's kind of debatable whether we should do the full packaging or not." Both approaches are defensible.
- **Eligible vs Active Channels.** Flagged but kept informal. May deserve formal terms once routing decisions become automated (e.g. an agent deciding where to ship a Short).
- **Hook vs Brick is a *role*, not a *stage*.** This was deliberately chosen to preserve the "Notes are flat" rule. If Promote (Brick → Hook) becomes a frequent operation, it may start to *look* like a stage and the rule may need revisiting.

## Explicitly excluded

- **Vault** was dropped from the glossary even though `AI Research` and `AI Coding Glossary` exist as separate Obsidian directories on disk. The reason: vaults are an implementation detail of Obsidian, not a domain concept. If routing Notes between vaults ever becomes a recurring decision, this may need revisiting.
- **Zettelkasten numbering** (the `102a1` folgezettel system in `AI Research`) is real but excluded. Matt: "we don't want to number these because they just make them harder to author, and because we're in Markdown and Obsidian, we can actually view these in a graph-based view." A future ADR could capture this decision if numbered notes start drifting back in.
- **Index Notes** were dropped along with numbering.

## Cross-repo references

- `~/repos/matt/course-video-manager/CONTEXT.md` — the ubiquitous language for course authoring (Course, CourseVersion, Section, Lesson, Video, Clip, Publish, Materialize, etc.). The two glossaries are deliberately *different bounded contexts* — terms like **Repo** mean different things in each (here: a maintained OSS Channel; there: the on-disk git repo backing a Course). No reconciliation needed; awareness sufficient.

## Suggested next sessions

1. **Pitch tooling.** Design the Pitch List as a real artifact. What file format? Where does it live? What does an agent need to read/write it?
2. **Course / Cohort pipeline.** Name the pipeline analogous to Capture → Pitch → Film → Adapt → Ship.
3. **The remaining Tasks.** Compose, Ship, Promote — decide which deserve names.
4. **First ADR.** Probably: "Notes are not numbered" or "Repo = OSS project, not git directory" — both are surprising-without-context decisions worth recording.
