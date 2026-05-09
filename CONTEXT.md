# Mise en Place

A working environment for Matt Pocock's content and education business. Names the raw materials, containers, channels, activities, and disciplines of the work so that Matt and AI agents can speak the same language.

## Raw materials

The things produced and worked on — the nouns that flow through the system.

### Note

**Note**:
An atomic Markdown file capturing one original thought. Flat (no stage), connected via wikilinks. Every Note is currently a **Hook** or a **Brick** — a role, not a stage.
_Avoid_: Zettel (jargon), Idea (too vague), Card

**Hook**:
A Note with enough opinion, surprise, or claim-strength to anchor a Pitch on its own. A Pitch must contain at least one Hook.
_Avoid_: Pitch Note, Headline, Punch

**Brick**:
A Note with substance but no hook strong enough to drive a Pitch — explanatory, definitional, structural. Load-bearing inside Courses and longer Deliverables. Can be re-characterised as a Hook later.
_Avoid_: Filler, Body, Substrate, Foundation, Building Block

**Pitch**:
A candidate Deliverable in pre-production: at least one Hook plus supporting Bricks, a working angle, title, and thumbnail concept. Lightweight and meant to be killed cheaply — if you can't package a Pitch, you don't have one.
_Avoid_: Concept (too vague), Treatment (jargon), Idea, Topic, Script (no separate script step exists)

**Deliverable**:
Anything shipped to an audience, derived from one or more Notes. Lands on one or more Channels, each with its own Packaging. Plays one of two roles: **Revenue Deliverable** or **Audience Deliverable**.
_Avoid_: Output (too generic), Artifact

**Revenue Deliverable**:
A Deliverable that operates on the number — converts current audience into money.
_Avoid_: Paid Deliverable (names the price, not the role), Earner

