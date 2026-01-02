document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ssBookingForm");
  const statusEl = document.getElementById("ssStatus");
  const submitBtn = document.getElementById("ssSubmitBtn");

  if (!form || !statusEl) return;

  const ENDPOINT = "https://script.google.com/macros/s/AKfycbwLBAsqouVVV08l79aKxUJMWz0X1tCxKonPdtMqG_XMgyIblfzxhvfNDvdHgnh093ylvA/exec";

  let isSending = false;
  let lastSentAt = 0;
  const COOLDOWN_MS = 15_000; // 15 seconds

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  function digitsOnly(str) {
    return (str || "").replace(/\D+/g, "");
  }

  function normalizePhone(str) {
    return (str || "").replace(/[^\d+]/g, "").trim();
  }

  function setStatus(msg, ok = false) {
    statusEl.textContent = msg;
    statusEl.classList.toggle("is-ok", ok);
    statusEl.classList.toggle("is-bad", !ok);
  }

  function validate(fd) {
    const errors = [];

    const name = (fd.get("name") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();
    const message = (fd.get("message") || "").toString().trim();
    const phoneRaw = (fd.get("phone") || "").toString().trim();
    const websiteHp = (fd.get("website") || "").toString().trim(); // honeypot

    // Honeypot: if filled, treat as bot
    if (websiteHp) {
      errors.push("Spam detected.");
      return { ok: false, errors };
    }

    // Required fields
    if (name.length < 2) errors.push("Please enter your name (at least 2 characters).");
    if (!emailRegex.test(email)) errors.push("Please enter a valid email address.");
    if (message.length < 10) errors.push("Please write a short message (at least 10 characters).");

    // Optional phone, but if provided validate it
    if (phoneRaw) {
      const phoneNorm = normalizePhone(phoneRaw);
      const digits = digitsOnly(phoneNorm);

      // Basic sanity: most real numbers are 7–15 digits (E.164 max is 15)
      if (digits.length < 7 || digits.length > 15) {
        errors.push("Phone number looks invalid. Use 7–15 digits (you can include +, spaces, or hyphens).");
      }
      // If it contains +, it should be first char
      if (phoneNorm.includes("+") && !phoneNorm.startsWith("+")) {
        errors.push("Phone number format is invalid (the + must be at the start).");
      }
    }

    return { ok: errors.length === 0, errors };
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSending) return;

    const now = Date.now();
    if (now - lastSentAt < COOLDOWN_MS) {
      const s = Math.ceil((COOLDOWN_MS - (now - lastSentAt)) / 1000);
      setStatus(`Please wait ${s}s before sending again.`);
      return;
    }

    const fd = new FormData(form);
    const check = validate(fd);

    if (!check.ok) {
      setStatus("❌ " + check.errors[0]); // show first error (clean + simple)
      return;
    }

    // Passed validation ✅
    setStatus("Sending…", true);
    isSending = true;
    if (submitBtn) submitBtn.disabled = true;

    const payload = new URLSearchParams();
    payload.append("name", (fd.get("name") || "").toString().trim());
    payload.append("email", (fd.get("email") || "").toString().trim());
    payload.append("phone", (fd.get("phone") || "").toString().trim());
    payload.append("message", (fd.get("message") || "").toString().trim());
    payload.append("company", (fd.get("company") || "").toString().trim());
    payload.append("website", (fd.get("website") || "").toString().trim()); // honeypot included
    payload.append("source", window.location.href);

    try {
      const res = await fetch(ENDPOINT, { method: "POST", body: payload });
      const text = await res.text();

      let data = null;
      try { data = JSON.parse(text); } catch (_) {}

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (data && data.ok === false) throw new Error(data.error || "Request failed");

      lastSentAt = Date.now();
      setStatus("✅ Sent! I’ll get back to you soon.", true);
      form.reset();
    } catch (err) {
      console.error(err);
      setStatus("❌ Couldn’t send right now. Please try again or contact me directly.");
    } finally {
      isSending = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
