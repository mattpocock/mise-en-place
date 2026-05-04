# Mise en Place

A working environment for Matt Pocock's content and education business. Names the raw materials, channels, and deliverables of the work so that Matt and AI agents can speak the same language.

## Language

### The core unit

**Note**:
An atomic Markdown file that captures one original thought. The fundamental unit of value in the business — the layer between Channels and Deliverables. Notes are flat (no stage or ripeness), connected via wikilinks, and explored via graph view. Stale Notes are purged, not demoted. Every Note is currently characterised as either a **Hook** or a **Brick** (a role, not a stage — it can change).
_Avoid_: Zettel (jargon), Idea (too vague), Card

**Hook**:
A Note with enough opinion, surprise, or claim-strength to anchor a Pitch on its own. Hooks are the Notes that "could be a YouTube video by themselves." A Pitch must contain at least one Hook. A Hook can also live inside a Course alongside Bricks.
_Avoid_: Pitch Note, Headline, Punch

**Brick**:
A Note that has substance but no hook strong enough to drive a Pitch — explanatory, definitional, observational, structural. Bricks are not lesser Notes; they are differently-shaped ones, load-bearing inside Courses and longer Deliverables. A Brick can be promoted to a Hook later if a hook-shaped angle on it emerges.
_Avoid_: Filler, Body, Substrate, Foundation, Building Block

### Channels

**Channel**:
A bidirectional medium through which content flows. Material arrives via a Channel and feeds Notes or Tasks; outbound material flows the other way. The same Channel typically serves both directions. Channels are characterised by what they feed: a **Task Channel**, a **Note Channel**, or both. Some are inbound-only; some are outbound-only. The "flowing" framing is deliberate: a Channel is a stream, not a static well.
_Avoid_: Source (too static), Input (overloaded), Feed, Surface (we use Channel for both directions), Placement (marketing taint)

**Task Channel**:
A Channel whose inbound material is predominantly Task-shaped — requests, reminders, items needing action. Examples: Email, WhatsApp. Capture from a Task Channel typically yields a Task rather than a Note. A Channel can be both Task-feeding and Note-feeding (e.g. Todoist Inbox, Repo issues).
_Avoid_: Inbox (too narrow — Todoist Inbox is one Task Channel, not the category)

**Note Channel**:
A Channel whose inbound material is predominantly Note-shaped — ideas, observations, claims worth keeping. Examples: books, shower thoughts, others' tweets, conversations. Capture from a Note Channel yields a Note.
_Avoid_: Idea Stream, Source

**Triage Queue**:
A Channel — inbound-only, mixed Task/Note-feeding — where Captured material lands before it has a home, to be promoted into a Note or projected into a properly-placed Task. Items arrive from multiple capture routes (Pixel Watch reminders, manual typing, voice notes, forwarded emails). Captures that already know their home (a book quote written straight into a Note file, an issue filed directly to its Repo) skip the Triage Queue entirely. Currently implemented as the Todoist Inbox; distinct from the structured planning sections of Todoist, which hold already-triaged Tasks. A non-empty Triage Queue at rest is one face of **Work Dirty**.
_Avoid_: Triage (the act, not the place), Inbox (overloaded with email), Todoist Inbox (the implementation, not the concept), Staging Surface, Holding Pen

**Repo**:
A software repository Matt maintains — currently all open-source — acting as a bidirectional Channel: issues, PRs, and discussions flow in (Capture material); code and releases flow out. Repos also serve as concrete demo material inside Courses. A Repo requires ongoing Maintenance (see Tasks) which is necessary to keep the Channel alive but doesn't directly produce Notes or Deliverables.
_Avoid_: Project (too vague), Library/Tool/Package (too narrow)

### Deliverables

**Deliverable**:
Anything shipped to an audience that is derived from one or more Notes. A Deliverable lands on one or more Channels, each with its own Packaging. Every Deliverable plays one of two roles: **Revenue Deliverable** or **Audience Deliverable**.
_Avoid_: Output (too generic), Artifact

