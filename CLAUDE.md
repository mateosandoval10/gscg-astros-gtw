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
- `index.html` is the shell, `styles.css` the look, `app.js` builds every section from the team doc, `stadium.js` draws the
  interactive Daikin Park diagram. `template.md` is a copy of the doc's starting content (the live doc may differ).
- The team doc is a NORMAL Google Doc. The site receives it as text: Heading 1 = `# Title` (a part of the website),
  Heading 2 = `## Title` (an item), bullets = `- text`, short `Label: value` lines = labeled details, everything else = text.
- `app.js` picks how to show each Heading 1 by its title (Welcome = hero, Why = benefits, Experiences = cards with pop-ups,
  Tiers/Pricing = tier cards, Seating = stadium map, Schedule = timeline, A day at the park = journey, Rewards = ladder,
  Contact, Interest form, FAQ = accordion). Unknown headings get a generic card layout. Add new kinds in `KINDS` + `R`.
- Seating areas on the map match Heading 2 names in the Seating section (Field Box, Mezzanine, View Deck, Crawford Boxes,
  Outfield Deck I, Outfield Deck II, Bullpen, Union Station).
- New features (galleries, calendars, tabs, maps, more pages) should be built so the team keeps editing their content in the doc.

## Adding content to the doc
You cannot edit the Google Doc directly. When a request needs new content, write it to `.doc-additions.txt` using
`# Heading 1`, `## Heading 2`, `- bullets`, `Label: value` and plain lines. The workflow inserts it into the doc above the
Requests heading with real heading styles. Mark anything unconfirmed "To confirm". Never put content only in the HTML.

## Rules (never break these)
- No made-up facts, stats, prices, dates, quotes or Astros policies. Unknown info says "To confirm".
- No emojis. Images: only openly licensed ones (credit them) or clearly labeled "Concept image" placeholders.
- Keep the top banner saying it is a GSCG concept and not an official Astros page. No Astros logos or trademarks.
- Forms must not collect or send data.
- Works on phones (no sideways scrolling), keyboard accessible, good contrast.
- Never edit `.github/`, `apps-script/`, `tools/`, `CLAUDE.md` or `template.md`. Don't commit `node_modules`. Never print or expose secrets.
- External scripts only from cdnjs.cloudflare.com or cdn.jsdelivr.net (exact versions); fonts only from Google Fonts.
- To undo: restore files from before the most recent "Site request" commit (`git log`, `git show <commit>~1:<file>`).
- If a request is unclear, do the most reasonable version and say what you assumed. If it breaks a rule, explain why instead.

## Quality bar
This site will be presented to an MLB club. Every request must look like a polished, professional product, not a sketch.
For visual work, take screenshots with `node tools/screenshot.mjs "#section-id"` and Read them. Iterate until it looks great on
desktop and phone. A ballpark map, for example, should look like a real stadium diagram (seating bowl in tiers, field,
named areas), not a cartoon diamond.

## When done
Write 1-2 plain sentences for the team to `.request-summary.txt`: what changed, and any new doc syntax they can now use.
