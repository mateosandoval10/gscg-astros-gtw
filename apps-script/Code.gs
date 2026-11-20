// Team doc script. Paste into the Google Doc: Extensions > Apps Script.
// Script properties (Project Settings > Script properties):
//   GITHUB_TOKEN    fine-grained token, this repo only, Contents: Read and write
//   GITHUB_REPO     e.g. mateosandoval10/gscg-astros-gtw
//   CALLBACK_SECRET any long random phrase (same value as the GitHub secret)
//   SITE_URL        the public website link
// Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone.

const P = PropertiesService.getScriptProperties();

function onOpen() {
  DocumentApp.getUi().createMenu('Website')
    .addItem('Send my requests to the AI', 'sendRequests')
    .addItem('Open the website', 'openSite')
    .addToUi();
}

// The website reads the doc through this link, live.
function doGet() {
  const text = DocumentApp.getActiveDocument().getBody().getText();
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}

// Sends every new "Request:" line to GitHub, where Claude makes the change.
function sendRequests() {
  const ui = DocumentApp.getUi();
  const paras = DocumentApp.getActiveDocument().getBody().getParagraphs();
  let sent = 0;
  for (const p of paras) {
    const text = p.getText().trim();
    if (!/^Request:/i.test(text) || /\[(Sent|Done|Failed|Working)/.test(text)) continue;
    const id = Utilities.getUuid().slice(0, 8);
    const res = UrlFetchApp.fetch('https://api.github.com/repos/' + P.getProperty('GITHUB_REPO') + '/dispatches', {
      method: 'post', muteHttpExceptions: true, contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + P.getProperty('GITHUB_TOKEN'), Accept: 'application/vnd.github+json' },
      payload: JSON.stringify({ event_type: 'site-request', client_payload: { id: id, request: text.replace(/^Request:\s*/i, '') } })
    });
    if (res.getResponseCode() === 204) { p.appendText('  [Sent ' + id + ']'); sent++; }
    else { p.appendText('  [Failed to send: ' + res.getResponseCode() + ']'); }
  }
  ui.alert(sent ? 'Sent ' + sent + ' request(s). The website updates in about 3 to 5 minutes, and this doc will say Done.' : 'No new "Request:" lines found.');
}

// GitHub calls this when a request finishes, and the doc is marked Done.
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (d.secret !== P.getProperty('CALLBACK_SECRET')) return ContentService.createTextOutput('no');
  const tag = '[Sent ' + d.id + ']';
  const mark = d.status === 'success' ? '[Done: ' + d.summary + ']' : '[Failed: ' + d.summary + ']';
  for (const p of DocumentApp.getActiveDocument().getBody().getParagraphs()) {
    if (p.getText().indexOf(tag) !== -1) { p.replaceText(tag.replace(/[\[\]]/g, '\\$&'), mark); break; }
  }
  return ContentService.createTextOutput('ok');
}

function openSite() {
  const url = P.getProperty('SITE_URL');
  DocumentApp.getUi().showModalDialog(HtmlService.createHtmlOutput('<a href="' + url + '" target="_blank">Open the website</a>'), 'Website');
}
