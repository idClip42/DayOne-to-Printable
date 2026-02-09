# Part 1: Proposed Pipeline Phases (single-home rules)

Think of this like a Markdown → “Markdown-plus” → HTML compiler with cleanup passes.

## **Phase 0 — Input Sanitization (DayOne Weirdness)**

**Goal:** Normalize clearly-invalid or nonstandard input before anything semantic happens.

**Rules that live here:**

* ~~U+2028 line separator → `<br>`~~
  * This will ideally one day be in here
  * But for now it must come after the paragraph HTML wrapper happens.
* Escaped horizontal rules (`\-\-\-` → `---`)
* Unicode bullets (`•` → `-`)
* Blank blockquote lines with CR (`> \r` → fixed)

**Why first**

* These aren’t “formatting decisions”
* They’re “this isn’t even Markdown” fixes
* Later phases assume sane characters and line breaks

📁 `sanitizeInput.ts`

## **Phase 1 — Structural Guards (Prevent Parser Bleed)**

**Goal:** Add *defensive spacing* so Markdown constructs don’t leak into adjacent content.

**Rules here:**

* Header line isolation (extra newline after `#`)
* Ensure blockquotes don’t absorb following paragraphs
* Enforce paragraph breaks after list items when followed by text
* Ensure spacing before/after images (generic case)

**Why now**

* This phase *adds whitespace*, not removes it
* It sets “hard boundaries” that later rules rely on
* Must happen before newline collapsing or `<br>` insertion

📁 `guardStructure.ts`

## **Phase 2 — List Integrity Repair**

**Goal:** Make sure lists are parsed as lists and *stay intact*.

**Rules here:**

* Fix excessive newlines before list items
* Repair list-breaking image spacing inside lists
* Normalize bullets (already sanitized, but semantics live here)

**Why separate from Phase 1**

* Phase 1 creates spacing
* Phase 2 selectively *removes or reshapes* spacing **only for lists**
* Keeps list logic centralized (important — lists are fragile)

📁 `lists.ts`

## **Phase 3 — Blockquote Normalization**

**Goal:** Make blockquotes behave predictably and be single-level.

**Rules here:**

* Flatten multi-tier blockquotes
* Preserve intentional line breaks *inside* quotes
* Normalize empty quote lines
* Fix horizontal rules inside quotes

**Why its own phase**

* Quotes interact badly with `<br>`, lists, and images
* Centralizing quote logic avoids “fix → undo → re-fix” patterns

📁 `blockquotes.ts`

## **Phase 4 — Attachment & Image Resolution**

**Goal:** Replace DayOne placeholders with real content *before formatting finalization*.

**Rules here:**

* Resolve `dayone-moment:` image references
* Replace non-photo attachments with fallback markdown

**Why here**

* Once attachments are resolved, they behave like normal Markdown
* Later phases shouldn’t need to know what “DayOne” is

📁 `attachments.ts`

## **Phase 5 — Code Normalization**

**Goal:** Restore code blocks and inline code to something sane and literal.

**Rules here:**

* Merge fragmented fenced code blocks
* Normalize fenced code contents (remove `<br>`, collapse newlines)
* Clean stray backslashes in inline code

**Why before line-break semantics**

* Code must be *opted out* of paragraph and `<br>` logic
* This phase “freezes” code semantics

📁 `code.ts`

## **Phase 6 — Escape Cleanup (Non-Code)**

**Goal:** Remove leftover escape artifacts where Markdown should be literal.

**Rules here:**

* Backslash cleanup in URLs
* Backslash cleanup in blockquote lines (non-code)

**Why after code**

* Code already opted out
* Everything else should now be literal text

📁 `escapes.ts`

## **Phase 7 — Line-Break Semantics**

**Goal:** Decide what single newlines *mean*.

**Rules here:**

* Single newline → `<br>` (structure-aware)
* Insert `<br>` inside blockquotes where appropriate

**Why late**

* All structure must already be correct
* This phase is semantic, not structural
* Many later rules exist solely to clean up after this

📁 `lineBreaks.ts`

