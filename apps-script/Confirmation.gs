/**
 * Blacktop registration: email to Coach Mitchell (required for success) +
 * optional row in the existing sheet (BLACKTOP_SHEET_ID in Script properties).
 */

function doGet(e) {
  return handleSubmission(e);
}

function doPost(e) {
  return handleSubmission(e);
}

function jsonReceipt(success, parentThankYouSent) {
  return ContentService.createTextOutput(JSON.stringify({
    success: success === true,
    emailsSent: parentThankYouSent === true,
    retryEmails: false
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleSubmission(e) {
  const data = (e && e.parameter) || {};

  if (data.consent !== 'Yes' || !data.firstName || !data.lastName ||
      !data.parentName || !data.signatureDate ||
      !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(data.parentEmail || '')) {
    return jsonReceipt(false);
  }

  try {
    MailApp.sendEmail({
      to: 'robertjanice@bellsouth.net',
      subject: 'Blacktop Basketball Registration - ' + data.firstName + ' ' + data.lastName,
      body: registrationEmailBody(data)
    });
  } catch (error) {
    console.error('Organizer email failed', error);
    return jsonReceipt(false);
  }

  try {
    appendToRegistrationSheet(data);
  } catch (error) {
    console.error('Sheet backup failed (email already sent)', error);
  }

  var parentThankYouSent = false;
  try {
    sendBlacktopThankYou(data);
    parentThankYouSent = true;
  } catch (error) {
    console.error('Thank-you email skipped', error);
  }

  return jsonReceipt(true, parentThankYouSent);
}

function getRegistrationSheet() {
  const sheetId = PropertiesService.getScriptProperties().getProperty('BLACKTOP_SHEET_ID');
  if (!sheetId) return null;
  const ss = SpreadsheetApp.openById(sheetId);
  const preferredNames = ['Blacktop League Registration', 'Form Responses 1', 'Sheet1'];
  for (const name of preferredNames) {
    const tab = ss.getSheetByName(name);
    if (tab) return tab;
  }
  return ss.getSheets()[0] || null;
}

function sheetCell(value) {
  if (value === undefined || value === null) return '';
  if (value instanceof Date) return value;
  const text = String(value);
  return /^[=+@-]/.test(text) ? "'" + text : text;
}

function appendToRegistrationSheet(data) {
  const sheet = getRegistrationSheet();
  if (!sheet) return;
  const row = [
    new Date(),
    data.registrationId || '',
    data.firstName || '',
    data.lastName || '',
    data.dateOfBirth || '',
    data.age || '',
    data.addressLine1 || '',
    data.addressLine2 || '',
    data.city || '',
    data.state || '',
    data.zip || '',
    data.phone || '',
    data.altPhone || '',
    data.division || '',
    data.playerType || '',
    data.jerseyColor || '',
    data.jerseyNumber || '',
    data.team || '',
    data.jerseySize || '',
    data.shortsSize || '',
    data.cashPaid || '',
    data.cashAmount || '',
    data.cashApp || '',
    data.cashAppAmount || '',
    data.medicalConditions || '',
    data.medicalDetails || '',
    data.consent || '',
    data.parentName || '',
    data.parentEmail || '',
    data.signatureDate || ''
  ].map(sheetCell);
  sheet.appendRow(row);
  SpreadsheetApp.flush();
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

/** Run once from the editor (pick this in the Run menu — no arguments needed). */
function linkBlacktopRegistrationSheet() {
  return configureBlacktopSheet('1IGCe_0FgI2K_C_4meBq7wCYOQzbMH18NxQi1ROp8vJs');
}

/** Run once: configureBlacktopSheet('1IGCe_0FgI2K_C_4meBq7wCYOQzbMH18NxQi1ROp8vJs'); */
function configureBlacktopSheet(sheetId) {
  const id = String(sheetId || '').trim();
  if (!/^[a-zA-Z0-9_-]{20,}$/.test(id)) {
    throw new Error('Pass the spreadsheet ID from the sheet URL (between /d/ and /edit).');
  }
  PropertiesService.getScriptProperties().setProperty('BLACKTOP_SHEET_ID', id);
  const sheet = getRegistrationSheet();
  if (!sheet) {
    throw new Error('BLACKTOP_SHEET_ID saved but could not open a tab. Share the sheet with this Google account and check the tab name.');
  }
  return 'Linked tab: ' + sheet.getName();
}

/**
 * Run once in the editor (no web form). Appends one test row — remove it from the sheet after.
 */
var SMOKE_TEST_FIXTURE_ = {
  registrationId: 'smoke-test-id',
  firstName: 'SMOKE',
  lastName: 'FULLTEST',
  dateOfBirth: '2015-06-01',
  age: '11',
  addressLine1: '999 Smoke Test Ln',
  addressLine2: '',
  city: 'Jacksonville',
  state: 'FL',
  zip: '32207',
  phone: '(555) 999-0001',
  altPhone: '',
  division: 'Junior (8-11)',
  playerType: 'New Player — $135',
  jerseyColor: '',
  jerseyNumber: '',
  team: '',
  jerseySize: 'Youth M',
  shortsSize: 'Youth M',
  cashPaid: 'No',
  cashAmount: '',
  cashApp: 'No',
  cashAppAmount: '',
  medicalConditions: 'No',
  medicalDetails: '',
  consent: 'Yes',
  parentName: 'Smoke Test Guardian',
  parentEmail: 'smoke-full-test@example.com',
  signatureDate: '2026-11-24'
};

/** Editor-only: append + read back 30 columns. Delete the row after. */
function fullSmokeTestWithSheet() {
  const sheetId = PropertiesService.getScriptProperties().getProperty('BLACKTOP_SHEET_ID');
  if (!sheetId) {
    throw new Error('Run configureBlacktopSheet(\'1IGCe_0FgI2K_C_4meBq7wCYOQzbMH18NxQi1ROp8vJs\') first.');
  }
  appendToRegistrationSheet(SMOKE_TEST_FIXTURE_);
  const sheet = getRegistrationSheet();
  const rowNum = sheet.getLastRow();
  const cols = 30;
  const values = sheet.getRange(rowNum, 1, rowNum, cols).getValues()[0];
  const checks = [
    { col: 3, label: 'First Name', expect: 'SMOKE' },
    { col: 4, label: 'Last Name', expect: 'FULLTEST' },
    { col: 14, label: 'Division', expect: 'Junior (8-11)' },
    { col: 29, label: 'Parent Email', expect: 'smoke-full-test@example.com' }
  ];
  const failures = checks.filter(function (c) {
    return String(values[c.col - 1] || '') !== c.expect;
  });
  if (failures.length) {
    throw new Error('Sheet row ' + rowNum + ' failed: ' + failures.map(function (f) {
      return f.label + ' expected ' + f.expect + ' got ' + values[f.col - 1];
    }).join('; '));
  }
  return 'PASS — row ' + rowNum + ' has 30 columns. Delete SMOKE FULLTEST when done.';
}

function smokeTestSheetAppend() {
  appendToRegistrationSheet(SMOKE_TEST_FIXTURE_);
  return 'Row appended. Check the sheet, then delete the SMOKE TEST row.';
}

/** Optional: set Script property BLACKTOP_SENDER_EMAIL to the deploying Gmail (wcampbell0880@gmail.com). */
function configureBlacktopSender(senderEmail) {
  const email = String(senderEmail || Session.getActiveUser().getEmail() || '').trim();
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)) {
    throw new Error('Pass a valid Gmail address for thank-you emails.');
  }
  PropertiesService.getScriptProperties().setProperty('BLACKTOP_SENDER_EMAIL', email);
}

function sendBlacktopThankYou(registration) {
  const configuredSender = PropertiesService.getScriptProperties().getProperty('BLACKTOP_SENDER_EMAIL');
  const sender = Session.getEffectiveUser().getEmail();
  if (!configuredSender || sender.toLowerCase() !== configuredSender.trim().toLowerCase()) {
    throw new Error('Run configureBlacktopSender with the deploying Google account.');
  }

  const recipient = String(registration.parentEmail || '').trim();
  if (registration.consent !== 'Yes' || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(recipient)) {
    throw new Error('Invalid guardian email.');
  }

  MailApp.sendEmail({
    to: recipient,
    name: 'Coach Mitchell, Blacktop Basketball',
    replyTo: 'robertjanice@bellsouth.net',
    subject: 'Thank you for registering with Blacktop Basketball',
    body: 'Thank you for signing up for Blacktop Basketball! We received your registration. ' +
      'If you have any questions before the season starts, reply to this email.\n\n' +
      'See you on the court!\nCoach Mitchell\nBlacktop Basketball'
  });
}