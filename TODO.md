# TODO

## Issues

- [ ] **Switch to parsing the rich text.**
  - [ ] The markdown "text" isn't the source of truth
    - [ ] It's non-authorative and lossy
    - [ ] So we need to learn to parse 
- [ ] Image processing is rotating (unrotating?) some images. (This may be a lost cause)
  - [ ] August 18, 2022, 9:57 AM
  - [ ] July 15, 2023 · 1:35 PM
  - [ ] January 1, 2025, 1:05 PM (Hannibal Lecter)
  - [ ] February 2, 2025, 4:50 PM (4ef2b394fe5008ee1428f2ce2a2bdce9.jpg)
  - [ ] March 22, 2025, 5:43 PM (Bike)
  - [ ] (Check to make sure that some of these weren't just originally oriented wrong.)
- [ ] Emojis don't make it through the Lulu upload process.
  - [ ] Once uploaded, they are replaced with bullets.
- [ ] Now that we know `cheerio` works and it's faster than `jsdom`, replace the use of `jsdom` in `loremIpsum.ts` with `cheerio`.