## **Phase 8 — Single-Newline Paragraph Promotion**

**Goal:** Turn soft line breaks into *explicit semantic HTML blocks*.

**Rules here:**

* `<br>…` → templated `<p class="single-newline">`
* Recursive markdown parsing for that content

**Why isolated**

* This is HTML-aware, not Markdown-aware
* It’s the first place where “Markdown → HTML” truly happens

📁 `singleLineParagraphs.ts`

## **Phase 8.5**

U+2028 line separator → `<br>`

## **Phase 9 — Highlight & Formatting Extensions**

**Goal:** Apply nonstandard Markdown extensions cleanly.

**Rules here:**

* `**==highlight==**` → `<strong><mark>`
* `==highlight==` → `<mark>`

**Why late**

* These generate raw HTML
* Should not be touched by Markdown parsing later

📁 `extensions.ts`

## **Phase 10 — Post-Processing Cleanup**

**Goal:** Undo known side effects from earlier phases.

**Rules here:**

* Quote `<br>` cleanup pass (both steps)
* Any “we know this is garbage now” fixes

**Why explicitly last**

* This is where intentional corruption gets repaired
* Makes the pipeline honest: *yes, we break things earlier*

📁 `cleanup.ts`

# Part 2: Plain-English Conceptual Pipeline

This is the **mental model** version — no regex, no implementation.

### 1. Normalize broken characters and impossible Markdown

* ~~Replace weird line separators with normal breaks~~
  * This will ideally one day be in here
  * But for now it must come after the paragraph HTML wrapper happens.
* Convert Unicode bullets into real list markers
* Fix escaped syntax that should have been literal
* Repair malformed empty quote lines

> “Make the input text something Markdown *could* plausibly understand.”

### 2. Protect major Markdown structures from bleeding

* Ensure headers fully terminate
* Ensure blockquotes don’t accidentally absorb following text
* Ensure lists don’t absorb following paragraphs
* Ensure images aren’t glued to text

> “Put walls between structural blocks.”

### 3. Repair lists so they survive formatting

* Remove excessive blank space that breaks lists
* Fix images that accidentally terminate list nesting
* Normalize bullet syntax consistently

> “Lists are brittle; treat them carefully and centrally.”

### 4. Normalize blockquotes into a predictable form

* Enforce single-level quoting
* Preserve intentional line breaks inside quotes
* Normalize empty quoted lines
* Fix special cases like horizontal rules inside quotes

> “Quotes should be simple, flat, and readable.”

### 5. Resolve DayOne-specific attachments

* Replace placeholder image references with real file paths
* Replace non-image attachments with fallback text

> “After this step, the document no longer knows what DayOne is.”

### 6. Restore code to literal text

* Merge fragmented fenced code blocks
* Remove formatting artifacts inside code
* Normalize spacing inside code blocks
* Clean escapes inside inline code

> “Code is sacred. Nothing else should touch it.”

### 7. Remove leftover escape artifacts in normal text

* Clean URLs
* Clean quoted text
* Leave code untouched

> “If a backslash is still here, it’s probably wrong.”

### 8. Decide what single newlines mean

* Convert single line breaks into explicit `<br>`
* Preserve structure-aware exceptions (lists, quotes, tables)

> “A single newline is a *line break*, not a paragraph.”

### 9. Promote soft line breaks into semantic paragraphs

* Identify runs of text separated by `<br>`
* Parse them as standalone Markdown
* Wrap them in a special paragraph structure for layout control

> “This looks like a paragraph — treat it like one, but mark it special.”

## **Phase 9.5**

Replace weird line separators with normal breaks

After deciding which text is a paragraph and which is not,
replace any remaining “mystery line separators” with simple line breaks
so they render correctly without changing structure.

### 10. Apply formatting extensions

* Convert DayOne highlight syntax into real HTML

> “These are authorial intent, not Markdown structure.”

### 11. Clean up known collateral damage

* Remove unwanted `<br>` inside quotes
* Normalize quote spacing one last time

> “Sweep the glass from earlier decisions.”