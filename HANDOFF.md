# Hand-off

Things that came up while building `CONTEXT.md` but didn't make it into the canonical glossary. Treat as a working list of vision, open threads, and known gaps.

## Vision / meta-goal

The repo exists not just to name the language but to grow into "an environment where AI agents can use the same language as me and access tools to go where I'm going." `CONTEXT.md` is step one (language). Future steps:

- Tooling that reads/writes the Pitch List as a real artifact
- Agents that can Capture from Channels into Notes *or* Tasks (the Capture-yields-Tasks side was added in session 2 — Email and WhatsApp are predominantly Task-feeding Channels)
- Agents that can Adapt transcripts into Articles and Newsletters
- A way to navigate the Note graph programmatically (the Obsidian vaults already exist on disk: `/mnt/d/Obsidian Vault/AI Research`, `/mnt/d/Obsidian Vault/AI Coding Glossary`)
- An agent that can recognise **Graze** (pathological Channel attention with no Capture) and warn — directly enabled by naming the anti-pattern in the glossary

The repo name is a metaphor (mise en place); the vocabulary inside is mostly not. Original stance: cooking analogy rejected as a source of terms. Session 2 relaxed this *narrowly* for **structural** terms (Prep / Ship as the top-level cut for work) on the grounds that the repo name already commits to the metaphor at the structural level. Asset names (Note, Hook, Brick, Pitch, Deliverable, Channel) remain non-cooking.

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

- **Compose, Promote, Pitch (verb)** as named Tasks — discussed as candidates, never added. **Ship** is now defined (session 2). **Promote** (Brick → Hook) is still a useful unnamed operation; **Compose** would name the act of writing a Tweet, LinkedIn post, etc. without going through Film + Adapt.
- **Tweet vs Thread.** A Tweet is currently a Deliverable kind. Whether a Thread is a separate Deliverable or just a long Tweet wasn't resolved. LinkedIn long-form posts share the same question.
- **Course / Cohort pipeline.** The Landscape Video pipeline (Capture → Pitch → Film → Adapt → Ship) is well-named; the Course/Cohort pipeline is not. Course authoring has its own ubiquitous language in `~/repos/matt/course-video-manager/CONTEXT.md` — the relationship between *that* language and *this* one was deferred. Reinforced in session 2 by scenario #7 (recording a Course lesson directly to camera with no Landscape Video to adapt from — the model has no Pitch-equivalent for this path).
- **AI Hero CMS** is referenced as both a Channel and the host for Articles and Courses. Its internal model wasn't explored.
- **Notes flowing directly into Course content (without a Pitch).** Captured as a relationship, but the *act* of incorporating a Note into a Course isn't a named Task.
- **Team / Collaborator concept.** First mentioned in session 2 ("or perhaps me with my team") when Matt described how Ship Tasks get decided. Not in the glossary. Recommended approach: lightweight **Team** term (the people Matt collaborates with — undefined in detail) when needed; full collaboration model (assignees, visibility, joint decisions) deferred until friction shows up. Open question: stable named team or ad-hoc collaborators? Affects how much machinery to build.
- **Note-graph maintenance has no Prep verb.** Session 2 scenario #9 surfaced this: spending two hours connecting Notes, splitting overlong ones, killing stale ones is Prep, but it's not Capture, not Repo Maintenance, not Analytics Review. Related to the Compose / Promote gap.
- **Guest content / Channel ownership.** Session 2 scenario #10: shipping a Deliverable to *someone else's* Channel (e.g. a guest post on another newsletter). The current model implicitly assumes Channels are Matt's. Whether Channels need an `ownership` attribute, or whether third-party publishing is a separate kind of Ship, was not resolved.
- **Repo releases as Deliverables.** Session 2 scenario #8: a v2.0 release with a CHANGELOG ships to an audience but isn't *derived from Notes* in any meaningful sense. The Deliverable definition ("anything shipped to an audience that is derived from one or more Notes") may be too narrow, or Repo releases are a different category of outbound material.
- **Outbound-triggers-inbound on the same Channel.** Session 2 scenario #6: a Newsletter ships and a subscriber's reply lands on the same Email Channel. The bidirectional framing holds abstractly but hasn't been tested at the transactional level (no named concept for "a reply chain seeded by an outbound Deliverable").
- **Note reuse.** Session 2 scenario #11: the same Note used as a Brick in a Course *and* as the seed for a standalone Tweet later. The model doesn't say whether Notes are "consumed" by a Deliverable or remain reusable. Implied many-use, but not stated.

