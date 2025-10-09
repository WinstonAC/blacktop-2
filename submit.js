(function () {
  const form = document.getElementById('regForm');
  if (!form) return;

  const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw8IVW6sZCpjbuLZ7sc6Qkiy3TXsJfSdEK0qasZgdvGSElIMXWDmpGrDa7zIQ6gD-n47g/exec';

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    // (1) Keep sending the form to the existing email endpoint
    const emailPromise = fetch(form.action, {
      method: form.method || 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' }
    });

    // (2) Also send the data to Google Sheets
    const sheetPromise = fetch(SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    try {
      await emailPromise; // email must succeed
      await Promise.race([sheetPromise, new Promise(r => setTimeout(r, 400))]);
      alert("Thanks! You're registered.");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Submission error — please try again.");
    }
  });
})();
