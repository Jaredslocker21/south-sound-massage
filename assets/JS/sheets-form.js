document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ssBookingForm");
  const statusEl = document.getElementById("ssStatus");
  const submitBtn = document.getElementById("ssSubmit");

  if (!form || !statusEl) return;

  const ENDPOINT = window.SS_SHEETS_ENDPOINT;

  if (!ENDPOINT || ENDPOINT.includes("PASTE_YOUR_EXEC_URL_HERE")) {
    statusEl.textContent = "❌ Missing endpoint URL. Add your Apps Script exec URL in contact.html.";
    statusEl.className = "ss-status ss-status--error";
    return;
  }

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = `ss-status ${type ? `ss-status--${type}` : ""}`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Basic required validation (because we used novalidate)
    const name = (form.name.value || "").trim();
    const email = (form.email.value || "").trim();
    const message = (form.message.value || "").trim();

    if (!name || !email || !message) {
      setStatus("❌ Please fill in Name, Email, and Message.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");
    setStatus("Sending…", "info");

    const payload = new URLSearchParams();
    payload.append("name", name);
    payload.append("email", email);
    payload.append("phone", (form.phone.value || "").trim());
    payload.append("message", message);
    payload.append("source", window.location.href);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: payload,
      });

      const text = await res.text();

      // Apps Script sometimes returns text/html; attempt JSON parse
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (_) {}

      // If it parsed as JSON, check ok
      if (data && data.ok === false) {
        throw new Error(data.error || "Server reported failure");
      }

      // If it didn't parse as JSON, still treat HTTP 200 as success
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setStatus("✅ Sent! I’ll get back to you soon.", "success");
      form.reset();
    } catch (err) {
      console.error(err);
      setStatus("❌ Couldn’t send right now. Try again or contact me directly.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("is-loading");
    }
  });
});
