# Fix Blacktop registration submit errors

When parents see **“We couldn’t confirm your registration”**, the public form is working but the **Google Apps Script web app** cannot save rows to the registration spreadsheet. That happens if the script was never configured after the last code update.

## What you need

- The **Google Sheet** that stores registrations (opened from your dad’s Google Drive)
- **Apps Script** opened from that sheet: **Extensions → Apps Script**
- The code in this repo: [`apps-script/Confirmation.gs`](apps-script/Confirmation.gs)

## One-time setup (in Apps Script editor)

1. Replace the project’s `Code.gs` (or equivalent) with the full contents of `apps-script/Confirmation.gs` from this repo.
2. **Save** the project.
3. In the editor, choose **Run** on **`configureRegistrationSheet`** (not the web app). Approve permissions when prompted.
4. Run **`configureBlacktopSender`** once with your dad’s sending Gmail (the account that owns/deploys the script), for example in the editor console or as a one-off function call:
   ```javascript
   configureBlacktopSender('dad-google-account@gmail.com');
   ```
   Use the **Google account email** that should send thank-you messages—not a `@bellsouth.net` address unless that inbox is a Google account used to deploy the script.
5. **Deploy → Manage deployments → Edit** (pencil) on the existing **Web app** deployment, set **Version** to **New version**, **Execute as: Me**, **Who has access: Anyone**, then **Deploy**.
6. Copy the **Web app URL** (`.../macros/s/.../exec`). If it changed, update `SHEET_ENDPOINT` in `index.html` and push to GitHub so GitHub Pages picks it up.

## Verify

In a browser, open the web app URL with no query string. You should see JSON like `{"success":false}` (that is correct for an empty visit).

Submit a test registration on [the live form](https://winstonac.github.io/blacktop-2/). You should see **Thank you for registering!** and a new row in the sheet.

## Email behavior

- **Organizer**: Registration details go to `robertjanice@bellsouth.net` (plain body, no personal footer).
- **Parent thank-you**: Sent from the configured Blacktop Google account when `configureBlacktopSender` matches the deploying user.
- **“Sent from my iPhone”** / **“Forwarded Message”**: Added by the sender’s mail app, not the form.

## Checkbox reminder (already on the live form)

If a parent submits without checking consent, the form blocks submit and shows: *Please check the box to agree to the terms before submitting.*

---

**Live form:** https://winstonac.github.io/blacktop-2/