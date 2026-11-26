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
const LOGO_URL = 'https://outboundsociety.org/icon-512.png';

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
        t.getTextStyle().setFontSize(len <= 18 ? 32 : len <= 24 ? 26 : len <= 30 ? 21 : 17);
      }
    });
    deck.replaceAllText('{{BIB}}', String(runner.bib));
    const sub = [runner.country, runner.category].map((x) => String(x || '').trim()).filter(String).join('  ·  ');
    deck.replaceAllText('{{DETAILS}}', sub.toUpperCase());
    deck.saveAndClose();

    const pdf = folder.createFile(copy.getAs('application/pdf').setName(base + '.pdf'));
    const res = UrlFetchApp.fetch(
      'https://docs.google.com/presentation/d/' + copy.getId() + '/export/png?pageid=' + slide.getObjectId(),
      { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } },
    );
    const png = folder.createFile(res.getBlob().setName(base + '.png'));
    return { pdf, png };
  } finally {
    copy.setTrashed(true);
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

/** Builds the bib design in Google Slides. You can restyle the deck by hand afterwards:
 *  keep the {{BIB}}, {{NAME}} and {{DETAILS}} placeholders. */
function createTemplate_() {
  const MAROON = '#5a0b12', CREAM = '#fbf6ee', GREEN = '#1d7a3e', INK = '#2a0508', MUTED = '#8a6a6c';
  const deck = SlidesApp.create(EVENT.name + ' · Bib template');
  const slide = deck.getSlides()[0];
  slide.getPageElements().forEach((el) => el.remove());
  slide.getBackground().setSolidFill(MAROON);
  const W = 720;

  const box = (x, y, w, h, fill, round) => {
    const s = slide.insertShape(round ? SlidesApp.ShapeType.ROUND_RECTANGLE : SlidesApp.ShapeType.RECTANGLE, x, y, w, h);
    s.getFill().setSolidFill(fill);
    s.getBorder().setTransparent();
    return s;
  };
  const text = (str, x, y, w, h, o) => {
    const s = slide.insertTextBox(str, x, y, w, h);
    const st = s.getText().getTextStyle();
    st.setFontFamily(o.font).setFontSize(o.size).setForegroundColor(o.color);
    if (o.bold) st.setBold(true);
    s.getText().getParagraphStyle().setParagraphAlignment(o.align || SlidesApp.ParagraphAlignment.CENTER);
    s.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
    return s;
  };
  const L = SlidesApp.ParagraphAlignment.START;

  // Header on maroon: logo, title, date line, distance tag
  try { slide.insertImage(UrlFetchApp.fetch(LOGO_URL).getBlob(), 20, 14, 66, 66); } catch (err) {}
  text(EVENT.name, 98, 12, 470, 46, { font: 'DM Serif Display', size: 32, color: CREAM, align: L });
  text((EVENT.date + '  ·  ' + EVENT.where).toUpperCase(), 100, 54, 470, 24,
    { font: 'Inter Tight', size: 10, color: '#f2c9a0', bold: true, align: L });
  box(586, 22, 116, 50, GREEN, true);
  text(EVENT.distance, 586, 22, 116, 50, { font: 'Anton', size: 26, color: CREAM });

  // The bib card
  box(20, 94, W - 40, 236, CREAM, true);
  box(52, 106, W - 104, 6, GREEN);
  text('{{BIB}}', 20, 104, W - 40, 176, { font: 'Anton', size: 150, color: INK });
  text('{{DETAILS}}', 20, 282, W - 40, 34, { font: 'Inter Tight', size: 12, color: MUTED, bold: true });

  // Runner's name + footer
  text('{{NAME}}', 30, 334, W - 60, 46, { font: 'Anton', size: 32, color: CREAM });
  text('OUTBOUND SOCIETY  ·  RUN IT ON STRAVA  ·  OUTBOUNDSOCIETY.ORG', 0, 380, W, 20,
    { font: 'Inter Tight', size: 8, color: '#f2c9a0', bold: true });

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
