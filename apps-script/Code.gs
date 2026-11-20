/** @OnlyCurrentDoc */
// Team doc script. The website reads this doc live through doGet. GitHub reports AI progress through doPost.
// Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone. No keys or tokens are stored here.

function onOpen() {
  DocumentApp.getUi().createMenu('Website').addItem('Open the website', 'openSite').addToUi();
}

// Doc -> plain text the website understands: Heading 1 = "# ", Heading 2 = "## ", bullets = "- ".
function docText() {
  const body = DocumentApp.getActiveDocument().getBody(), out = [];
  for (let i = 0; i < body.getNumChildren(); i++) {
    const el = body.getChild(i), type = el.getType();
    if (type === DocumentApp.ElementType.LIST_ITEM) { out.push('- ' + el.asListItem().getText()); continue; }
    if (type !== DocumentApp.ElementType.PARAGRAPH) continue;
    const p = el.asParagraph(), t = p.getText(), h = p.getHeading();
    if (h === DocumentApp.ParagraphHeading.HEADING1) out.push('# ' + t);
    else if (h === DocumentApp.ParagraphHeading.HEADING2) out.push('## ' + t);
    else if (h === DocumentApp.ParagraphHeading.HEADING3) out.push('### ' + t);
    else out.push(t);
  }
  return out.join('\n');
}

function doGet() {
  return ContentService.createTextOutput(docText()).setMimeType(ContentService.MimeType.TEXT);
}

