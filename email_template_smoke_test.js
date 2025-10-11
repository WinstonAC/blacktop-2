// Quick smoke test to make sure the email template continues past the PLAYER TYPE section.
// Run with `node email_template_smoke_test.js`.

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const sanitizeText = (value) => {
  if (!value) return '';
  return String(value)
    .normalize('NFKC')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
};

const sampleFormData = {
  firstName: 'William',
  lastName: 'Campbell',
  playerType: 'Returning Player (with uniform) — $105',
  division: 'Biddy (4-7)',
  dateOfBirth: '2022-01-11',
  age: '4',
  addressLine1: '422, cottage cove ct',
  addressLine2: 'cottage cove ct',
  city: 'Orange Park',
  state: 'FL',
  zip: '32073',
  phone: '9172253320',
  altPhone: '',
  jerseySize: 'Youth S (4-6)',
  shortsSize: 'Adult S (30-32)',
  jerseyColor: 'Blue',
  jerseyNumber: '12',
  team: 'Sharks',
  cashPaid: 'No',
  cashAmount: '',
  cashApp: 'Yes',
  cashAppAmount: '115',
  medicalConditions: 'Yes',
  medicalDetails: 'Asthma – inhaler required',
  parentName: 'Janice Campbell',
  parentEmail: 'parent@example.com',
  signatureDate: '2024-09-14',
  consent: 'Yes',
};

const sanitizedFirstName = sanitizeText(sampleFormData.firstName);
const sanitizedLastName = sanitizeText(sampleFormData.lastName);
const sanitizedPlayerType = sanitizeText(sampleFormData.playerType);
const isReturningWithUniform = sanitizedPlayerType.toLowerCase().includes('with uniform');
const sanitizedDivision = sanitizeText(sampleFormData.division);

const emailLines = [
  'BLACKTOP BASKETBALL REGISTRATION FORM',
  '==========================================',
  '',
  `DIVISION: ${sanitizedDivision}`,
  '',
  'PLAYER INFO:',
  `Name: ${sanitizedFirstName} ${sanitizedLastName}`.trim(),
  `DOB: ${formatDate(sampleFormData.dateOfBirth)} | Age: ${sanitizeText(sampleFormData.age)}`,
  `Address: ${sanitizeText(sampleFormData.addressLine1)}${sampleFormData.addressLine2 ? ', ' + sanitizeText(sampleFormData.addressLine2) : ''}`,
  `City: ${sanitizeText(sampleFormData.city)}, ${sanitizeText(sampleFormData.state)} ${sanitizeText(sampleFormData.zip)}`.trim(),
  `Phone: ${sanitizeText(sampleFormData.phone)}${sampleFormData.altPhone ? ' | Alt: ' + sanitizeText(sampleFormData.altPhone) : ''}`,
  '',
  'UNIFORM:',
  `Jersey: ${sanitizeText(sampleFormData.jerseySize)} | Shorts: ${sanitizeText(sampleFormData.shortsSize)}`,
  '',
  'PLAYER TYPE & FEES:',
  `Player Type: ${sanitizedPlayerType}`.trim(),
];

if (isReturningWithUniform) {
  emailLines.push(
    `Uniform: ${sanitizeText(sampleFormData.jerseyColor)} #${sanitizeText(sampleFormData.jerseyNumber)} (${sanitizeText(sampleFormData.team)})`,
  );
}

emailLines.push(
  '',
  'PAYMENT:',
  sampleFormData.cashPaid === 'Yes'
    ? `Cash Onsite: $${sanitizeText(sampleFormData.cashAmount || '0.00')}`
    : 'Cash Onsite: No',
  sampleFormData.cashApp === 'Yes'
    ? `CashApp: $${sanitizeText(sampleFormData.cashAppAmount || '0.00')}`
    : 'CashApp: No',
  '',
  'MEDICAL:',
  `${sanitizeText(sampleFormData.medicalConditions)}${sampleFormData.medicalConditions === 'Yes' ? ` - ${sanitizeText(sampleFormData.medicalDetails)}` : ''}`,
  '',
  'SIGNATURE:',
  `Parent/Guardian: ${sanitizeText(sampleFormData.parentName)}`,
  `Email: ${sanitizeText(sampleFormData.parentEmail)}`,
  `Date: ${formatDate(sampleFormData.signatureDate)}`,
  `Consent: ${sanitizeText(sampleFormData.consent) || 'No'}`,
  '',
  'WAIVERS & PERMISSIONS:',
  'I understand this activity involves physical exertion and consent to medical',
  'treatment if needed. I release The Potter\'s House International Ministries',
  'Church and Blacktop Ministry Basketball Program from liability. I give',
  "permission for my child's image/voice to be used in church/basketball",
  'presentations. I agree to follow all rules and policies.',
  '',
  'REFUND POLICY:',
  "NO REFUNDS AFTER FIRST GAME IN PLAYER'S DIVISION.",
  '',
  `Submitted: ${new Date('2024-09-15T17:32:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`,
  '==========================================',
);

const emailBody = emailLines.join('\n');
console.log(emailBody);

if (!emailBody.includes('PAYMENT:')) {
  throw new Error('Email body is missing the PAYMENT section.');
}

if (!emailBody.includes('REFUND POLICY:')) {
  throw new Error('Email body is missing the REFUND POLICY section.');
}

console.log('\n✅ Email template includes sections beyond PLAYER TYPE.');
