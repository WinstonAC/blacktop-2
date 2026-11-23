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

function appendToRegistrationSheet(data) {
  const sheet = getRegistrationSheet();
  if (!sheet) return;
  const medical = [data.medicalConditions, data.medicalDetails].filter(Boolean).join(' - ');
  const row = [
    new Date(),
    data.firstName || '',
    data.lastName || '',
    data.parentEmail || '',
    data.phone || '',
    data.division || '',
    data.cashPaid || '',
    data.cashAmount || '',
    data.cashApp || '',
    data.cashAppAmount || '',
    data.parentName || '',
    medical,
    'Electronic consent: ' + (data.consent || '')
  ].map(value => typeof value === 'string' && /^[=+@-]/.test(value) ? "'" + value : (value || ''));
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