**Revenue Deliverable**:
A Deliverable that operates on the number — directly converts current audience into money. Currently: **Course**, **Cohort**. Failure has immediate consequence (lower earnings this month), so Revenue Deliverables feel urgent — which is the trap: their urgency biases attention away from the Audience side, starving the multiplier.
_Avoid_: Paid Deliverable (names the price, not the role), Earner

**Audience Deliverable**:
A Deliverable that operates on the multiplier — grows the audience that future Revenue Deliverables convert against. Currently: **Landscape Video**, **Short**, **Article**, **Newsletter**, **Tweet**, **Shadow Newsletter**. Failure has compounding rather than immediate consequence, so under-investment is invisible day-to-day and devastating over a year. Naming the role (rather than calling these "free") prevents the label from quietly denigrating the multiplier.
_Avoid_: Free Deliverable (denigrates by naming what's missing rather than what's there), Reach, Top-of-Funnel

**Course**:
A structured, paid educational product hosted on AI Hero, authored via the Course Video Manager. Composed of Bricks and (sometimes) Hooks.

**Cohort**:
A time-bounded, live-taught variant of a Course.

**Landscape Video**:
A 16:9 recorded video, typically long-form. Lands on YouTube, Twitter, LinkedIn, and the AI Hero CMS. The aspect ratio dictates the Channel set — these are the platforms that accept landscape and where Matt has audience.

**Short**:
A 9:16 vertical video. Eligible Channels are TikTok, YouTube Shorts, and Instagram Reels; active Channels are TikTok and YouTube Shorts (Instagram has no audience traction). A Short Hook must land in ~3 seconds, which constrains the Hook differently from a Landscape Video.

**Article**:
A long-form written piece published on the AI Hero CMS, typically _adapted_ from a Landscape Video's transcript rather than composed from Notes from scratch. Lives alongside the embedded video on AI Hero.

**Newsletter**:
An email sent to subscribers, typically _adapted_ from a Landscape Video's transcript. Each issue is a transcript-derived item, not a from-scratch write-up.

**Tweet**:
A short post shipped to the Twitter Channel.

**Shadow Newsletter**:
An evergreen email drip sequence — a fixed series of episodes that every new subscriber receives in order, regardless of when they joined. Structurally distinct from **Newsletter**, which is broadcast: a Newsletter issue ships once to all subscribers; a Shadow Newsletter episode ships continuously to each new subscriber on schedule. Failure mode is **outgrowth**, not depletion — long-engaged subscribers reach the end of the sequence and run out, so the sequence must be longer than the typical retention window. An **Audience Deliverable**.
_Avoid_: Drip (too generic), Onboarding Sequence (collides with course-onboarding terminology), Welcome Sequence, Evergreen Newsletter

### Pitch

**Pitch**:
A candidate Deliverable in pre-production: at least one Hook plus the Bricks needed to give it loose structure, plus a working angle, working title, and thumbnail concept. The Hooks and Bricks themselves provide the structure for filming — there is no separate script step. A Pitch is lightweight, reversible, and meant to be killed cheaply. It is the test object for whether an idea is worth recording: if you can't package a Pitch, you don't have one. Per-Channel Packaging variants are not part of a Pitch — only the core layer derived from the Hook(s).
_Avoid_: Concept (too vague), Treatment (jargon), Idea, Topic, Script (no separate script step exists)

**Pitch List**:
The collection of current Pitches — the candidate pool from which **Scheduling** draws when committing a Pitch to the **Deliverable Calendar**. The place to compare Pitches against each other, prioritise, and decide what to Film next. Part of the **Inventory**; failure mode is **depletion** (Films drain it). Distinct from the **Deliverable Calendar**: the Pitch List holds unscheduled candidates; the Calendar holds committed ships.
_Avoid_: Backlog, Queue, Pipeline, Content Calendar (the Pitch List is upstream of the Calendar, not the same thing)

### Deliverable Calendar

