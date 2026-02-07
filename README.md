# DayOne-to-Printable

This Node-based project converts raw JSON exports from DayOne into a book‑formatted HTML document, which you then print to PDF and upload to Lulu for physical printing.

This README is written primarily for **future me** (hi 👋), but also for anyone else who journals in DayOne and decides they want a sane, repeatable way to turn years of journaling into real, hold‑in‑your‑hands books.

Assumptions:

* You’re comfortable with Node, npm, and the command line.
* You’re on **macOS**. (Other platforms could work, but PDF handling will likely differ.)
* You are patient. This pipeline works, but parts of it are slow and a little fragile.

This is both a **reproducible pipeline** *and* a **battle‑tested guide**. Some steps exist not because they’re elegant, but because Lulu is extremely picky and opaque about PDFs.

---

## What this project does

* Takes a DayOne JSON export (plus media)
* Normalizes and cleans the content
* Lays it out as a multi‑column, book‑formatted HTML document using pagedjs
* Generates:

  * `journal.html` (interior pages)
  * `cover.html` (full wrap hardcover)
* Lets you print both to PDF and upload them to Lulu

I’ve successfully printed:

* A paperback proof‑of‑concept
* Multiple hardcover volumes with different page counts

Two more hardcover volumes are currently at the printer and *should* be fine.

---

## Initial project setup

* Clone the repository.
* Run:

```bash
npm install
```

The repo includes a default `config.json`.

Notes:

* `input/` is **gitignored**. You must create it yourself.
* `output/` is **gitignored** and will be created automatically.
* The size of this repo is dominated by input media. It is normal for `input/` to be several gigabytes.

---

## Exporting from DayOne

* Use the **DayOne mobile app**. This produces the most reliable exports.
* Export the date range you want **as JSON**.
* Make sure you enable exporting **all media**.
* Transfer the resulting `.zip` file to your computer.
* Unzip it.
* Place the unzipped contents inside the project’s `input` directory.

Example layouts:

* `input/` (unzipped directly)
* `input/2022-2023-export/` (multiple exports kept side‑by‑side)

---

## Configuration (`config.json`)

Open `config.json` and adjust the following sections.

### `files.input`

* `directory`

  * Path to the unzipped DayOne export
  * Usually `"input"` or `"input/your-export-folder"`
* `dataFile`

  * The main DayOne JSON file
  * Almost always `"Journal.json"`
* `photosDirectory`

  * Folder containing exported photos
  * Almost always `"photos"`

### `content`

* `obfuscated`

  * When `true`, all text is replaced with Lorem Ipsum and all images are replaced with empty boxes of the correct size
  * Intended for **previewing layouts without exposing private content**

#### `content.images`

* `runResize`

  * Resizes and normalizes all images used in the journal
  * Safe to leave `true`, but **very slow**
  * Once you’ve run it successfully, you’ll probably want to set it back to `false`

### Missing or problematic media

DayOne exports are imperfect:

* Sometimes images simply fail to export
* Sometimes images are rotated incorrectly

When this happens:

* Warnings will appear in the console during rendering
* The journal will show a placeholder box indicating missing or non‑printable media
* Videos, audio files, and PDFs are **never printed** and will always appear as placeholders

Some rotation issues appear to be arbitrary DayOne bugs and cannot be fixed procedurally.

### `cover.content`

* `author` — your name
* `subtitle` — optional; omitted if empty
* `volume` — **required**

  * This project assumes your journal spans multiple physical volumes
  * Lulu’s limit is ~800 pages per 8.5" × 11" book

### `cover.dimensions`

You will fill these in later, after uploading the interior PDF to Lulu.

Everything else in `config.json` can be ignored.

---

## Running the renderer

Run:

```bash
npm start
```

This does all of the following:

* Resizes images (if enabled)
* Renders the journal interior
* Renders the cover

When finished, the `output/` directory will contain:

* `journal.html`
* `cover.html`
* `photos/` (processed images used by the journal)

---

## Generating the interior PDF

### Viewing the HTML

* Open `output/journal.html` in **Google Chrome**.
* Chrome is the only browser this has been tested with.

  * Safari produces incorrect PDFs.
  * Nothing here is intentionally Chrome‑specific, but Chrome works.

Let the page fully load:

* pagedjs builds the document page by page
* The page will grow vertically
* **Wait until the very last page is visible** and the page height stops changing

### Printing from Chrome

Open the print dialog and ensure:

* Destination: **Save as PDF**
* Scale: **100%**
* Margins: **None**
* Background graphics: **Enabled**

Print to PDF.

---

## Checking the initial PDF

Open the PDF in **Preview** (macOS).

Things to check:

* No completely empty columns anywhere

If you see empty columns:

* This is almost certainly a pagedjs race condition
* Don’t panic
* Reload `journal.html`, let it fully rebuild, and print again

This happens often enough that you should *always* check before moving on.

---

## Creating the final interior PDF

Once the initial PDF looks correct:

* In Preview, use **File → Export** to create a second PDF

Important:

* **Do not** export as PDF/A
* **Do not** optimize for screen

This step exists to make Lulu accept the file without vague, unhelpful errors.
It likely flattens or embeds things slightly differently.

Even after this, Lulu may still warn about transparency. I believe this is an artifact of HTML → PDF conversion and can be safely ignored.

---

## Uploading to Lulu (interior)

Create a new Lulu book project and upload the **final** interior PDF.

Recommended setup:

* Size: **8.5" × 11"** (maximum allowed; the content demands it)
* Print type: **Standard Color**
* Paper: **#60 White Uncoated**
* Binding: **Hardcover Case Wrap**
* Finish: **Matte**

Avoid:

* Premium Color (unnecessary cost and ink density)
* Coated paper (glare, thickness, binding stress)
* Cream paper (reduced contrast for images)

In the Cover section, note:

* Total width (inches)
* Height (inches)
* Spine width (inches)

You’ll need these next.

---

## Rendering the cover

Open `config.json` again.

Under `cover.dimensions`, set:

* `totalWidthIn`
* `heightIn`
* `spineWidthIn`

You can usually ignore `hingeIn`.
It appears to be roughly a quarter inch, but hardcover hinge behavior is somewhat opaque.

Run again:

```bash
npm start
```

This will regenerate everything.

Open `output/cover.html` in Chrome and print to PDF using the same print settings as before.

---

## Uploading to Lulu (cover)

Upload the cover PDF.

Once processing completes:

* A full preview of the book should appear
* Verify:

  * Cover alignment
  * Spine placement
  * Interior layout

Note:

* Emojis appear correctly in the uploaded PDF
* Lulu replaces them with bullets in the preview
* This is unfortunate but currently acceptable

---

## Finish

If everything looks right:

* Complete the Lulu setup
* Order a print copy

Then wait nervously.

When it arrives, you will be holding several years of your life in your hands.
