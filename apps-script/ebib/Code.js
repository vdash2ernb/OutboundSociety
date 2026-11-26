/**
 * Outbound Society · Virtual Santa Run e-bibs
 * ─────────────────────────────────────────────────────────────
 * Lives inside the "Virtual Santa Run 2026 · Registrations" spreadsheet.
 *
 *  1. A runner fills in the sign-up Google Form (made by setup()).
 *  2. The script gives them the next bib number, makes their bib from the
 *     Slides template (PNG + PDF, saved in Drive) and emails it right away.
 *  3. Runners can download it again from outboundsociety.org/e-bib/ with their email.
 *
 * The run is free, so there is no payment step: bibs go out on submit.
 * Everything is tracked on the "Bibs" tab. Menu: e-Bibs.
 * Source of truth is this file in the website repo (apps-script/ebib/), pushed with clasp.
 */

const EVENT = {
  name: 'Virtual Santa Run 2026',
  date: 'December 25, 2026',
  distance: '10 KM',
  where: 'Anywhere in the world',
  website: 'https://outboundsociety.org',
  ebibPage: 'https://outboundsociety.org/e-bib/',
  strava: 'https://strava.app.link/9qbX0VCni8b',
  firstBib: 1001,
};

const BIBS_SHEET = 'Bibs';
// Bib artwork, drawn by scripts/make-bib-art.mjs in the website repo
const ART_URLS = [
  'https://outboundsociety.org/ebib/santa-run-2026-bib.jpg',
  'https://raw.githubusercontent.com/vdash2ernb/OutboundSociety/main/public/ebib/santa-run-2026-bib.jpg',
];
// Where the big number sits (points on the 720×405 slide). Anton has more room above its
// digits than below, so the box is nudged to make the digits look centred in the panel.
const BIB_BOX = { x: 20, y: 107, w: 536, h: 226, size: 168 };

// Bibs tab columns (1-based)
const COL = {
  key: 1, registered: 2, name: 3, email: 4, country: 5, gender: 6, category: 7, strava: 8,
  bib: 9, status: 10, pdf: 11, emailedAt: 12, pngId: 13, pdfId: 14,
};
const HEADERS = [
  'Response ID', 'Registered', 'Name on bib', 'Email', 'Country', 'Gender', 'Age group', 'Strava name',
  'Bib No.', 'Status', 'Bib PDF', 'Emailed At', 'PNG file id', 'PDF file id',
];
const STATUS = { sent: 'Sent', noEmail: 'Bib made (no email on file)', test: 'Test (not emailed)' };

// Form question titles (the sync step finds answers by these)
const Q = {
  name: 'Name on your bib',
  country: 'Country',
  gender: 'Gender',
  category: 'Age group',
  strava: 'Strava name (optional)',
  waiver: 'Waiver',
};

// ─── Menu ────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('e-Bibs')
    .addItem('Set up (first time)', 'setup')
    .addSeparator()
    .addItem('Send bibs that haven\'t gone out', 'sendPending')
    .addItem('Re-send bib for selected rows', 'resendSelected')
    .addItem('Preview bib for selected row (no email)', 'previewSelected')
    .addSeparator()
    .addItem('Rebuild bib template', 'rebuildTemplate')
    .addToUi();
}

// ─── Setup: form, folder, template, triggers ─────────────────