## Debatable decisions (worth revisiting)

- **Where Packaging lives.** Current model: core Packaging on the Pitch, per-Channel variants at ship time. Matt was on the fence — "It's kind of debatable whether we should do the full packaging or not." Both approaches are defensible.
- **Eligible vs Active Channels.** Flagged but kept informal. May deserve formal terms once routing decisions become automated (e.g. an agent deciding where to ship a Short).
- **Hook vs Brick is a *role*, not a *stage*.** This was deliberately chosen to preserve the "Notes are flat" rule. If Promote (Brick → Hook) becomes a frequent operation, it may start to *look* like a stage and the rule may need revisiting.
- **Prep / Ship as the top-level cut for work** *(session 2)*. Defensible and useful, but commits the glossary to kitchen-adjacent structural terms after originally rejecting the cooking analogy. The narrowing — "structural words only, not asset names" — holds for now. If more cooking-flavored terms creep in (Plate, Fire, Pass), the line has slipped.
- **Task Channel / Note Channel graduated to first-class types** *(session 2)*. Initial preference (Q8) was to keep the glossary tight and let Todoist hold organisational metadata. Matt graduated the distinction explicitly because it carved a real joint (Email/WhatsApp behave differently from books/conversations as Capture sources). Worth revisiting if a third feeding-type emerges (e.g. "Signal Channel" for Analytics Review yielding signals not material).
- **Naming an anti-pattern in the glossary** *(session 2)*. **Graze** is the first entry that names something to *avoid*. Unusual for a glossary, but justified by the agent goal — an agent that recognises Graze can warn Matt. If this opens the door, expect more anti-patterns; if not, Graze stays a one-off.

## Explicitly excluded

- **Vault** was dropped from the glossary even though `AI Research` and `AI Coding Glossary` exist as separate Obsidian directories on disk. The reason: vaults are an implementation detail of Obsidian, not a domain concept. If routing Notes between vaults ever becomes a recurring decision, this may need revisiting.
- **Zettelkasten numbering** (the `102a1` folgezettel system in `AI Research`) is real but excluded. Matt: "we don't want to number these because they just make them harder to author, and because we're in Markdown and Obsidian, we can actually view these in a graph-based view." A future ADR could capture this decision if numbered notes start drifting back in.
- **Index Notes** were dropped along with numbering.
- **Pulse Check** *(session 2)* — proposed as a generic name for "scheduled, disciplined Channel-observation that yields signals not material." Rejected because the name was too easy to rationalise Graze into ("I'm just doing a Pulse Check on Twitter"). The discipline term must be narrow enough to resist self-deception; **Analytics Review** was chosen instead. If/when a second disciplined Channel-observation Task emerges (e.g. PR queue triage), it gets its own specific name rather than reviving Pulse Check as an umbrella.
- **Reactive / Proactive as a Task axis** *(session 2)*. Considered as a second axis alongside Prep/Ship to give the work a 2×2. Collapsed when team-correspondence broke the framing — an email thread with a colleague is neither reactive nor proactive at the per-Task level; the whole thread is one piece of coordinated work. Glossary stays tight: Prep/Ship is the only named cut. Todoist's own structures (sections, labels, dates) hold the rest.
- **Correspondence as a separate concept** *(session 2)*. Briefly proposed for outbound material that isn't a Deliverable (email replies, WhatsApp replies). Folded away: a Task already represents the open communication loop, and sending a reply just advances or closes the Task. No separate term needed.
- **Pixel Watch as its own Channel** *(session 2)*. Matt initially called it a Channel; reframed as a *capture route* into the Todoist Inbox Channel. The reasoning: a Channel is a stream of material from the world (or your past self); Pixel Watch is a writing device, not a stream. If a similar device starts feeding a different surface, this might warrant revisiting.

