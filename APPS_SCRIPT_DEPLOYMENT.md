# Blacktop registration — get live again (email only)

Parents fill out the form → script emails **robertjanice@bellsouth.net** → they see a thank-you on screen.

Rows append to your Google Sheet when **BLACKTOP_SHEET_ID** is set. Sheet errors do **not** block submit (email still goes out).

**Fall 2026 sheet:** [Blacktop spreadsheet](https://docs.google.com/spreadsheets/d/1IGCe_0FgI2K_C_4meBq7wCYOQzbMH18NxQi1ROp8vJs/edit)

After you add column headings in **row 1**, match this order (**A1 → AD1**, 30 columns). Full copy-paste list is in the repo chat / below.

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Registration ID | First Name | Last Name | Date of Birth | Age | Address Line 1 | Address Line 2 | City | State |
| **K** | **L** | **M** | **N** | **O** | **P** | **Q** | **R** | **S** | **T** |
| ZIP | Phone | Alt Phone | Division | Player Type | Jersey Color | Jersey Number | Team | Jersey Size | Shorts Size |
| **U** | **V** | **W** | **X** | **Y** | **Z** | **AA** | **AB** | **AC** | **AD** |
| Cash Paid | Cash Amount | CashApp | CashApp Amount | Medical Conditions | Medical Details | Consent | Parent Name | Parent Email | Signature Date |

## No rows on the sheet but email works?

The form can show **success** even when the sheet step failed or was skipped. Common causes:

1. **`BLACKTOP_SHEET_ID` never set** — run `configureBlacktopSheet('1IGCe_0FgI2K_C_4meBq7wCYOQzbMH18NxQi1ROp8vJs')` once in the Apps Script editor (not in the sheet).
2. **Sheet not shared** — share [this workbook](https://docs.google.com/spreadsheets/d/1IGCe_0FgI2K_C_4meBq7wCYOQzbMH18NxQi1ROp8vJs/edit) with the **same Google account** as **Deploy → Execute as: Me** (Editor).
3. **Old deployed code** — paste latest `Confirmation.gs` into `Code.gs`, Save, **Deploy → New version**.
4. **Wrong tab** — script uses the first tab (`gid=0`) if none of the preferred names match; data still appends to **row 2+**, not row 1 headers.

**Tomorrow:** In [Apps Script](https://script.google.com) → **Executions** — look for `Sheet backup failed` or errors on `openById`. Then run **`fullSmokeTestWithSheet()`**.

## 0. Link the spreadsheet (one time)

1. Share that sheet with the same Google account that owns the Apps Script project (Editor).
2. In the Apps Script editor, choose **`linkBlacktopRegistrationSheet`** in the function dropdown → **Run** (do **not** run `configureBlacktopSheet` alone — it needs the ID argument).

3. Authorize **spreadsheets** if prompted.
4. Optional sheet-only smoke test (no live form): run `smokeTestSheetAppend()`, confirm a **SMOKE TEST** row, delete that row.

## 1. Update Apps Script code

1. Open the **Blacktop** project in [script.google.com](https://script.google.com).
2. Replace **all** code in `Code.gs` with the contents of [`apps-script/Confirmation.gs`](apps-script/Confirmation.gs) from this repo (email-only version).
3. **Save**.

## 2. Deploy (Blacktop 2026)

1. **Deploy → Manage deployments**
2. Select **Blacktop 2026** → **Edit** (pencil)
3. **Version: New version**
4. **Execute as:** Me  
5. **Who has access:** Anyone  
6. **Deploy**

The URL should stay:

`https://script.google.com/macros/s/AKfycbzL_g7_gJ50kngSZ7Xeij5OXjfOQ_kq9JBi1PUqTp8QBeOfRW4dBc7n_2RsrAbNT70sEw/exec`

(If the URL changes, update `SHEET_ENDPOINT` in `index.html` on GitHub.)

## 3. Authorize email (first time)

1. In the editor, run `doGet` once (or submit a test registration).
2. Approve permissions for **sending email**.
3. Redeploy **new version** if Google asks you to.

## Optional: parent thank-you email

Run once in the editor:

```javascript
configureBlacktopSender('wcampbell0880@gmail.com');
```

Use the same Google account that **Execute as: Me** uses. If you skip this, dad still gets every registration; parents just won’t get an auto thank-you.

## Full smoke test (sheet + web)

### A. Sheet only (Apps Script editor)

1. Paste latest [`Confirmation.gs`](apps-script/Confirmation.gs) into **Code.gs**, **Save**.
2. Run `configureBlacktopSheet('1IGCe_0FgI2K_C_4meBq7wCYOQzbMH18NxQi1ROp8vJs')` if not done yet.
3. Row 1 must have all **30** headers (A1–AD1).
4. Run **`fullSmokeTestWithSheet()`** → should log **PASS — row N has 30 columns**.
5. Open the [sheet](https://docs.google.com/spreadsheets/d/1IGCe_0FgI2K_C_4meBq7wCYOQzbMH18NxQi1ROp8vJs/edit), confirm **SMOKE / FULLTEST**, delete test row(s).

### B. Web app (email + sheet)

From this repo:

```bash
node scripts/smoke-test-web.mjs
```

Or submit the real form locally (`index.html`) with test data.

**PASS:** JSON `{"success":true,...}` and a new sheet row. **FAIL:** HTML error page or `success:false`.

After smoke tests, delete rows where Last Name is **FULLTEST** or **TEST** and remove test emails to robertjanice@bellsouth.net.

## Live form

Submit on https://winstonac.github.io/blacktop-2/ — thank-you on screen and Coach Mitchell gets the email.