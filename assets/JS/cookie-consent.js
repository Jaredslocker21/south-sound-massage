(function () {
  const KEY = "ssm_cookie_consent_v1";

  function getConsent() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    localStorage.setItem(KEY, JSON.stringify(value));
  }

  function loadThirdPartyEmbeds() {
    document.querySelectorAll("iframe[data-src]").forEach((iframe) => {
      iframe.src = iframe.dataset.src;
      iframe.style.display = "block";
      iframe.removeAttribute("data-src");
    });

    document.querySelectorAll(".cookie-blocked").forEach((el) => {
      el.style.display = "none";
    });
  }

  function hideBar() {
    const bar = document.getElementById("cookie-bar");
    if (bar) bar.style.display = "none";
  }

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("js-accept-thirdparty")) {
      setConsent({ thirdparty: true, ts: Date.now() });
      hideBar();
      loadThirdPartyEmbeds();
    }
  });

  const accept = document.getElementById("cookie-accept");
  const decline = document.getElementById("cookie-decline");

  if (accept) {
    accept.addEventListener("click", function () {
      setConsent({ thirdparty: true, ts: Date.now() });
      hideBar();
      loadThirdPartyEmbeds();
    });
  }

  if (decline) {
    decline.addEventListener("click", function () {
      setConsent({ thirdparty: false, ts: Date.now() });
      hideBar();
    });
  }

  const consent = getConsent();
  if (!consent) {
    document.getElementById("cookie-bar").style.display = "flex";
  } else if (consent.thirdparty) {
    loadThirdPartyEmbeds();
    hideBar();
  } else {
    hideBar();
  }
})();