## Cross-repo references

- `~/repos/matt/course-video-manager/CONTEXT.md` — the ubiquitous language for course authoring (Course, CourseVersion, Section, Lesson, Video, Clip, Publish, Materialize, etc.). The two glossaries are deliberately *different bounded contexts* — terms like **Repo** mean different things in each (here: a maintained OSS Channel; there: the on-disk git repo backing a Course). No reconciliation needed; awareness sufficient.

## Suggested next sessions

1. **Pitch tooling.** Design the Pitch List as a real artifact. What file format? Where does it live? What does an agent need to read/write it? *Still the most actionable next branch — both sessions have circled it.*
2. **Run the eleven test scenarios** (listed below). Each was proposed in session 2 to probe a specific weak spot; only the first batch was generated, none were resolved. Working through them would surface concrete gaps faster than abstract grilling.
3. **Course / Cohort pipeline.** Name the pipeline analogous to Capture → Pitch → Film → Adapt → Ship. Reinforced by scenario #7 (recording a lesson directly).
4. **The remaining Prep/Ship verbs.** **Compose** (writing Tweets/LinkedIn posts without Film+Adapt), **Promote** (Brick → Hook), and a verb for note-graph maintenance — decide which deserve names.
5. **Team / Collaborator.** Decide whether to add a lightweight Team term now or wait for friction. Ad-hoc vs stable team is the gating question.
6. **First ADR.** Strongest candidates after session 2:
   - **Prep / Ship as the top-level cut for work** — hard to reverse, surprising without context (kitchen vocabulary), genuine trade-off (we relaxed an explicit prior rejection of cooking terms)
   - **Anti-patterns belong in the glossary** — Graze is the first; the decision to allow this category at all is worth recording
   - **"Notes are not numbered"** or **"Repo = OSS project, not git directory"** — both still strong, carried over from session 1

## Test scenarios (session 2, unresolved)

Eleven scenarios were proposed to stress-test the glossary; none ran to conclusion. Each is pointed at a specific weak spot:

1. **Repo issue → video.** Issue triage yields both a Task (fix bug) and a Note (pedagogical angle); Note becomes a Hook in a Pitch in a Landscape Video. Tests cross-flow from Repo Channel into content production.
2. **Filmed but never shipped.** Video file exists, never released. Does the model have a "produced but not landed" state? Tests Pitch / Deliverable lifecycles.
3. **Cohort Discord as a Channel.** Discord inside a Cohort feeds Tasks (answer questions) and Notes (great Hooks). Confirmed by Matt as a real Channel. Tests recursive structure: Deliverables containing Channels.
4. **Tweet without a Pitch.** Direct from idea to send. Is Pitch mandatory on every Deliverable's path, or only for big productions?
5. **Pitch gets killed.** What happens to its Hooks and Bricks — flow back to free Notes? Killed Pitch retained as evidence?
6. **Outbound triggers inbound on the same Channel.** Newsletter ships, subscriber replies. Tests bidirectional Channel framing at the transactional level.
7. **Course lesson recorded directly.** No Landscape Video to adapt from. Where do the Notes come from? What's the Pitch-equivalent? Tests the Course/Cohort pipeline gap.
8. **Repo release as Deliverable.** v2.0 with CHANGELOG ships to audience but isn't Note-derived. Tests the Deliverable definition.
9. **Two hours organising the Note graph.** Pure graph maintenance. Tests gap in Prep verbs.
10. **Guest post on someone else's newsletter.** Deliverable lands on a non-Matt Channel. Tests Channel ownership assumptions.
11. **Same Note used in a Course and a Tweet.** Tests Note reuse semantics — single-use vs many-use.
