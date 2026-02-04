# DayOne-to-Printable

This Node application converts raw JSON data from DayOne journals into an HTML page formatted like a book, which can then be saved as a PDF and uploaded to [Lulu](https://www.lulu.com) publishing.

TODO: Once we've gotten enough precise detail, let the robot do a pass.

## Initial Project Setup

- Clone the repo.
- Run `npm install` in the root to install all dependencies.

## DayOne Export

- Use the mobile app - this gives the best, most reliable export.
- In the app, export the range of days you want in the JSON format. Be sure to download all media being exported.
- Send the resulting `.zip` file to your computer.
- Unzip, and add the contents to the `input` folder in this project.

## Configuration

- TODO: Improve this section post-refactor.
- Open `config.json`.
- Fill in the file info.
  - Specifically the input directory.
- If this is your first time, set `ENTRIES.IMAGES.RUN_RESIZE` to `true`.
  - This only needs to happen once, so once you've run this, set it back to false.

## Running the Renderer

- Run `npm start` to run the image resize (if enabled) and the final HTML render.
- Once it's done, there will be a new `journal.html` in your `output` folder.

## The HTML

- Open `journal.html` in Google Chrome - this is the only browser I've successfully tested in.
- Let it load
  - It will slowly, page by page, construct the journal.
  - Wait until the very last page is visible at the bottom and the vertical size of the page stops growing.
- Print to PDF
  - Using the print dialog, save this web page as a PDF.

## The Initial PDF

- Review the PDF in Preview.
  - (This README assumes you're using Mac.)
- If there are any unexpected gaps - that is, if there are any completely empty columns anywhere - something screwed up with the `pagedjs` HTML render.
  - Refresh the HTML page, let it build again, print to PDF again, and check if the issue is fixed.

## The Second PDF

- Once you're satisfied with your initial PDF, use Preview to "Export" to a new PDF - this will be your final version.
  - Do not export as PDF/A — standard PDF is safer for print; PDF/A is for archival and can interfere with gradients, layers, or transparencies.
  - Do not optimize images for screen — keep full-resolution images for print quality.

## Uploading to Lulu, Part 1

- Create your new book project
- Upload the second and final PDF
  - This should give you no trouble. Hopefully.
- Set up your book.
  - 8.5" x 11"
  - Standard Color
    - Required due to images; sufficient quality for documentary photos and diagrams without excessive cost or ink density.
  - #60 White Uncoated Paper
    - Best balance of readability, image contrast, spine thickness, and long-term durability at high page counts.
  - Hardcover Case Wrap
  - Matte Cover
    - Ages well, minimizes glare and fingerprints, suits archival/reference use.
    - Better for readability, fewer glare issues, more “book-like”.
  - AVOID
    - Premium Color: Unnecessary cost and ink density for mostly-text journals
    - Coated paper: Excess thickness, glare, and binding stress at ~600 pages
    - Cream paper: Reduced contrast for images in multi-column layouts
- Examine the "Cover" section
  - Note:
    - The width (in inches)
    - The height (in inches)
    - The spine witdth (in inches)

## Rendering the cover

- TODO: Improve this section post-refactor.
- Open `config.json`.
- Under `cover.dimensions`, set the width, height and spine width according to the values on the upload page.
- Run `npm start` to re-render everything.
- There will be a new `cover.html` in your `output` folder.
- Open `cover.html` in Google Chrome and print to PDF.

## Uploading to Lulu, Part 2

- Upload the PDF version of the cover to Lulu.
- Let everything load.
- If there's going to be a problem with the big contents PDF, it'll be here.
  - But hopefully I've resolved that.
- If all goes well, a preview will appear of your book at the bottom.
  - Check that the cover lines up properly.
  - Check that the book's contents look correct.
    - Note that, at this stage, all emojis will have been replaced by bullets.

## Finish

- Finish setting up the book.
- Buy a print copy.