function setup() {
  const ss = SpreadsheetApp.getActive();
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', ss.getId());
  ss.setSpreadsheetTimeZone('Asia/Manila');

  if (!props.getProperty('FOLDER_ID')) {
    const folder = DriveApp.createFolder(EVENT.name + ' e-Bibs');
    props.setProperty('FOLDER_ID', folder.getId());
    DriveApp.getFileById(ss.getId()).moveTo(folder);
  }
  if (!props.getProperty('FORM_ID')) createForm_(ss);
  if (!props.getProperty('TEMPLATE_ID')) createTemplate_();

  let sh = ss.getSheetByName(BIBS_SHEET);
  if (!sh) sh = ss.insertSheet(BIBS_SHEET, 0);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#5a0b12').setFontColor('#fbf6ee');
  sh.setFrozenRows(1);
  sh.setFrozenColumns(3);
  sh.hideColumns(COL.key);
  sh.hideColumns(COL.pngId, 2);
  sh.setColumnWidth(COL.name, 200);
  sh.setColumnWidth(COL.email, 220);
  sh.setColumnWidth(COL.status, 180);
  // Remove the empty starter tab if it's still there
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);

  ScriptApp.getProjectTriggers().forEach((t) => {
    if (t.getHandlerFunction() === 'handleFormSubmit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('handleFormSubmit').forSpreadsheet(ss).onFormSubmit().create();

  const form = FormApp.openById(props.getProperty('FORM_ID'));
  ss.toast('Sign-up form: ' + form.getPublishedUrl(), 'e-Bibs ready', 15);
  Logger.log('Form (share this): %s', form.getPublishedUrl());
  Logger.log('Form editor: %s', form.getEditUrl());
}

function createForm_(ss) {
  const form = FormApp.create(EVENT.name + ' · Sign up');
  form
    .setTitle(EVENT.name)
    .setDescription(
      'A free 10 km Christmas run by Outbound Society. Run anywhere in the world on ' + EVENT.date +
        ', log it on Strava, and wear your official virtual race bib.\n\n' +
        'Sign up below and your e-bib is emailed to you right away.',
    )
    .setCollectEmail(true)
    .setAllowResponseEdits(false)
    .setLimitOneResponsePerUser(false)
    .setConfirmationMessage(
      "You're in! Your e-bib is on its way to your email (check Promotions or Spam if you don't see it in a few minutes). " +
        'You can also download it anytime at ' + EVENT.ebibPage.replace('https://', ''),
    );
  try { form.setRequireLogin(false); } catch (err) {} // let runners without a Google account sign up

  form.addTextItem().setTitle(Q.name).setHelpText('Your name as it should appear on the bib.').setRequired(true);
  form.addTextItem().setTitle(Q.country).setHelpText('Where you will run from.').setRequired(true);
  form.addMultipleChoiceItem().setTitle(Q.gender).setChoiceValues(['Female', 'Male', 'Prefer not to say']).setRequired(true);
  form.addMultipleChoiceItem().setTitle(Q.category)
    .setChoiceValues(['Kids (1 - 11)', 'Teens (12 - 17)', 'Adult (18 - 49)', 'Senior (50 Above)']).setRequired(true);
  form.addTextItem().setTitle(Q.strava).setHelpText('So we can find you in the Strava group.');
  form.addCheckboxItem().setTitle(Q.waiver)
    .setHelpText(
      'I am physically fit to run 10 km and I run at my own risk, on a route I choose, following local traffic and safety rules. ' +
        'I release Outbound Society and its volunteers from liability for any injury or loss during my run. ' +
        'I agree that Outbound Society may share photos I post with the event. For runners under 18, a parent or guardian agrees on their behalf.',
    )
    .setChoiceValues(['YES, I AGREE'])
    .setRequired(true);

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  DriveApp.getFileById(form.getId()).moveTo(DriveApp.getFolderById(prop_('FOLDER_ID')));
  PropertiesService.getScriptProperties().setProperty('FORM_ID', form.getId());
  return form;
}

// ─── New sign-up → bib → email ───────────────────────────────

function handleFormSubmit() {
  syncRegistrations_();
  sendPending();
}

/** Copies new form responses onto the Bibs tab. */
function syncRegistrations_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = book_();
    const src = ss.getSheets().find((s) => s.getFormUrl());
    if (!src) return;
    const bibs = ss.getSheetByName(BIBS_SHEET);
    const data = src.getDataRange().getValues();
    if (data.length < 2) return;
    const h = data[0].map((x) => String(x).trim());
    const at = (title) => h.findIndex((x) => x.toLowerCase() === title.toLowerCase());
    const idx = {
      ts: at('Timestamp'), email: h.findIndex((x) => /email/i.test(x)), name: at(Q.name), country: at(Q.country),
      gender: at(Q.gender), category: at(Q.category), strava: at(Q.strava),
    };
    const existing = new Set(columnValues_(bibs, COL.key).map(String));
    const rows = [];
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const ts = row[idx.ts];
      if (!ts) continue;
      const email = String(row[idx.email] || '').trim();
      const key = (ts instanceof Date ? ts.toISOString() : String(ts)) + '|' + email.toLowerCase();
      if (existing.has(key)) continue;
      existing.add(key);
      const get = (i) => (i >= 0 ? String(row[i]).trim() : '');
      rows.push([key, ts, get(idx.name), email, get(idx.country), get(idx.gender), get(idx.category), get(idx.strava),
        '', '', '', '', '', '']);
    }
    if (rows.length) bibs.getRange(bibs.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
  } finally {
    lock.releaseLock();
  }
}

