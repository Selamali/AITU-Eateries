/* Local-only demo: no requests, URL parameters, cookies or storage. */
(() => {
  const form = document.getElementById("contact-form");
  const fields = document.getElementById("contact-fields");
  const status = document.getElementById("form-status");
  if (!form || !fields || !status) return;

  // Install the guard before enabling fields. Without JS the demo is inert.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.textContent =
      "Demo successful: your form passed validation. No message was sent and no data was saved. Use the contact links above to reach the team.";
    form.reset();
  });
  for (const id of ["cf-name", "cf-message"]) {
    const input = document.getElementById(id);
    input.addEventListener("input", () => {
      input.setCustomValidity(
        input.value.trim() ? "" : "Please enter text, not only spaces.",
      );
    });
  }
  form.addEventListener("input", () => {
    status.textContent = "";
  });
  form.addEventListener("change", () => {
    status.textContent = "";
  });
  fields.disabled = false;
})();