**Deliverable Calendar**:
The forward-looking schedule of committed **Deliverable** ships — each entry pairs a Deliverable (or Deliverable-to-be) with a ship date and target **Channel(s)**. Holds entries that originate from the **Pitch List** (a Pitch scheduled for Film) _and_ entries that don't (a Newsletter or Article adapted from a Filmed Pitch, a Shadow Newsletter episode, a standalone Tweet). The output of **Scheduling**; the source of truth for "what ships when". Part of the **Inventory** — its own outbound queue with its own failure mode, alongside the Pitch List and Shadow Newsletter.
_Avoid_: Content Calendar (vague — "content" is undifferentiated; we ship Deliverables), Editorial Calendar (publishing-jargon, implies an editor role that doesn't exist here), Schedule (overloaded), Roadmap (product-jargon)

### Packaging

**Packaging**:
The selling layer of a Deliverable on a given Channel — the bits that decide whether someone clicks, opens, or reads. Derived from the Pitch's Hook(s): the Hook's central claim becomes the title, its surprise becomes the thumbnail, its tension becomes the framing copy. Universal across Deliverables but shaped per Channel: for a long-form video, Packaging includes the YouTube title + thumbnail, the framing text on Twitter and LinkedIn, and the title + description on the AI Hero CMS. Core Packaging (title, thumbnail concept) lives on the Pitch; per-Channel variants are produced at ship time.
_Avoid_: Marketing copy, Promo, Metadata

### Prep

**Prep**:
Work that doesn't ship to an audience but makes shipping possible — Capture, planning, admin, Repo upkeep, anything that keeps the system functional. The repo name _mise en place_ refers to the prep state itself; everything inside this repo is the prep environment. Distinguished from **Ship**.
_Avoid_: Backstage, Setup, Groundwork, Overhead (too pejorative — some Prep is high-leverage)

**Task**:
A discrete, schedulable unit of work — the kind of thing that lives as a Todoist row. A Task is either Prep or Ship; production work (e.g. filming a Pitch) is also a Task and may reference its Pitch as metadata. Tasks carry attributes — due date, project, recurrence — rather than subtypes; the categorisation lives in Todoist's own structures (sections, labels, dates), not in this glossary.
_Avoid_: To-Do, Action, Errand, Chore, Job

**Capture**:
The act of attending a Channel and pulling material out of it. Material yields a Note (when it's an idea worth keeping) or a Task (when it's something that needs doing); a single piece of material can produce both. Has two modes: **Opportunistic Capture** — happens whenever a Channel flows past you (a tweet, a comment, a mid-walk thought) and is grabbed in the moment; **Deliberate Capture** — a scheduled session where you go to specific Channels with intent to extract (the morning Capture & Note Work block). Both are Capture; they have different rhythms and target different Channels.
_Avoid_: Jot, Log, Save

**Repo Maintenance**:
The ongoing work required to keep a Repo functional and usable by others — issue triage, PR review, dependency updates, releases, bug fixes. Necessary for the Repo to remain alive as a Channel, but does not directly produce Notes, Pitches, or Deliverables. An honest cost of having Repos at all; an agent prioritising business-value work should treat Maintenance as overhead rather than primary output.
_Avoid_: Upkeep, Admin, Housekeeping

**Analytics Review**:
A bounded daily Prep Task: read yesterday's numbers across Channels (YouTube, Twitter, AI Hero CMS, newsletter, etc.) to maintain a felt sense of what's resonating and what's not. Yields signals — most ephemeral, occasionally a Note when a pattern is striking. Time-boxed deliberately; the failure mode is **Graze**. Scope is narrow on purpose ("Analytics Review" cannot honestly be expanded to include scrolling Twitter); when other disciplined Channel-observation Tasks emerge, they get their own specific names rather than a generic umbrella.
_Avoid_: Pulse Check (too generic, easy to rationalise Graze into), Numbers Check, Daily Read

**Inventory**:
The collection of outbound queues that feed Ship: the **Pitch List**, the **Shadow Newsletter** sequence, the **Deliverable Calendar**, and any other queue of pre-built or pre-committed items. Distinct queues have distinct failure modes — Pitch List depletes (Films drain it); Shadow Newsletter is outgrown (subscribers reach the end); Deliverable Calendar **thins** (lookahead window of committed ships shrinks below target). A shallow Inventory at **Scheduling** time is one face of **Work Dirty**: the decision was honest, but the supply was bankrupt.
_Avoid_: Supply, Backlog (loaded with software-dev connotations), Pipeline, Stockpile

**Inventory Check**:
A bounded periodic Prep Task — parallel in shape to **Analytics Review** but pointed at outbound rather than inbound: walk each queue in the Inventory, assess depth against its failure mode (depletion, outgrowth, or thinness), and yield Tasks for any queue running shallow. Time-boxed; doesn't include the topping-up work itself, only the check that surfaces the need.
_Avoid_: Stock Check, Larder Check (kitchen-cute but unfamiliar), Supply Review (corporate-mush), Depth Check

**Scheduling**:
The activity of choosing what Ships next, in what mix, against the **Revenue/Audience** split, and committing those choices to the **Deliverable Calendar**. Operates at multiple cadences (weekly tactical: which Pitch is Filmed this week; quarterly strategic: what's the Revenue/Audience ratio this quarter) — same discipline, different granularity. A Prep Task, not a Ship Task: Scheduling decides what to Ship, it doesn't Ship anything itself. Honest Scheduling depends on a healthy **Inventory** — Scheduling without an Inventory Check is wishful thinking.
_Avoid_: Planning (too generic), Programming (broadcasting jargon), Plotting, Routing

**Graze**:
Pathological Channel attention — engaging with a Channel without yielding a Note or a Task. Capture's shadow: it looks like attending to a Channel productively, but produces nothing. Boredom-triggered: Twitter scroll that captures nothing, refreshing an empty inbox, opening Stripe at 11pm. Naming this matters because an agent can recognise it ("user opened Twitter 20 minutes ago, no Capture logged — likely Graze") and Matt can recognise it in himself. Distinct from Analytics Review, which is bounded and yields signals. The Ship-triggered cousin is **Lurk**. A specific shape of **Work Dirty**.

**Lurk**:
A specific sub-type of Graze — compulsively checking the engagement signal on a freshly-shipped Deliverable in the early window (~first 30 min), before the signal has settled. Cross-Deliverable: applies to Tweets, Landscape Videos, Shorts alike. Powered by a noisy early signal (e.g. likes-per-minute) that the brain treats as decision-relevant when it isn't — the only honest read is the post-settling one that **Analytics Review** delivers. Lurk is the dissociated, sideline-watching quality of being a helpless observer of your own post's reception. An agent can recognise it ("user shipped a Tweet 12 min ago and has reopened Twitter 4 times — likely Lurking"). The fact that deletion remains available is what makes Lurk feel decision-relevant; it isn't. Like Graze, a specific shape of **Work Dirty**.
_Avoid_: Hover, Echo Check, Vanity Loop, Doomscroll (implies negative content; Lurk's signal is often positive)
_Avoid_: Lurk (too neutral), Doomscroll (implies negative content), Drift, Idle Check

### Ship

**Ship**:
Work that produces or releases a Deliverable — Film, Adapt, and the act of posting a Deliverable to a Channel. Distinguished from **Prep**. Used in the software-shipping sense: "shipping" includes the building, not only the final hand-off.
_Avoid_: Service (restaurant-jargon, doesn't carry to the work itself), Production, Launch, Release

**Film**:
The act of recording a Landscape Video (or Short) using the Pitch's Hooks and Bricks as loose structure. Always the first production step — Articles and Newsletters are adapted from the transcript afterwards, never written from scratch.
_Avoid_: Record (collides with course-video-manager terminology), Shoot

**Adapt**:
The act of transforming a Landscape Video's transcript into a different-format Deliverable — an Article for the AI Hero CMS, or a Newsletter for email. Adaptation is reformatting, not re-authoring: the underlying ideas are the Pitch's; Adapt fits them to a Channel's shape.
_Avoid_: Derive (too mathematical), Repurpose, Spin out

### Discipline

**Work Clean**:
The discipline of keeping the Prep environment ordered before and during Ship — on the **inbound** side: Channel attention always yielding, the **Triage Queue** at zero. On the **outbound** side: a healthy **Inventory** (Pitch List topped up, Shadow Newsletter not outgrown) and a Pitch's Prep finished before Filming starts. Lifted from Dan Charnas's _Work Clean_, which transposes kitchen mise en place onto knowledge work; the repo name commits to the metaphor and this term names the active practice. Used as a verb ("Work Clean before filming") and as a state ("the workspace is Clean"). Charnas's wider framing (the first move, open hands, etc.) is adopted wholesale even where not yet operationalised here.
_Avoid_: Mise (collides with the repo name), Stationed, Clean Hands (too narrow), Tidy

**Work Dirty**:
The umbrella failure mode — failing to Work Clean. Concrete shapes:

- **Inbound**: dirty Channel attention (**Graze**, and its post-Ship sibling **Lurk**); non-empty **Triage Queue** at rest
- **Outbound**: shallow **Inventory** at **Scheduling** time (a queue is depleted or outgrown when Ship arrives); a Pitch whose Prep is incomplete when Ship starts

Naming the umbrella connects existing pathology vocabulary (Graze, Lurk) to the positive principle and makes it possible to ask "in what shape am I Working Dirty right now?" rather than diagnosing each pathology separately.
_Avoid_: Working Messy, Slop, Disorganised, In the Weeds (overloaded with restaurant jargon, opposite valence to Charnas's usage)

## Relationships

- A **Channel** is bidirectional: material flows in (feeding **Notes** or **Tasks** via **Capture**) and **Deliverables** are shipped out
- Every **Note** is currently a **Hook** or a **Brick** — a role, not a stage; can change
- A **Pitch** contains at least one **Hook** and zero or more **Bricks**
- **Notes** are connected to each other via wikilinks
- A **Pitch** is realised into a **Deliverable** when committed to production
- **Bricks** flow into **Courses** and longer Deliverables; **Hooks** can also feature there
- A **Deliverable** lands on one or more **Channels**, each with its own **Packaging**
- Core **Packaging** is derived from the **Hook(s)** in the **Pitch**; per-**Channel** variants are added at ship time
- The same platform — e.g. **Twitter** — is one **Channel** that serves both directions: others' tweets arrive via it (Capture material), Matt's tweets ship to it (Deliverables)
- A **Repo** is a kind of **Channel**: issues/PRs/discussions feed **Notes** or **Tasks** via **Capture**; code and releases ship out
- A **Repo** can be the subject of a **Pitch** and can appear as a demo inside a **Course**
- A **Repo** requires **Repo Maintenance** to remain a viable **Channel** — overhead, not direct business output
- The **Triage Queue** is a **Channel** in its own right (currently the Todoist Inbox), not a slot inside another Channel — material from many Channels flows into it via **Capture**, then leaves it via Triage
- Every **Deliverable** is either a **Revenue Deliverable** or an **Audience Deliverable** — the role determines which feedback loop applies (immediate revenue vs compounding audience growth)
- The **Inventory** is the union of outbound queues — currently the **Pitch List**, the **Shadow Newsletter** sequence, and the **Deliverable Calendar**; **Inventory Check** is the bounded Prep Task that surfaces shallow queues, parallel in shape to **Analytics Review**
- **Scheduling** moves Pitches from the **Pitch List** onto the **Deliverable Calendar** with a date and target **Channel(s)**; it depends on a healthy **Inventory** to be honest rather than wishful
- The **Deliverable Calendar** also holds entries that didn't originate on the **Pitch List** — adapted **Newsletters** and **Articles** derived from a Filmed Pitch, **Shadow Newsletter** episodes, standalone **Tweets**
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
