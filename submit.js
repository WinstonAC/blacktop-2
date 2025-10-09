(function () {
  const form = document.getElementById('regForm');
  if (!form) return;

  const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw8IVW6sZCpjbuLZ7sc6Qkiy3TXsJfSdEK0qasZgdvGSElIMXWDmpGrDa7zIQ6gD-n47g/exec';

  form.addEventListener('submit', function () {
    try {
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());

      // fire-and-forget send to Google Sheets
      fetch(SHEET_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(err => console.error("Sheets error:", err));

      // DO NOT preventDefault, let the form continue its original email submission
      console.log("Submitted to Sheets + email endpoint");
    } catch (err) {
      console.error("Submit.js error:", err);
    }
  });
})();