/** Makes and emails every bib that hasn't been sent yet. Safe to run any time. */
function sendPending() {
  syncRegistrations_();
  const sh = book_().getSheetByName(BIBS_SHEET);
  const n = sh.getLastRow() - 1;
  if (n < 1) return;
  const statuses = sh.getRange(2, COL.status, n, 1).getValues();
  statuses.forEach((s, i) => {
    const st = String(s[0]);
    if (!st || st.startsWith('Error')) processRow_(sh, i + 2, { send: true });
  });
}

function resendSelected() {
  const sh = SpreadsheetApp.getActiveSheet();
  if (sh.getName() !== BIBS_SHEET) return SpreadsheetApp.getUi().alert('Select rows on the Bibs tab first.');
  const range = sh.getActiveRange();
  for (let row = Math.max(2, range.getRow()); row < range.getRow() + range.getNumRows(); row++) {
    processRow_(sh, row, { send: true });
  }
}

function previewSelected() {
  const sh = SpreadsheetApp.getActiveSheet();
  const row = sh.getActiveRange().getRow();
  const v = sh.getName() === BIBS_SHEET && row >= 2 ? sh.getRange(row, 1, 1, HEADERS.length).getValues()[0] : [];
  const files = makeBib_({
    name: v[COL.name - 1] || 'Juan Dela Cruz',
    bib: v[COL.bib - 1] || EVENT.firstBib,
    country: v[COL.country - 1] || 'Philippines',
    category: v[COL.category - 1] || 'Adult (18 - 49)',
  }, 'PREVIEW ');
  const html = HtmlService.createHtmlOutput(
    '<p style="font-family:sans-serif">Preview only. Nothing was emailed and no bib number was used.</p>' +
      '<img style="width:100%" src="data:image/png;base64,' + Utilities.base64Encode(files.png.getBlob().getBytes()) + '">',
  ).setWidth(760).setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, 'Bib preview');
  files.png.setTrashed(true);
  files.pdf.setTrashed(true);
}

/** Design check: makes sample bibs (short, long and very long names) in the e-Bibs folder,
 *  without emailing anyone or using a bib number. Run it from the script editor. */
function renderSamples() {
  const it = DriveApp.getFolderById(prop_('BIBS_FOLDER_ID')).searchFiles("title contains 'SAMPLE ' and trashed = false");
  while (it.hasNext()) it.next().setTrashed(true);
  [
    { name: 'Ana Cruz', bib: 1001, country: 'Philippines', category: 'Adult (18 - 49)' },
    { name: 'Maria Theresa Villanueva', bib: 1234, country: 'United Arab Emirates', category: 'Senior (50 Above)' },
    { name: 'Christopher Alexander Montenegro', bib: 1888, country: 'Canada', category: 'Teens (12 - 17)' },
  ].forEach((r) => {
    const f = makeBib_(r, 'SAMPLE ');
    Logger.log('%s → %s', r.name, f.png.getUrl());
  });
}

function processRow_(sh, row, opts) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const v = sh.getRange(row, 1, 1, HEADERS.length).getValues()[0];
    const name = String(v[COL.name - 1]).trim();
    if (!name) {
      sh.getRange(row, COL.status).setValue('Error: no name');
      return;
    }
    let bib = v[COL.bib - 1];
    if (!bib) {
      bib = nextBib_(sh);
      sh.getRange(row, COL.bib).setValue(bib);
      SpreadsheetApp.flush();
    }
    [v[COL.pngId - 1], v[COL.pdfId - 1]].filter(String).forEach((id) => {
      try { DriveApp.getFileById(id).setTrashed(true); } catch (err) {}
    });
    const runner = { name, bib, country: v[COL.country - 1], category: v[COL.category - 1] };
    const files = makeBib_(runner, '');
    sh.getRange(row, COL.pdf).setValue(files.pdf.getUrl());
    sh.getRange(row, COL.pngId, 1, 2).setValues([[files.png.getId(), files.pdf.getId()]]);

    const email = String(v[COL.email - 1]).trim();
    if (opts.send && email.includes('@')) {
      sendBibEmail_(email, runner, files);
      sh.getRange(row, COL.status).setValue(STATUS.sent);
      sh.getRange(row, COL.emailedAt).setValue(new Date());
    } else {
      sh.getRange(row, COL.status).setValue(opts.send ? STATUS.noEmail : STATUS.test);
    }
  } catch (err) {
    sh.getRange(row, COL.status).setValue('Error: ' + err.message);
  } finally {
    lock.releaseLock();
  }
}

