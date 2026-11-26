# Virtual Santa Run e-bibs

Runners sign up on a Google Form, get a bib number, and get their bib (PNG + PDF) by email right away.
They can download it again at **outboundsociety.org/e-bib/**.

Everything runs in roe@outboundsociety.org's Google account. Nothing here costs money.

| What | Where |
|---|---|
| Sign-up form (share this) | https://docs.google.com/forms/d/e/1FAIpQLSdNTUAXUxrBEoS4sI8DBLIofu4OeJSLXhO81ltvKalyxWe65Q/viewform |
| Form editor | https://docs.google.com/forms/d/1mx9H-0mjK8oIJxzsLBUuuPoym7CcvEcp35febPaTHWo/edit |
| Registrations spreadsheet (**Bibs** tab) | https://docs.google.com/spreadsheets/d/11_Hl4tJD80S12fKs-UjZxBihDzaf2rV2EIlW8jJGhxk/edit |
| Script (Extensions → Apps Script in the sheet) | https://script.google.com/home/projects/1txtOTF58mRmhgFtCUKCe7ttivmsMRYncJu9ALQA3v8OxJv3XbPYYVOc0/edit |
| Bib design (Google Slides) | Drive folder **Virtual Santa Run 2026 e-Bibs** → *Bib template* |
| Made bibs | Same folder → **Bibs** |
| Website lookup | `src/pages/e-bib.astro` (calls the script's web app URL) |

## How it works

1. A runner submits the form. The `handleFormSubmit` trigger copies them onto the **Bibs** tab.
2. They get the next bib number (from 1001), a bib made from the Slides template, and an email
   with the bib inline and the PDF attached. **Status** turns to *Sent*.
3. The `/e-bib/` page asks the web app (`doGet`) for bibs by email and offers PNG/PDF downloads.

## Everyday tasks (menu **e-Bibs** in the spreadsheet)

- **Status says Error / a bib didn't go out:** *Send bibs that haven't gone out*.
- **Runner fixed a typo in their name:** edit *Name on bib*, select the row, *Re-send bib for selected rows*.
  Their number stays the same.
- **Change the design:** edit the *Bib template* deck by hand (keep `{{BIB}}`, `{{NAME}}`, `{{DETAILS}}`),
  or change `createTemplate_()` and run *Rebuild bib template*. *Preview bib for selected row* shows it
  without emailing anyone.

## Changing the code

`Code.js` and `appsscript.json` here are the source. Paste them into the script editor (Code.gs / appsscript.json),
save, then **Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy** so the website
picks up the change. That keeps the same web app URL.

## Limits

- Workspace accounts can send about 1,500 emails a day from scripts.
- The lookup allows 10 tries per email every 10 minutes.
