// Replace the existing bound registration script with this file.
function doGet(e) {
  // A deployment opened in a browser must never create an empty registration.
  return handleSubmission(e);
}

function doPost(e) {
  return handleSubmission(e);
}

function registrationReceipt(success, emailsSent, retryEmails) {
  return ContentService.createTextOutput(JSON.stringify({ success: success, emailsSent: emailsSent === true, retryEmails: retryEmails === true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSubmission(e) {
  const data = (e && e.parameter) || {};
  if (data.consent !== 'Yes' || !data.firstName || !data.lastName ||
      !data.parentName || !data.signatureDate ||
      !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(data.parentEmail || '')) {
    return registrationReceipt(false);
  }

  const id = data.registrationId || Utilities.getUuid();
  if (!/^[a-f0-9-]{36}$/i.test(id)) return registrationReceipt(false);
  const lock = LockService.getScriptLock();
  let saved = false;
  try {
    lock.waitLock(10000);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form Responses 1');
    const width = Math.max(13, sheet.getLastColumn());
    const headers = sheet.getRange(1, 1, 1, width).getValues()[0];
    let idColumn = headers.indexOf('Blacktop registration ID') + 1;
    if (!idColumn) {
      idColumn = width + 1;
      if (idColumn > sheet.getMaxColumns()) sheet.insertColumnAfter(width);
      sheet.getRange(1, idColumn).setValue('Blacktop registration ID');
    }
    // Keep per-recipient status so retries only send outstanding messages.
    const deliveryColumns = ['Blacktop organizer email', 'Blacktop guardian email'].map(label => {
      const existing = headers.indexOf(label);
      if (existing >= 0) return existing + 1;
      const column = sheet.getLastColumn() + 1;
      if (column > sheet.getMaxColumns()) sheet.insertColumnAfter(column - 1);
      sheet.getRange(1, column).setValue(label);
      return column;
    });
    const count = sheet.getLastRow() - 1;
    const previous = count > 0 && sheet.getRange(2, idColumn, count, 1)
      .createTextFinder(id).matchEntireCell(true).findNext();
    let rowNumber;
    if (previous) {
      rowNumber = previous.getRow();
      const original = sheet.getRange(rowNumber, 2, 1, 3).getDisplayValues()[0];
      if (original[0] !== data.firstName || original[1] !== data.lastName ||
          original[2] !== data.parentEmail) return registrationReceipt(false);
    } else {
      const medical = [data.medicalConditions, data.medicalDetails].filter(Boolean).join(' - ');
      const row = [new Date(), data.firstName, data.lastName, data.parentEmail, data.phone,
        data.division, data.cashPaid, data.cashAmount, data.cashApp, data.cashAppAmount,
        data.parentName, medical, 'Electronic consent: ' + data.consent];
      while (row.length < idColumn) row.push('');
      row[idColumn - 1] = id;
      sheet.appendRow(row.map(value => typeof value === 'string' && /^[=+@-]/.test(value)
        ? "'" + value : (value || '')));
      rowNumber = sheet.getLastRow();
      for (const column of deliveryColumns) sheet.getRange(rowNumber, column).setValue('pending');
      SpreadsheetApp.flush();
    }
    saved = true;
    const send = [
      () => MailApp.sendEmail({
        to: 'robertjanice@bellsouth.net',
        subject: 'Blacktop Basketball Registration - ' + data.firstName + ' ' + data.lastName,
        body: registrationEmailBody(data)
      }),
      () => sendBlacktopThankYou(data)
    ];
    const statuses = deliveryColumns.map((column, i) => {
      const cell = sheet.getRange(rowNumber, column);
      const status = cell.getValue();
      if (status !== 'pending') return status;
      try {
        send[i]();
      } catch (error) {
        console.error('Email send failed for registration ' + id + ', recipient type ' + i);
        return 'pending';
      }
      cell.setValue('sent');
      SpreadsheetApp.flush();
      return 'sent';
    });
    return registrationReceipt(true, statuses.every(status => status === 'sent'), statuses.includes('pending'));
  } catch (error) {
    console.error('Registration processing failed', error.name);
    return registrationReceipt(saved);
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function registrationEmailBody(data) {
  const division = data.division || '';
  const formatDate = value => value ? value.split('-').slice(1).concat(value.slice(0, 4)).join('/') : '';
  return `BLACKTOP BASKETBALL REGISTRATION FORM
==========================================

DIVISION
------------------------------------------
Selected Division: ${division}

PLAYER INFORMATION
------------------------------------------
First Name: ${data.firstName || ''}
Last Name: ${data.lastName || ''}
Date of Birth: ${formatDate(data.dateOfBirth)}
Age: ${data.age || ''}
Address Line 1: ${data.addressLine1 || ''}
Address Line 2: ${data.addressLine2 || ''}
City: ${data.city || ''}
State: ${data.state || ''}
ZIP: ${data.zip || ''}
Phone Number: ${data.phone || ''}
Alternative Phone: ${data.altPhone || ''}

JERSEY & SHORTS
------------------------------------------
Jersey Size: ${data.jerseySize || ''}
Shorts Size: ${data.shortsSize || ''}

PLAYER TYPE & FEES
------------------------------------------
Player Type: ${data.playerType || ''}
${data.playerType === 'Returning Player (with uniform) — $105' ? `Jersey Color: ${data.jerseyColor || ''}
Jersey Number: ${data.jerseyNumber || ''}
Team: ${data.team || ''}` : ''}

PAYMENT METHOD
------------------------------------------
${data.cashPaid === 'Yes' ? `Cash Onsite: $${data.cashAmount || '0.00'}` : 'Cash Onsite: No'}
${data.cashApp === 'Yes' ? `CashApp: $${data.cashAppAmount || '0.00'}` : 'CashApp: No'}

MEDICAL INFORMATION
------------------------------------------
Medical Conditions: ${data.medicalConditions || ''}
${data.medicalConditions === 'Yes' ? 'Medical Details: ' + (data.medicalDetails || '') : 'Medical Details: N/A'}

WAIVERS & PERMISSIONS
------------------------------------------
WAIVER/LIABILITY FOR THE BLACKTOP MINISTRY BASKETBALL PROGRAM OF THE POTTER'S HOUSE INTERNATIONAL MINISTRIES CHURCH

I understand that this activity may subject me/my child to rigorous physical exertion and stress, and state that I/my child is in sufficient physical condition to accept this level of activity. I hereby consent to treatment, evacuation, anesthesia and/or operations, which might become necessary in the event of a medical emergency while I/my child is participating in this basketball program. I understand that health/accident insurance coverage is the responsibility of the participant or their parent/guardian. I understand and accept that playing basketball exposes my child to a number of risks. I have and do hereby release and forever discharge The Potter's House International Ministries Church (hereafter, "TPHIM"), the Blacktop Ministry Basketball Program and its agents, employees, directors, coaches and volunteers from any and all liability, actions, causes of action, claims and demands of any and all nature whatsoever which we now have or may ever had as a result of our participation in this program. I agree to indemnify and hold and save TPHIM and Blacktop Ministry Basketball Program harmless from any and all damages, loss or liability occurring by reason of any injury to any person or property caused by an act or omission, neglect or wrongdoing of TPHIM and Blacktop Ministry Basketball Program, myself or my child which may arise out of participation in this program. The TPHIM and Blacktop Ministry Basketball League youth basketball program is not a requirement and I/my child have freely chosen to participate. I hereby assume all risk of injury associated with this program. I give my permission to TPHIM and Blacktop Ministry Basketball Program to use my child's image or voice in basketball or church presentations for publicity. As a condition of participation in the Blacktop Ministry Basketball Program by my child or myself, I agree to 1) adhere to applicable rules, regulations, and policies prescribed by the Basketball Program and Church; and 2) exercise reasonable care and good judgment in such participation.

Permission to Use Photograph:
I give my permission to use my and/or my child's name, photographs, videos, quotations and likeness in any advertisements or promotions performed in connection with The Potter's House International Ministries Church and the Blacktop Ministry Basketball League events or other affiliated events, and agree that neither I nor my child shall be entitled to any compensation for such use. Prior to signing this document, I have had an adequate opportunity to read and understand it, have had an opportunity to ask questions about it, and any questions I had have been answered to my satisfaction. I understand that the Blacktop Basketball Program reserves the right to suspend the participation of any family which does not comply with its guidelines for registration and participate.

PARENT/GUARDIAN SIGNATURE
------------------------------------------
Electronic Signature Consent: ${data.consent || ''}
Parent/Guardian Full Name: ${data.parentName || ''}
Parent/Guardian Email: ${data.parentEmail || ''}
Signature Date: ${formatDate(data.signatureDate)}`;
}

function sendBlacktopThankYou(registration) {
  const configuredSender = PropertiesService.getScriptProperties()
    .getProperty('BLACKTOP_SENDER_EMAIL');
  const sender = Session.getEffectiveUser().getEmail();
  if (!configuredSender || sender.toLowerCase() !== configuredSender.trim().toLowerCase()) {
    throw new Error('Configure the Blacktop sending account before enabling confirmations.');
  }

  const recipient = String(registration.parentEmail || '').trim();
  if (registration.consent !== 'Yes' || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(recipient)) {
    throw new Error('A signed registration and one guardian email address are required.');
  }

  MailApp.sendEmail({
    to: recipient,
    name: 'Blacktop Basketball',
    replyTo: 'robertjanice@bellsouth.net',
    subject: 'Thank you for registering with Blacktop Basketball',
    body: 'Thank you for signing up for Blacktop Basketball! We received your registration. ' +
      'If you have any questions before the season starts, reply to this email.\n\n' +
      'See you on the court!\nRobert Mitchell\nBlacktop Basketball'
  });
}