function nextBib_(sh) {
  const nums = columnValues_(sh, COL.bib).map(Number).filter((x) => x > 0);
  return nums.length ? Math.max(...nums) + 1 : EVENT.firstBib;
}

function columnValues_(sh, col) {
  const n = sh.getLastRow() - 1;
  return n < 1 ? [] : sh.getRange(2, col, n, 1).getValues().map((r) => r[0]);
}

// ─── Bib image ───────────────────────────────────────────────

function makeBib_(runner, prefix) {
  const folder = DriveApp.getFolderById(prop_('BIBS_FOLDER_ID', () => {
    const f = DriveApp.getFolderById(prop_('FOLDER_ID')).createFolder('Bibs');
    return f.getId();
  }));
  const base = prefix + runner.bib + ' ' + runner.name;
  const copy = DriveApp.getFileById(prop_('TEMPLATE_ID')).makeCopy(base, folder);
  try {
    const deck = SlidesApp.openById(copy.getId());
    const slide = deck.getSlides()[0];
    const name = String(runner.name).toUpperCase();
    slide.getShapes().forEach((s) => {
      const t = s.getText();
      if (t.asString().includes('{{NAME}}')) {
        t.replaceAllText('{{NAME}}', name);
        const len = name.length;
        t.getTextStyle().setFontSize(len <= 18 ? 28 : len <= 24 ? 26 : len <= 32 ? 24 : 20);
      }
    });
    deck.replaceAllText('{{BARCODE}}', '*' + runner.bib + '*');
    deck.replaceAllText('{{BIB}}', String(runner.bib));
    const short = name.length > 22 ? name.split(/\s+/)[0] : name;
    deck.replaceAllText('{{SHORTNAME}}', short);
    const sub = [runner.country, runner.category].map((x) => String(x || '').trim()).filter(String).join('  ·  ');
    deck.replaceAllText('{{DETAILS}}', sub.toUpperCase());
    deck.saveAndClose();

    const pdf = folder.createFile(copy.getAs('application/pdf').setName(base + '.pdf'));
    const png = folder.createFile(exportPng_(copy.getId(), slide.getObjectId()).setName(base + '.png'));
    return { pdf, png };
  } finally {
    copy.setTrashed(true);
  }
}

/** 1600 px PNG of a slide (Slides API thumbnail), falling back to the 960 px export. */
function exportPng_(deckId, pageId) {
  try {
    const t = Slides.Presentations.Pages.getThumbnail(deckId, pageId, {
      'thumbnailProperties.thumbnailSize': 'LARGE',
      'thumbnailProperties.mimeType': 'PNG',
    });
    return UrlFetchApp.fetch(t.contentUrl).getBlob();
  } catch (err) {
    return UrlFetchApp.fetch('https://docs.google.com/presentation/d/' + deckId + '/export/png?pageid=' + pageId, {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    }).getBlob();
  }
}

function sendBibEmail_(email, r, files) {
  const first = String(r.name).split(/\s+/)[0];
  const page = EVENT.ebibPage.replace('https://', '');
  const html =
    '<div style="font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;max-width:640px">' +
    '<p>Hi ' + esc_(first) + ',</p>' +
    '<p>Ho ho ho, you\'re in! Here is your official bib for the <b>' + esc_(EVENT.name) + '</b>.</p>' +
    '<p style="font-size:26px;margin:8px 0"><b>Bib ' + r.bib + '</b> · ' + EVENT.distance + '</p>' +
    '<p><img src="cid:bib" alt="Bib ' + r.bib + '" style="width:100%;max-width:640px;border-radius:8px"></p>' +
    '<p><b>How it works</b></p><ol style="padding-left:20px">' +
    '<li>On <b>' + EVENT.date + '</b>, run 10 km anywhere in the world.</li>' +
    '<li>Record it on Strava and join our group: <a href="' + EVENT.strava + '">Outbound Society on Strava</a>.</li>' +
    '<li>Print your bib or show it on your phone, and share a photo with it.</li></ol>' +
    '<p>The bib is attached as a PDF. Lost this email? Download it again at <a href="' + EVENT.ebibPage + '">' + page + '</a>.</p>' +
    '<p>Merry Christmas and see you on Strava!<br>Outbound Society</p></div>';
  MailApp.sendEmail({
    to: email,
    subject: 'Your bib for the ' + EVENT.name + ' · Bib ' + r.bib,
    htmlBody: html,
    body: 'Hi ' + first + ', your bib number for the ' + EVENT.name + ' is ' + r.bib + '. Your bib is attached. ' +
      'Run 10 km anywhere on ' + EVENT.date + ' and log it on Strava. Download it again at ' + page,
    name: 'Outbound Society',
    inlineImages: { bib: files.png.getBlob() },
    attachments: [files.pdf.getBlob()],
  });
}

