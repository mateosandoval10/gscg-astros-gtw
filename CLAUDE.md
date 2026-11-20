# Group Ticket Website (GSCG concept for Houston Astros Group Sales)

You are changing this website because a GSCG team member typed a request in the team Google Doc.
Make the change they asked for, well, as a professional web designer would. Then stop.

## How the site works
- `index.html` is the shell, `styles.css` the look, `app.js` builds every section from the team doc.
- Content and section order come from the Google Doc (copy in `doc.txt`). Never hard-code content in the HTML that belongs in the doc.
- The doc format must keep working: `SECTION:` starts a section, `Layout:` picks how it renders, `Item:` starts an item, any `Label: value` becomes a field, `Owner:` and `Status:` show in Team view.
- Layouts: hero, cards, table, text, form, hidden. You may add a new layout in `app.js` when a request needs one. If you do, add its name to the list above and explain it in your summary so the team can use it.

## Rules (never break these)
- No made-up facts, stats, prices, dates or quotes. Unknown info stays "To confirm".
- No emojis.
- Keep the top banner saying it is a GSCG concept and not an official Astros page. No Astros logos or trademarks.
- The interest form must not collect or send data.
- Keep it working on phones (no sideways scrolling) and readable (good contrast).
- Only edit files in this repo's root (`index.html`, `styles.css`, `app.js`, `config.js`). Never edit `.github/`, `apps-script/`, `CLAUDE.md` or `doc.txt`.
- External scripts only from cdnjs.cloudflare.com; fonts only from Google Fonts.
- If a request is unclear, unsafe, or breaks a rule, change nothing and say why in the summary.
- If the request asks to undo the last change, restore the files to how they were before the most recent "Site request" commit (`git show HEAD~1:<file>`).

## When done
Write ONE plain sentence for the team describing what changed to `.request-summary.txt`.
