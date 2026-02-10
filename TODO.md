# TODO

- Commands
  - Add Artist
    - [ ] Allow pasting of entire MB link, and just slice the artist id out (makes Mobile use easier)
    - [ ] Include external links as properties on the file.
    - [ ] Include all releases in the artist page.
      - [ ] Store releases under different headers for the category (## Albums, ## Singles, etc.)
  - Recommend Album
    - [ ] When an artist is selected, if the album selection fails for any reason, go back to Artist selection.
    - [ ] Add a check for whether the command is running on Mobile or Desktop and adjust styling accordingly.
      - [ ] Desktop: Render with the album cover in a column on the left, then a column with details (artist + album names, external links)
      - [ ] Mobile: Render everything as a single column (Modal header is the Artist name?). Then render album name and links below
  - Recommend Artist
    - [ ] Add a new command to recommend an artist instead of just an album (allows for artists without proper albums to be recommended)
  - Update Artists
    - [ ] Run (on a 1s interval) a query against MusicBrainz per artist and re-build their page.
