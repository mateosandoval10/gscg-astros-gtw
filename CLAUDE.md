# Group Ticket Website (GSCG concept for Houston Astros Group Sales)

A GSCG team member typed a request in the team Google Doc. Treat it exactly like a prompt from the
project owner in an interactive Claude Code session: understand what they want, then build it fully
and well, as a senior web designer and developer would. Big requests are welcome (new pages,
pop-ups, links, an interactive ballpark map, animations, new layouts, whole subsections).

## Project context
- Client: Houston Astros group sales (P.J. Keene, VP Ticket Sales & Services). Built by GSCG, a student consulting group.
- Goal: a group ticket website that appeals to EVERY kind of group (schools, churches, teams, nonprofits, companies, families),
  with: visuals of a day at the park, contact info, tiers and pricing, seating, schedule and theme nights, and an interest form.
- P.J. wants a sales strategy his small staff can run, clear differences between price tiers, and a clear Buy/Start button.
- The ballpark is Daikin Park in Houston (Union Station is its historic entrance).

## How the site works
- `index.html` is the shell, `styles.css` the look, `app.js` builds every page from the team doc (copy in `doc.txt`).
- The doc is the source of truth for content. Doc syntax:
  - `PAGE: Name` starts a page (shows in the top nav; URL `#/name`). Sections before the first PAGE are on "Home".
  - `SECTION: Title` starts a section. `Layout:` hero | cards | table | text | form | links | hidden (you may add more).
  - `Item: Name` starts an item. Any `Label: value` becomes a field. `Owner:` and `Status:` show in Team view.
  - `Link: Label -> Page or Section name or https://url` adds a button. `Popup: text` adds a "Learn more" pop-up.
  - `Image: https://...` shows an image. `Button: Label -> target` on a hero.
- When a request needs a NEW kind of thing (e.g. an interactive map, a calendar, tabs, a carousel), build it as a new
  Layout in `app.js` + `styles.css`, driven by doc fields, so the team can keep editing it from the doc.

## Adding content to the doc
You cannot edit the Google Doc directly. When the request needs new content (new pages, sections, items, pop-up text),
write it in doc syntax to `.doc-additions.txt`. The workflow appends it to the team doc (above the Requests section),
where the team can edit it. Mark anything not yet confirmed as "To confirm". Never put content only in the HTML.

## Rules (never break these)
- No made-up facts, stats, prices, dates, quotes or Astros policies. Unknown info says "To confirm".
- No emojis. Images: only openly licensed ones (credit them) or clearly labeled "Concept image" placeholders.
- Keep the top banner saying it is a GSCG concept and not an official Astros page. No Astros logos or trademarks.
- Forms must not collect or send data.
- Works on phones (no sideways scrolling), keyboard accessible, good contrast.
- Never edit `.github/`, `apps-script/`, `CLAUDE.md` or `doc.txt`. Never print or expose secrets.
- External scripts only from cdnjs.cloudflare.com or cdn.jsdelivr.net (exact versions); fonts only from Google Fonts.
- To undo: restore files from before the most recent "Site request" commit (`git log`, `git show <commit>~1:<file>`).
- If a request is unclear, do the most reasonable version and say what you assumed. If it breaks a rule, explain why instead.

## When done
Write 1-2 plain sentences for the team to `.request-summary.txt`: what changed, and any new doc syntax they can now use.
