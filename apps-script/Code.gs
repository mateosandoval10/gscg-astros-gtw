/** @OnlyCurrentDoc */
// Team doc script (Extensions > Apps Script). Deploy > New deployment > Web app,
// Execute as: Me, Who has access: Anyone. No keys or tokens are stored here.

function onOpen() {
  DocumentApp.getUi().createMenu('Website')
    .addItem('Send my requests to the AI', 'queueRequests')
    .addItem('Open the website', 'openSite')
    .addToUi();
}

// The website (and the GitHub job) read the doc through this link, live.
function doGet() {
  const text = DocumentApp.getActiveDocument().getBody().getText();
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}

// Optional menu. Lines that start with "Request:" and end with "(Your name)" are picked up automatically.
// Marks every new "Request:" line as queued. GitHub checks every 5 minutes and Claude makes the change.
function queueRequests() {
  let n = 0;
  for (const p of DocumentApp.getActiveDocument().getBody().getParagraphs()) {
    const t = p.getText().trim();
    if (!/^Request:/i.test(t) || /\[(Queued|Working|Done|Failed)/.test(t)) continue;
    p.appendText('  [Queued ' + Utilities.getUuid().replace(/-/g, '').slice(0, 8) + ']');
    n++;
  }
  DocumentApp.getUi().alert(n ? 'Queued ' + n + ' request(s). The AI checks every 5 minutes; the line will change to Working, then Done, and the website updates.' : 'No new "Request:" lines found. Start a line with "Request:" and try again.');
}

// GitHub reports progress here: working, success or failure.
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (!/^[a-f0-9]{8}$/.test(d.id || '')) return ContentService.createTextOutput('bad id');
  const paras = DocumentApp.getActiveDocument().getBody().getParagraphs();
  if (d.status === 'working' && d.line) {
    for (const p of paras) {
      const t = p.getText().trim();
      if (t === String(d.line).trim()) { p.setText(t + '  [Working ' + d.id + ']'); break; }
      if (t.indexOf('[Queued ' + d.id + ']') !== -1) { p.setText(t.replace('[Queued ' + d.id + ']', '[Working ' + d.id + ']')); break; }
    }
    return ContentService.createTextOutput('ok');
  }
  const re = new RegExp('\\[(Queued|Working) ' + d.id + '\\]');
  const mark = d.status === 'success' ? '[Done: ' + String(d.summary).slice(0, 300) + ']' : '[Failed: ' + String(d.summary).slice(0, 300) + ']';
  for (const p of paras) {
    const t = p.getText();
    if (re.test(t)) { p.setText(t.replace(re, mark)); break; }
  }
  return ContentService.createTextOutput('ok');
}

function openSite() {
  const url = 'https://mateosandoval10.github.io/gscg-astros-gtw/';
  DocumentApp.getUi().showModalDialog(HtmlService.createHtmlOutput('<a href="' + url + '" target="_blank">Open the website</a>'), 'Website');
}
