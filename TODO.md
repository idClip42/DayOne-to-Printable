# TODO

## Issues

- [ ] Image processing is rotating (unrotating?) some images. (This may be a lost cause)
  - [ ] August 18, 2022, 9:57 AM
  - [ ] July 15, 2023 · 1:35 PM
  - [ ] January 1, 2025, 1:05 PM (Hannibal Lecter)
  - [ ] February 2, 2025, 4:50 PM (4ef2b394fe5008ee1428f2ce2a2bdce9.jpg)
  - [ ] March 22, 2025, 5:43 PM (Bike)
  - [ ] (Check to make sure that some of these weren't just originally oriented wrong.)
- [x] New day markers and date-time metadata are set to `break-after: never`, but this seems to be undermined by `pagedjs`.
  - [x] We'd also want to do this with headers, right below date-time metadata.
  - [x] New day marker example: 2022, Sat Sept 10, Thurs Sept 15
  - [x] I think I've investigated and reorganized as much as I can, and I don't think I can fix this.
- [x] Is there any way at all that we can prevent individual list items from breaking inside *just* their text, not inside their children?
  - [x] (I guess the way to do that would be to wrap them in `<span>`s, and I don't know that I can do that.)
  - [x] Unless there's some way in CSS to specifically indicate tag-less content text.
  - [x] No. It's not an option.
- [ ] Emojis don't make it through the Lulu upload process.
  - [ ] Once uploaded, they are replaced with bullets.
- [x] Entries to use for new tests:
  - [x] Find examples of code blocks in the journal and make tests out of them.
    - [x] Feb 15, 2026, 9:28pm, "Late night return to the book thing"
- [x] Fix code block parsing.
  - [x] Start with the SINGLE_NEWLINE_P shit.
  - [x] Maybe we need to match the larger code block group first?
    - [x] Like, identify blocks of text meant to be part of one code block, and then dig into them after that initial match. Multi-layer find and replace.

## Ideas

- [x] What if we put image HTML directly in the markdown, instead of doing an HTML regex replacer after the fact?
  - [x] Or should we be trying to get HTML *out* of the markdown? Probably that?
    - [x] Yes, that.
- [ ] Do we need to account for when journal entries include `<something>`? Will HTML tag-looking things screw up the MD parser, or will it be fine?
- [ ] Reassess title position on spine. Should it be centered relative to spine edges, or relative to top edge and pre-volume-label accent?
- [ ] Rework the highlighting rules.
  - [ ] We need something more clever.
  - [ ] Is there some unused part of the markdown schema we can use here as a pretend "highlight" tag?
  - [ ] Do we need to extend "htmlReplacers" to support end tags as well? So we can bookend things?
  - [ ] Do we need to not filter the "==" that the journal puts into the markdown, and instead track it down in the final HTML?
- [x] Use `chalk` to color logs.
