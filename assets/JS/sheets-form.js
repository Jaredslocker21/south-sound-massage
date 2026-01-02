document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ssBookingForm");
  const statusEl = document.getElementById("ssStatus");

  if (!form || !statusEl) return;

  const ENDPOINT = "https://script.google.com/macros/s/AKfycbwLBAsqouVVV08l79aKxUJMWz0X1tCxKonPdtMqG_XMgyIblfzxhvfNDvdHgnh093ylvA/exec"; // /exec

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "Sending…";

    const fd = new FormData(form);

    const payload = new URLSearchParams();
    payload.append("name", (fd.get("name") || "").toString().trim());
    payload.append("email", (fd.get("email") || "").toString().trim());
    payload.append("phone", (fd.get("phone") || "").toString().trim());
    payload.append("message", (fd.get("message") || "").toString().trim());
    payload.append("company", (fd.get("company") || "").toString().trim());
    payload.append("source", window.location.href);

    try {
      const res = await fetch(ENDPOINT, { method: "POST", body: payload });

      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch (_) {}

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (data && data.ok === false) throw new Error(data.error || "Request failed");

      statusEl.textContent = "✅ Sent! I’ll get back to you soon.";
      form.reset();
    } catch (err) {
      console.error(err);
      statusEl.textContent = "❌ Couldn’t send right now. Try again or contact me directly.";
    }
  });
});