function esc_(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function book_() {
  return SpreadsheetApp.getActive() || SpreadsheetApp.openById(prop_('SPREADSHEET_ID'));
}

function prop_(k, make) {
  const props = PropertiesService.getScriptProperties();
  let v = props.getProperty(k);
  if (!v && make) {
    v = make();
    props.setProperty(k, v);
  }
  if (!v) throw new Error('Missing ' + k + '. Run e-Bibs → Set up first.');
  return v;
}

// ─── Template ────────────────────────────────────────────────

function rebuildTemplate() {
  const old = PropertiesService.getScriptProperties().getProperty('TEMPLATE_ID');
  if (old) try { DriveApp.getFileById(old).setTrashed(true); } catch (err) {}
  createTemplate_();
  SpreadsheetApp.getActive().toast('New bib template made in the e-Bibs folder.', 'e-Bibs');
}

/** Builds the bib in Google Slides: the artwork (drawn by scripts/make-bib-art.mjs in the
 *  website repo and served from outboundsociety.org) as a full-bleed image, with the text on top.
 *  You can restyle the text by hand afterwards: keep the {{...}} placeholders. */
function createTemplate_() {
  const CREAM = '#fbf6ee', GOLD = '#e9cf8a', INK = '#1d0407', MAROON = '#6e0f1b', MUTED = '#7d6a5c', BROWN = '#7a5219';
  const deck = SlidesApp.create(EVENT.name + ' · Bib template');
  const slide = deck.getSlides()[0];
  slide.getPageElements().forEach((el) => el.remove());
  const art = ART_URLS.map((u) => UrlFetchApp.fetch(u, { muteHttpExceptions: true }))
    .find((r) => r.getResponseCode() === 200);
  if (!art) throw new Error('Could not download the bib artwork');
  slide.insertImage(art.getBlob(), 0, 0, 720, 405).sendToBack();

  const C = SlidesApp.ParagraphAlignment.CENTER, L = SlidesApp.ParagraphAlignment.START;
  const text = (str, x, y, w, h, o) => {
    const s = slide.insertTextBox(str, x, y, w, h);
    const t = s.getText();
    t.getTextStyle().setFontFamily(o.font).setFontSize(o.size).setForegroundColor(o.color).setBold(!!o.bold);
    t.getParagraphStyle().setParagraphAlignment(o.align || C).setLineSpacing(100).setSpaceAbove(0).setSpaceBelow(0);
    s.setContentAlignment(o.v || SlidesApp.ContentAlignment.MIDDLE);
    return s;
  };
  const track = (s) => s.split('').join(' '); // hair spaces: letter-spaced caps

  // Header
  const title = text('Virtual Santa Run 2026', 100, 14, 420, 42, { font: 'DM Serif Display', size: 31, color: CREAM, align: L });
  const yr = title.getText().find('2026')[0];
  if (yr) yr.getTextStyle().setForegroundColor(GOLD);
  text(track('25 DECEMBER 2026  ·  RUN ANYWHERE IN THE WORLD'), 101, 54, 440, 20, { font: 'Inter Tight', size: 8, color: GOLD, bold: true, align: L });
  // Distance medallion (circle drawn in the art, centre 648,45)
  text('10K', 616, 24, 64, 34, { font: 'Anton', size: 25, color: CREAM });
  text(track('VIRTUAL'), 616, 52, 64, 12, { font: 'Inter Tight', size: 5.5, color: GOLD, bold: true });

  // Main panel (x 0–576): labels, the number, the name
  text(track('RUNNER NO.'), 38, 104, 160, 16, { font: 'Inter Tight', size: 6.5, color: MUTED, bold: true, align: L });
  text(track('OFFICIAL VIRTUAL BIB'), 378, 104, 160, 16, { font: 'Inter Tight', size: 6.5, color: MUTED, bold: true, align: SlidesApp.ParagraphAlignment.END });
  text('{{BIB}}', BIB_BOX.x, BIB_BOX.y, BIB_BOX.w, BIB_BOX.h, { font: 'Anton', size: BIB_BOX.size, color: INK });
  text('{{NAME}}', 40, 323, 496, 36, { font: 'Anton', size: 28, color: INK });
  text('{{DETAILS}}', 40, 357, 496, 14, { font: 'Inter Tight', size: 7.5, color: MAROON, bold: true });
  text(track('OUTBOUND SOCIETY  ·  OUTBOUNDSOCIETY.ORG'), 40, 372, 496, 12, { font: 'Inter Tight', size: 5.5, color: MUTED, bold: true });

  // Tear-off stub (x 576–720)
  text(track('BIB NO.'), 584, 106, 128, 12, { font: 'Inter Tight', size: 6, color: MUTED, bold: true });
  text('{{BIB}}', 584, 116, 128, 40, { font: 'Anton', size: 32, color: INK });
  text('{{BARCODE}}', 584, 160, 128, 44, { font: 'Libre Barcode 39', size: 36, color: INK });
  text(track('10 KM  ·  VIRTUAL'), 584, 206, 128, 12, { font: 'Inter Tight', size: 6, color: MAROON, bold: true });
  text('{{SHORTNAME}}', 584, 222, 128, 26, { font: 'Inter Tight', size: 7.5, color: INK, bold: true, v: SlidesApp.ContentAlignment.TOP });
  text(track('25 · 12 · 2026'), 584, 250, 128, 12, { font: 'Inter Tight', size: 6, color: MUTED, bold: true });
  text('Santa Run', 584, 270, 128, 24, { font: 'DM Serif Display', size: 15, color: MAROON });
  text(track('OFFICIAL ENTRY'), 584, 310, 128, 12, { font: 'Inter Tight', size: 5.5, color: BROWN, bold: true });

  deck.saveAndClose();
  DriveApp.getFileById(deck.getId()).moveTo(DriveApp.getFolderById(prop_('FOLDER_ID')));
  PropertiesService.getScriptProperties().setProperty('TEMPLATE_ID', deck.getId());
  return deck.getId();
}

// ─── Website lookup: outboundsociety.org/e-bib/ ──────────────
// GET ?email=...  →  JSON with that runner's bib(s) as base64 PNG + PDF

function doGet(e) {
  const p = (e && e.parameter) || {};
  const out = (o) => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  // ?preview=samples → the design samples made by renderSamples() (made-up runners only)
  if (p.preview === 'samples') {
    const it = DriveApp.getFolderById(prop_('BIBS_FOLDER_ID')).searchFiles("title contains 'SAMPLE ' and mimeType = 'image/png' and trashed = false");
    const files = [];
    while (it.hasNext()) files.push(it.next());
    return out({ ok: true, samples: files.map((f) => ({ name: f.getName(), png: Utilities.base64Encode(f.getBlob().getBytes()) })) });
  }
  const email = String(p.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return out({ ok: false, reason: 'input' });

  // Slow down guessing: 10 lookups per email per 10 minutes
  const cache = CacheService.getScriptCache();
  const ck = 'look_' + Utilities.base64EncodeWebSafe(email).slice(0, 200);
  const tries = Number(cache.get(ck) || 0);
  if (tries >= 10) return out({ ok: false, reason: 'busy' });
  cache.put(ck, String(tries + 1), 600);

  const sh = SpreadsheetApp.openById(prop_('SPREADSHEET_ID')).getSheetByName(BIBS_SHEET);
  const n = sh.getLastRow() - 1;
  const rows = n < 1 ? [] : sh.getRange(2, 1, n, HEADERS.length).getValues()
    .filter((r) => String(r[COL.email - 1]).trim().toLowerCase() === email);
  if (!rows.length) return out({ ok: false, reason: 'notfound', event: EVENT.name });
  const ready = rows.filter((r) => r[COL.pngId - 1]);
  if (!ready.length) return out({ ok: false, reason: 'pending', event: EVENT.name });
  return out({
    ok: true,
    event: EVENT.name,
    bibs: ready.map((r) => ({
      name: r[COL.name - 1],
      bib: r[COL.bib - 1],
      png: Utilities.base64Encode(DriveApp.getFileById(r[COL.pngId - 1]).getBlob().getBytes()),
      pdf: Utilities.base64Encode(DriveApp.getFileById(r[COL.pdfId - 1]).getBlob().getBytes()),
    })),
  });
}
