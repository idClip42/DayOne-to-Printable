# TODO

## Refactor

- [x] Go through the code with Prettier.
- [x] Clean up the code as best as you can.
- [x] We want something that is really, really organized and readable and usable.
- [x] Bring in "Handlebars" for HTML templating, per the conversation with ChatGPT.
- [x] Some of the `config.json` stuff is about design, and should probably be separate from general configuration
  - [x] Stuff that isn't going to change once decided upon.
- [x] Some things in `config.json` might be worth combining.
  - [x] Changing the text to lorem ipsum and making images invisible are part of the same process of obfuscation.
- [x] Is there a way to force `pagedjs` to error out or something if it screws up formatting?
  - [x] No, I'm not even working with it in code.
- [x] I'm leaving TODOs around the code - find them and deal with them.
- [x] Try removing all the page vs screen stuff from the CSS.
- [x] Go around, check how all exported functions are used.
  - [x] If they're used by multiple things in multiple places, they're good.
  - [x] If they're used in one place and simplistic, though... kill 'em.
- [x] Render both books and look over them to make sure everything looks right.

## Issues

- [ ] Image processing is rotating (unrotating?) some images. (This may be a lost cause)
  - [ ] August 18, 2022, 9:57 AM
  - [ ] July 15, 2023 · 1:35 PM
  - [ ] January 1, 2025, 1:05 PM (Hannibal Lecter)
  - [ ] February 2, 2025, 4:50 PM (4ef2b394fe5008ee1428f2ce2a2bdce9.jpg)
  - [ ] March 22, 2025, 5:43 PM (Bike)
  - [ ] (Check to make sure that some of these weren't just originally oriented wrong.)
- [x] Quote blocks avoid breaking inside when they shouldn't
  - [x] Even though paragraphs shouldn't break, quote blocks should be able to break (between paragraphs).
  - [x] What if we added the CSS rule directly on the elements instead of via the stylesheet?
  - [x] ~~Oh, do we need to take all the CSS out of the @page group??~~ Nope.
  - [x] Example: Early 2022, the philosophy thing.
  - [x] **This is happening because we don't have multiple `<p>` paragraphs in quote blocks, we have one with `<br>` separators.**
- [ ] New day markers and date-time metadata are set to `break-after: never`, but this seems to be undermined by `pagedjs`.
  - [ ] We'd also want to do this with headers, right below date-time metadata.
  - [ ] New day marker example: 2022, Sat Sept 10, Thurs Sept 15
- [ ] Emojis don't make it through the Lulu upload process.
  - [ ] Once uploaded, they are replaced with bullets.

## Ideas

- [x] What if we gave those single newline lines (which are treated as part of the `<p>` elements of the text above them) their own `<p>` elements?
  - [x] Figure out how to distinguish between the two, and add a class that sets `top-margin: 0`.
  - [x] This would let the column break on those as well, which would really help with avoiding big blank spaces.
  - [x] You'd probably do it the same way as attachments - see: `getAttachmentMarkdown()`
  - [x] UPDATE: Create the HTML element within the Markdown itself?
    - [x] This is presuming we can regex replace every single-newline line with double-newline HTML blocks, and that'll work for multiple single-newline lines in a row.
    - [x] I’d have to play with the normal paragraph margins too. Have paragraphs have only a top margin and no bottom margin, and kill the top one on the single-newline paragraphs.
    - [x] Test these changes by highlighting the modified elements in a color.
- [ ] Take another pass at the single newline lines.
  - [ ] Right now, it's an involved HTML creation process that has a lot of special steps and doesn't cover quote blocks.
  - [ ] Maybe we *should* look into doing everything as paragraphs and just tagging them with some arbitrary thing that we search for later, like we had with the attachments.
- [ ] Consider rewriting `src/entry/internal/content/internal/text/process.ts`
  - [ ] This is a big job.
  - [ ] We'll need to produce a test markdown that features every single issue we've ever seen, and a parallel test markdown that shows what it should look like when done.
    - [ ] Have it write results files for easy perusal, maybe.
    - [ ] Multiple test files
      - [ ] Individual files for individual groups of rules
        - [ ] Actually, **just do unit tests.**
          - [ ] `testA.input.md`
          - [ ] `testA.expected.md`
          - [ ] Something like that.
      - [ ] And a file that covers everythihng
    - [ ] Render a diff
  - [ ] We should have done this a while back - **that whole stack needs to be testable.**
  - [ ] Once you have that test framework, then you can rewrite the rules.
  - [ ] Break up the rules into categories - separate files, maybe.
- [ ] What if we put image HTML directly in the markdown, instead of doing an HTML regex replacer after the fact?
  - [ ] Or should we be trying to get HTML *out* of the markdown? Probably that?
- [ ] Do we need to account for when journal entries include `<something>`? Will HTML tag-looking things screw up the MD parser, or will it be fine?
