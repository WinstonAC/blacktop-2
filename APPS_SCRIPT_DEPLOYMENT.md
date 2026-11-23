# Blacktop registration — get live again (email only)

Parents fill out the form → script emails **robertjanice@bellsouth.net** → they see a thank-you on screen. **No Google Sheet required.**

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

## Test

Submit on https://winstonac.github.io/blacktop-2/ — you should see **Thank you — your registration was submitted!** and dad should get the email.