**Audience Deliverable**:
A Deliverable that operates on the multiplier — grows the audience that future Revenue Deliverables convert against.
_Avoid_: Free Deliverable (denigrates by naming what's missing), Reach, Top-of-Funnel

**Course**:
A structured, paid educational product hosted on AI Hero, authored via the Course Video Manager. Composed of Notes.

**Landscape Video**:
A 16:9 recorded video, typically long-form. Lands on YouTube, Twitter, LinkedIn, and the AI Hero CMS.

**Short**:
A 9:16 vertical video. Active Channels: TikTok, YouTube Shorts (Instagram Reels eligible but no traction). The Hook must land in ~3 seconds.

**Article**:
A long-form written piece on the AI Hero CMS, typically _adapted_ from a Landscape Video's transcript. Lives alongside the embedded video.

**Newsletter**:
An email broadcast to subscribers, typically _adapted_ from a Landscape Video's transcript. One issue ships once to all subscribers — distinct from a **Shadow Newsletter Episode** (drip).

**Shadow Newsletter Episode**:
A single email in the **Shadow Newsletter** drip sequence — one ship per new subscriber, on schedule. An Audience Deliverable. Held by the **Shadow Newsletter** container.
_Avoid_: Drop, Step, Installment, Beat

**Packaging**:
The selling layer of a Deliverable on a Channel — title, thumbnail, framing copy. Derived from the Pitch's Hook(s). Core Packaging lives on the Pitch; per-Channel variants are produced at ship time.
_Avoid_: Marketing copy, Promo, Metadata

**Mention Thread**:
A rooted tree of cached tweets on the Twitter Channel that contains one or more open **Mentions**. Grouped by walking up to the topmost ancestor (or the topmost unresolved parent id, if the chain dies at a missing tweet). Pruned to only the nodes on the path from root to an open Mention. Used by the fetch-mentions Capture pipeline to present a Twitter-shaped conversation view rather than a flat list.
_Avoid_: Conversation (overloaded by Twitter's own API term), Mention Group, Reply Chain

**Task**:
A discrete, schedulable unit of work — a Todoist row. Every Activity instance is a Task.
_Avoid_: To-Do, Action, Errand, Chore, Job

## Containers

The places where raw materials rest between flows. Distinct from Channels (which are streams, not wells).

**Inventory**:
The umbrella for outbound queues feeding Ship: the **Pitch List**, the **Shadow Newsletter** sequence, the **Deliverable Calendar**. A shallow Inventory at **Scheduling** time is one face of **Work Dirty**.
_Avoid_: Supply, Backlog (software-dev connotations), Pipeline, Stockpile

**Pitch List**:
The pool of current Pitches from which **Scheduling** draws. Part of the **Inventory**; failure mode is **depletion** (Films drain it). Upstream of the **Deliverable Calendar**.
_Avoid_: Backlog, Queue, Pipeline, Content Calendar

**Deliverable Calendar**:
The forward-looking schedule of committed Deliverable ships — each entry pairs a Deliverable with a ship date and target Channel(s). Output of **Scheduling**. Holds Pitch-originated entries _and_ adapted/standalone ones (Newsletters, Articles, Shadow Newsletter Episodes, Tweets). Part of the **Inventory**.
_Avoid_: Content Calendar (vague), Editorial Calendar (jargon), Schedule (overloaded), Roadmap

**Shadow Newsletter**:
The evergreen drip sequence — a fixed series of **Shadow Newsletter Episodes** every new subscriber receives in order. A container, not a Deliverable. Part of the **Inventory**.
_Avoid_: Drip (too generic), Onboarding Sequence (collides with course onboarding), Welcome Sequence, Evergreen Newsletter

## Channels

Bidirectional streams that move material in and out. Not containers — material flows _through_ a Channel, it doesn't rest in one.

**Channel**:
A bidirectional medium through which content flows — material in (feeding Notes or Tasks via Capture), Deliverables out. Characterised by what it feeds: a **Task Channel**, a **Note Channel**, or both.
_Avoid_: Source (too static), Input (overloaded), Feed, Surface, Placement

**Task Channel**:
A Channel whose inbound material is predominantly Task-shaped. Examples: Email, WhatsApp.
_Avoid_: Inbox (too narrow)

**Note Channel**:
A Channel whose inbound material is predominantly Note-shaped. Examples: books, shower thoughts, others' tweets, conversations.
_Avoid_: Idea Stream, Source

**Triage Queue**:
An inbound-only Channel where Captured material lands before it has a home, to be promoted into a Note or routed to a Task. Currently the unsectioned area of Todoist's **#Planning** project — items in `#Planning` that haven't been assigned to a section. A non-empty Triage Queue at rest is one face of **Work Dirty**.
_Avoid_: Triage (the act), Inbox (overloaded), Todoist Inbox (implementation; not actually the Inbox), Staging Surface, Holding Pen

**Repo**:
An open-source software repository, acting as a bidirectional Channel — issues/PRs/discussions in, code/releases out. Also serves as demo material inside Courses. Requires **Repo Maintenance**.
_Avoid_: Project (too vague), Library/Tool/Package (too narrow)

## Activities

The verbs of the business — the kinds of work performed. Each instance is a **Task**. Categorised as **Prep** or **Ship**.

### Categories

**Prep**:
Work that doesn't ship but makes shipping possible — Capture, planning, admin, Repo upkeep. The repo name _mise en place_ refers to the prep state itself.
_Avoid_: Backstage, Setup, Groundwork, Overhead (too pejorative)

**Ship**:
Work that produces or releases a Deliverable — Film, Adapt, posting to a Channel. Used in the software-shipping sense: includes the building, not only the final hand-off.
_Avoid_: Service (restaurant-jargon), Production, Launch, Release

### Prep activities

**Capture**:
Attending a Channel and pulling material out — yields a Note, a Task, or both. Two modes: **Opportunistic Capture** (grabbed in the moment as a Channel flows past) and **Deliberate Capture** (a scheduled session with intent to extract).
_Avoid_: Jot, Log, Save

**Repo Maintenance**:
Ongoing work to keep a Repo alive as a Channel — issue triage, PR review, dependency updates, releases, bug fixes. Doesn't directly produce Notes or Deliverables; treat as overhead.
_Avoid_: Upkeep, Admin, Housekeeping

**Analytics Review**:
A bounded daily Prep Task: read yesterday's numbers across Channels to maintain a felt sense of what's resonating. Time-boxed deliberately; failure mode is **Graze**.
_Avoid_: Pulse Check (too generic), Numbers Check, Daily Read

**Inventory Check**:
A bounded periodic Prep Task — walk each queue in the Inventory, assess depth, yield Tasks for any queue running shallow. The outbound parallel to **Analytics Review**.
_Avoid_: Stock Check, Larder Check, Supply Review, Depth Check

**Scheduling**:
Choosing what Ships next, in what mix, against the Revenue/Audience split, and committing to the **Deliverable Calendar**. Operates weekly (tactical) and quarterly (strategic). Depends on a healthy **Inventory** to be honest rather than wishful.
_Avoid_: Planning (too generic), Programming (broadcasting jargon), Plotting, Routing

### Ship activities

**Film**:
Recording a Landscape Video (or Short) using the Pitch's Hooks and Bricks as loose structure. Always the first production step — Articles and Newsletters are adapted from the transcript afterwards.
_Avoid_: Record (collides with course-video-manager), Shoot

**Adapt**:
Transforming a Landscape Video's transcript into a different-format Deliverable — Article or Newsletter. Reformatting, not re-authoring.
_Avoid_: Derive (too mathematical), Repurpose, Spin out

### Pathological activities

**Graze**:
Pathological Channel attention — engaging with a Channel without yielding a Note or a Task. Capture's shadow. Boredom-triggered (Twitter scroll, refreshing an empty inbox, opening Stripe at 11pm). A specific shape of **Work Dirty**; the Ship-triggered cousin is **Lurk**.

**Lurk**:
Compulsively checking the engagement signal on a freshly-shipped Deliverable in the early window (~first 30 min), before the signal has settled. The only honest read is post-settling, via **Analytics Review**. A specific shape of **Work Dirty**.
_Avoid_: Hover, Echo Check, Vanity Loop, Doomscroll, Drift, Idle Check

## Discipline

The principle that governs Prep and the transition into Ship.

**Work Clean**:
The discipline of keeping the Prep environment ordered — **inbound**: Channel attention always yielding, **Triage Queue** at zero; **outbound**: a healthy **Inventory** and a Pitch's Prep finished before Filming. Lifted from Dan Charnas's _Work Clean_. Used as verb and state.
_Avoid_: Mise (collides with the repo name), Stationed, Clean Hands (too narrow), Tidy

**Work Dirty**:
The umbrella failure mode — failing to Work Clean. Concrete shapes:

- **Inbound**: dirty Channel attention (**Graze**, **Lurk**); non-empty **Triage Queue** at rest
- **Outbound**: shallow **Inventory** at **Scheduling** time; a Pitch whose Prep is incomplete when Ship starts

_Avoid_: Working Messy, Slop, Disorganised, In the Weeds (restaurant jargon, opposite valence)

## Relationships

- A **Channel** is bidirectional: material flows in (feeding **Notes** or **Tasks** via **Capture**) and **Deliverables** are shipped out
- Every **Note** is currently a **Hook** or a **Brick** — a role, not a stage; can change
- A **Pitch** contains at least one **Hook** and zero or more **Bricks**
- **Notes** are connected to each other via wikilinks
- A **Pitch** is realised into a **Deliverable** when committed to production
- **Bricks** flow into **Courses** and longer Deliverables; **Hooks** can also feature there
- A **Deliverable** lands on one or more **Channels**, each with its own **Packaging**
- Core **Packaging** is derived from the **Hook(s)** in the **Pitch**; per-**Channel** variants are produced at ship time
- The same platform — e.g. **Twitter** — is one **Channel** that serves both directions: others' tweets arrive via it (Capture material), Matt's tweets ship to it (Deliverables)
- A **Repo** is a kind of **Channel**: issues/PRs/discussions feed **Notes** or **Tasks** via **Capture**; code and releases ship out
- A **Repo** can be the subject of a **Pitch** and can appear as a demo inside a **Course**
- A **Repo** requires **Repo Maintenance** to remain a viable **Channel** — overhead, not direct business output
- The **Triage Queue** is a **Channel** in its own right (currently the Todoist Inbox), not a slot inside another Channel — material from many Channels flows into it via **Capture**, then leaves it via Triage
- Every **Deliverable** is either a **Revenue Deliverable** or an **Audience Deliverable** — the role determines which feedback loop applies (immediate revenue vs compounding audience growth)
- A **Shadow Newsletter Episode** is a Deliverable; the **Shadow Newsletter** is the container/sequence that holds the Episodes — analogous to Pitch / Pitch List
- The **Inventory** is the union of outbound queues — currently the **Pitch List**, the **Shadow Newsletter** sequence, and the **Deliverable Calendar**; **Inventory Check** is the bounded Prep Task that surfaces shallow queues, parallel in shape to **Analytics Review**
- **Scheduling** moves Pitches from the **Pitch List** onto the **Deliverable Calendar** with a date and target **Channel(s)**; it depends on a healthy **Inventory** to be honest rather than wishful
- The **Deliverable Calendar** also holds entries that didn't originate on the **Pitch List** — adapted **Newsletters** and **Articles** derived from a Filmed Pitch, **Shadow Newsletter Episodes**, standalone **Tweets**
- Every **Activity** instance is a **Task**; Tasks are produced from Channels (especially Task Channels) via Capture
- **Work Clean** governs **Prep** and the transition into **Ship** on both inbound (clean Triage Queue, no Graze) and outbound (healthy Inventory, finished Pitches) sides; **Work Dirty** is its umbrella failure mode

### Pipeline (typical Landscape Video)

1. **Capture** material from **Channels** into **Notes**
2. Promote **Hooks** + supporting **Bricks** into a **Pitch** (loose structure; no script)
3. **Film** from the **Pitch**
4. **Adapt** the transcript into an **Article** (for the AI Hero CMS) and a **Newsletter**
5. Ship the **Landscape Video**, **Article**, and **Newsletter** to their **Channels**, each with its own **Packaging**

## Flagged ambiguities

- **A platform Channel serves both directions** — Twitter, YouTube, and LinkedIn are each a single Channel through which material flows in and out. The _unit_ is what disambiguates: a YouTube _comment_ arriving via the YouTube Channel is Capture material; a YouTube _video_ shipped to the YouTube Channel is a Deliverable. The Channel itself is neither inbound nor outbound by nature.
- **"Hook" has two related meanings** — (1) a Note with enough punch to anchor a Pitch (the Note role), (2) the persuasive content within Packaging (the marketing concept). They are tightly related: the Packaging hook is _derived from_ the Hook Note. When unqualified, "Hook" refers to the Note role.
- **Hook vs Brick is a role, not a stage** — a Note doesn't graduate from Brick to Hook; it gets re-characterised when a hook-shaped angle is found. This preserves the "Notes are flat" rule. The role is also non-exclusive at the level of _use_: a Hook Note can appear inside a Course alongside Bricks.
- **"Input" was rejected** as the umbrella because it conflated the platform with the content-unit on it. **Channel** is now canonical for the medium; the unit is named per-platform.
- **"Source" was rejected** in favour of **Channel** — Source implies a static well; Channel captures the flowing nature.
- **"Surface" / "Placement" were considered for outbound destinations** and rejected — a Channel is bidirectional, so a separate outbound term is unnecessary and creates artificial asymmetry.
- **"Output" was rejected** in favour of **Deliverable** — Output is too generic and overlaps with general programming/process language.
- **Eligible vs active Channels** — a Short is _eligible_ on Instagram Reels (the format works there) but not _active_ (no audience traction). Channel routing decisions should default to active Channels for a given Deliverable kind. Kept informal for now — flagged here rather than promoted to a formal term.
- **"YouTube Video" was rejected** as a Deliverable kind — it conflated the form factor with one Channel. Replaced with **Landscape Video** (form factor first), which routes to YouTube + Twitter + LinkedIn + AI Hero CMS.
- **Where Packaging lives is debatable** — current model: core Packaging lives on the **Pitch** and is derived from its **Hook(s)**; per-Channel variants are added at ship time. Alternative considered: defer all Packaging until ship time. Chosen approach makes Packaging the test of whether a Pitch is worth pursuing — if the Hook can't carry the Packaging, kill it cheaply.
- **Container is a heading, not a domain term** — the "Containers" section groups things that hold raw materials at rest, but no Term in this glossary is _typed_ as Container. The Triage Queue, for example, is domain-classed as a Channel even though it has container-like behaviour (depth, at-rest state). Headings organise the glossary; they don't define types.
- **Shadow Newsletter splits** — **Shadow Newsletter Episode** is the Deliverable unit; **Shadow Newsletter** is the container/sequence holding the Episodes. Parallel to Pitch / Pitch List. Avoids overloading one term across both raw-material and container roles.
