#!/usr/bin/env node
/**
 * End-to-end smoke test (web app + email + sheet if deployed).
 * Does NOT verify the sheet — run fullSmokeTestWithSheet() in Apps Script for that.
 *
 * Usage: node scripts/smoke-test-web.mjs
 */

const ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzL_g7_gJ50kngSZ7Xeij5OXjfOQ_kq9JBi1PUqTp8QBeOfRW4dBc7n_2RsrAbNT70sEw/exec';

const data = {
  registrationId: `smoke-${Date.now()}`,
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
  signatureDate: '2026-11-24',
};

const res = await fetch(ENDPOINT, {
  method: 'POST',
  body: new URLSearchParams(data),
  redirect: 'follow',
});

const text = await res.text();
let receipt;
try {
  receipt = JSON.parse(text);
} catch {
  console.error('FAIL — not JSON (HTTP', res.status, ')');
  console.error(text.slice(0, 200));
  process.exit(1);
}

if (res.status !== 200 || receipt.success !== true) {
  console.error('FAIL —', res.status, receipt);
  process.exit(1);
}

console.log('PASS — web app:', receipt);
console.log('Next: open the sheet and confirm row SMOKE / FULLTEST (30 cols), then delete test rows.');
console.log('Coach inbox will have test emails — ignore or delete.');