// Writes markdown-style lines into the doc with real headings and bullets.
function writeLines(body, at, lines) {
  lines.forEach(function (l, k) {
    const idx = at === null ? null : at + k;
    if (/^- /.test(l)) { const li = idx === null ? body.appendListItem(l.slice(2)) : body.insertListItem(idx, l.slice(2)); li.setGlyphType(DocumentApp.GlyphType.BULLET); return; }
    const m = l.match(/^(#{1,3}) (.*)$/);
    const p = idx === null ? body.appendParagraph(m ? m[2] : l) : body.insertParagraph(idx, m ? m[2] : l);
    p.setHeading(m ? [null, DocumentApp.ParagraphHeading.HEADING1, DocumentApp.ParagraphHeading.HEADING2, DocumentApp.ParagraphHeading.HEADING3][m[1].length] : DocumentApp.ParagraphHeading.NORMAL);
  });
}

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (!/^[a-f0-9]{8}$/.test(d.id || '')) return ContentService.createTextOutput('bad id');
  const body = DocumentApp.getActiveDocument().getBody();
  const paras = body.getParagraphs();
  // The AI adds new content above the Requests heading, only while its request is Working.
  if (d.action === 'append') {
    if (!paras.some(function (p) { return p.getText().indexOf('[Working ' + d.id + ']') !== -1; })) return ContentService.createTextOutput('not working');
    const lines = String(d.text).slice(0, 30000).replace(/\r/g, '').split('\n').filter(function (l) { return l.trim() !== ''; });
    const req = paras.find(function (p) { return /^requests$/i.test(p.getText().trim()) && p.getHeading() === DocumentApp.ParagraphHeading.HEADING1; });
    writeLines(body, req ? body.getChildIndex(req) : null, lines);
    return ContentService.createTextOutput('appended');
  }
  if (d.status === 'working' && d.line) {
    for (const p of paras) {
      const t = p.getText().trim();
      if (t === String(d.line).trim() && t.indexOf('[') === -1) { p.appendText('  [Working ' + d.id + ']'); break; }
    }
    return ContentService.createTextOutput('ok');
  }
  const re = new RegExp('\\[Working ' + d.id + '\\]');
  const mark = d.status === 'success' ? '[Done: ' + String(d.summary).slice(0, 400) + ']' : '[Failed: ' + String(d.summary).slice(0, 400) + ']';
  for (const p of paras) { const t = p.getText(); if (re.test(t)) { p.setText(t.replace(re, mark)); break; } }
  return ContentService.createTextOutput('ok');
}

// Run once from the editor to reset the doc to the clean template (Run > setupTemplate).
function setupTemplate() { resetDoc('GSCG Group Ticket Website: Team Workspace', TEMPLATE); }
// Run once from the editor to turn this into the page-by-page website build doc (Run > setupBuildDoc).
function setupBuildDoc() { resetDoc('GSCG Group Ticket Website: Build Doc', BUILD_DOC); }
function resetDoc(title, tpl) {
  const body = DocumentApp.getActiveDocument().getBody();
  body.appendParagraph('');
  while (body.getNumChildren() > 1) body.removeChild(body.getChild(0));
  const lines = tpl.split('\n').filter(function (l) { return l.trim() !== ''; });
  const first = body.getChild(0).asParagraph();
  first.setText(title); first.setHeading(DocumentApp.ParagraphHeading.TITLE);
  writeLines(body, null, lines);
  body.appendParagraph('');
}

function openSite() {
  const url = 'https://mateosandoval10.github.io/gscg-astros-gtw/';
  DocumentApp.getUi().showModalDialog(HtmlService.createHtmlOutput('<a href="' + url + '" target="_blank">Open the website</a>'), 'Website');
}

const TEMPLATE = "How this doc works: this doc IS the group ticket website. Website: https://mateosandoval10.github.io/gscg-astros-gtw/\n1. Write like a normal Google Doc. Each Heading 1 is a part of the website, each Heading 2 is one item inside it (a tier, an experience, a seating area, a question).\n2. Short facts like \"From: To confirm\" or \"Good for: Large school groups\" show up as labeled details. Everything else is normal text.\n3. Edits show on the website within about 30 seconds. Refresh the website to see them.\n4. To ask the AI for anything bigger (new pages, pop-ups, design changes), write it under Requests at the bottom. Start with \"Request:\" and end with your name in parentheses, like (Daphne). It can be several paragraphs.\n5. The request changes to Working, then Done with a note. You can delete it once it says Done. Do not edit it while it says Working.\n6. Unconfirmed info always says \"To confirm\". Put \"Owner: Your name\" and \"Status: Idea, Draft, Needs info or Ready\" under your headings.\n# Welcome\nOwner: Mateo\nHeadline: Bring your group to Daikin Park\nSubhead: Schools, churches, teams, nonprofits, companies and families. Groups of 20 to 7,000+.\nButton: Start your group outing\n# Why groups choose Daikin Park\nOwner: Mateo\nStatus: Draft\n## Group savings\nSpecial group rates for 20 or more people. Exact discounts: To confirm.\n## Sit together\nYour whole group is seated together in one block.\n## A dedicated rep\nA group sales rep helps plan your outing from start to finish.\n## Recognition\nYour group can be welcomed on the scoreboard. To confirm.\n## Give back\nSchools can earn money back on every ticket through the school fundraiser link. Churches and nonprofits: To confirm.\n# Experiences and theme days\nOwner: Alex, Andrew, Alexa, Daphne\nIntro: Build your outing around a theme day or a once-in-a-lifetime experience.\n## History Day\nOwner: Alex\nStatus: Draft\nWhen: April or May weekday game\nGood for: Schools, grades 3 to 8\nA passport scavenger hunt through the ballpark and Union Station, school-vs-school trivia, and a different Astros era celebrated every inning.\n## Language Day\nOwner: Alex\nStatus: Draft\nWhen: April or May weekday game\nGood for: Dual-language and bilingual classes\nEnglish and Spanish learning tracks, a Q&A with Spanish-language broadcasters, and a bilingual scavenger hunt.\n## Science Day\nOwner: Alex\nStatus: Needs info\nWhen: To confirm\nGood for: Schools\nThe Astros' existing Science Day. Details: To confirm.\n## Fellowship Sundays\nOwner: Andrew\nStatus: Draft\nWhen: Sunday 1:10 home games\nGood for: Small and mid-size churches\nChurches of the same denomination sit together, $5 back per ticket to your church, and you can sponsor tickets for a family in need.\n## Kids Run Daikin\nOwner: Daphne\nStatus: Draft\nWhen: One game per season\nGood for: Youth sports teams\nKids shadow the PA announcer, broadcast booth, grounds crew and ticket takers for a day.\n## Nonprofit Partner Night\nOwner: Daphne\nStatus: Idea\nWhen: One game per season\nGood for: Nonprofits and their funders\nA pregame meetup that pairs nonprofits and funders by cause area, then the game together.\n## Grupos en Espanol\nOwner: Alexa\nStatus: Idea\nWhen: Any game\nGood for: Spanish-speaking families and organizations\nGroup planning in Spanish, with updates through an opt-in WhatsApp list.\n# Tiers and pricing\nOwner: Andrew\nStatus: Needs info\nIntro: Every home game falls into one of six price tiers. Pick the game that fits your budget. Tier details: To confirm with the Astros.\n## Tier 1\nGames: To confirm\nFrom: To confirm\n## Tier 2\nGames: To confirm\nFrom: To confirm\n## Tier 3\nGames: To confirm\nFrom: To confirm\n## Tier 4\nGames: To confirm\nFrom: To confirm\n## Tier 5\nGames: To confirm\nFrom: To confirm\n## Tier 6\nGames: To confirm\nFrom: To confirm\n# Seating\nOwner: Andrew\nStatus: Draft\nIntro: Tap any area of the ballpark to see who it is good for. Prices and availability: To confirm.\n## Field Box\nGood for: Groups who want to be close to the action\nFrom: To confirm\n## Mezzanine\nGood for: Mid-size groups\nFrom: To confirm\n## View Deck\nGood for: Large school and church groups on a budget\nFrom: To confirm\n## Crawford Boxes\nGood for: Groups who want to catch home runs in left field\nFrom: To confirm\n## Outfield Deck I\nGood for: Casual groups and teams\nFrom: To confirm\n## Outfield Deck II\nGood for: Very large groups\nFrom: To confirm\n## Bullpen\nGood for: Groups who want to watch pitchers warm up\nFrom: To confirm\n## Union Station\nGood for: Meeting your group before the game\nThe historic train station that is the entrance to the ballpark.\n# Schedule and theme nights\nOwner: Alex\nStatus: Needs info\nIntro: 2027 dates will be added once the schedule is set.\n## April\nHistory Day and Language Day on weekday games. Dates: To confirm.\n## May\nHistory Day and Language Day on weekday games. Dates: To confirm.\n## Summer Sundays\nFellowship Sundays on 1:10 home games. Dates: To confirm.\n## Season\nKids Run Daikin and Nonprofit Partner Night. Dates: To confirm.\n# A day at the park\nOwner: Daphne\nStatus: Draft\n## Arrive\nMeet your group at Union Station.\n## Welcome\nYour group gets its own welcome. To confirm.\n## First pitch\nSettle into your seats together.\n## In the game\nYour group's name on the scoreboard. To confirm.\n## After the game\nPhotos and memories to take home.\n# Group leader rewards\nOwner: Mateo\nStatus: Idea\nIntro: A GSCG proposal: the more people you bring, the more you unlock. Rewards: To confirm with the Astros.\n## 20 or more\nRewards: To confirm\n## 50 or more\nRewards: To confirm\n## 150 or more\nRewards: To confirm\n## 300 or more\nRewards: To confirm\n# Contact\nOwner: Alexa\nStatus: Needs info\n## Astros Group Sales\nFor: Questions about group tickets\nEmail: To add from the Astros\nPhone: To add from the Astros\n# Interest form\nOwner: Alexa\nStatus: Draft\nIntro: Tell us about your group and a rep will follow up.\n- Your name\n- Organization\n- Group type\n- Group size\n- Preferred date or theme day\n- Email\n# FAQ\nOwner: Mateo\nStatus: Draft\n## What is the minimum group size?\n20 people. To confirm.\n## Can my group sit together?\nYes, groups are seated together in one block.\n## How do I reserve?\nFill out the interest form and a group sales rep will contact you.\n# Requests\nWrite requests for the AI below. Start with \"Request:\" and end with your name in parentheses.\n";

const BUILD_DOC = "# Start here\n## How this works\n- This doc is the blueprint for our group ticket website. Whatever is written here is what goes on the site.\n- Each Heading 1 is a page. Each Heading 2 is a section on that page, top to bottom.\n- Write anything under a section: sentences, bullets, prices, image links. Delete the \"Tip\" line once you start.\n- Use Heading 3 for items inside a section (one per experience, tier or FAQ question). Paste an image link on its own line to show a photo.\n- Add, move or delete sections and pages however you want. Use Format, then Paragraph styles, to make a heading.\n- Talk it through in comments or the group chat.\n## The website must have\n- Visuals of what a group day at the park looks like\n- Contact info for questions\n- Tiers and pricing that are clearly different from each other\n- Seating\n- A schedule connected to our theme nights and ideas\n- An interest form to start booking\n- Something for every kind of group, not just our four\n- A clear \"Start your group outing\" button on every page\n## Rules\n- No made-up facts, prices or dates. If we do not know it, write \"To confirm\".\n- No Astros logos. This is a GSCG concept.\n## See the website\n- Website: https://mateosandoval10.github.io/gscg-astros-gtw/\n- It updates by itself about 20 seconds after you type here. Refresh the page to see your changes.\n- Empty sections show \"Coming soon\" on the site. Turn on \"Team view\" (bottom right of the site) to see each section's tip.\n# Home\n## Hero\nTip: the first thing people see. One headline, one sentence, one button.\n## Why groups choose Daikin Park\nTip: the top reasons to come as a group instead of buying single tickets.\n## Featured experiences\nTip: a preview of the best theme nights and experiences.\n## A day at the park\nTip: show a group's day from arrival to the last out.\n# Experiences\n## Theme nights and experiences\nTip: one section per experience. Add more Heading 2 sections as you need them.\n# Seating and pricing\n## Pricing\nTip: how the tiers work and how they differ.\n## Seating\nTip: where groups sit and who each area is good for.\n# Schedule\n## Dates and theme nights\nTip: which games groups can book and what is happening on each date.\n# Plan your outing\n## Interest form\nTip: the questions we ask and what happens after someone sends it.\n## Contact\nTip: who to reach with questions, and how.\n## FAQ\nTip: the questions a group leader asks before booking.\n";
