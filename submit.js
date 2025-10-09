(function () {
  const form = document.getElementById('regForm');
  if (!form) {
    console.error("Form with id='regForm' not found.");
    return;
  }

  const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw8IVW6sZCpjbuLZ7sc6Qkiy3TXsJfSdEK0qasZgdvGSElIMXWDmpGrDa7zIQ6gD-n47g/exec';

  form.addEventListener('submit', async function () {
    const fd = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of fd.entries()) {
      params.append(key, value);
    }

    try {
      const res = await fetch(SHEET_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      const text = await res.text();
      alert("Sheets response: " + text);
      console.log("Sheets response:", text);
    } catch (err) {
      alert("Error sending to Sheets: " + err);
      console.error("Sheets fetch error:", err);
    }
  });
})();
