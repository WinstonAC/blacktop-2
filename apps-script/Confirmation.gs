// Call from the branch of the registration handler that saves a new signup.
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
