// Find the registration form.
const registrationForm = document.getElementById("registration-form");

if (registrationForm) {
  const nameInput = document.getElementById("reg-name");
  const emailInput = document.getElementById("reg-email");
  const passwordInput = document.getElementById("reg-password");
  const confirmInput = document.getElementById("reg-confirm");
  const statusMessage = document.getElementById("registration-status");

  // Show or clear an error.
  function showError(input, message) {
    const error = document.getElementById(input.id + "-error");

    error.textContent = message;
    input.classList.toggle("is-invalid", message !== "");
    input.setAttribute("aria-invalid", message !== "");
  }

  // Check the form on submit.
  registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const inputs = [
      nameInput,
      emailInput,
      passwordInput,
      confirmInput
    ];

    // Clear previous results.
    statusMessage.textContent = "";

    inputs.forEach(function (input) {
      showError(input, "");
    });

    // Check required fields.
    inputs.forEach(function (input) {
      if (input.value.trim() === "") {
        showError(input, "This field is required.");
      }
    });

    // Check the email format.
    if (emailInput.value.trim() !== "" &&
        !emailInput.checkValidity()) {
      showError(emailInput, "Enter a valid email address.");
    }

    // Check the password length.
    if (passwordInput.value.trim() !== "" &&
        passwordInput.value.length < 8) {
      showError(passwordInput, "Use at least 8 characters.");
    }

    // Check password confirmation.
    if (confirmInput.value.trim() !== "" &&
        confirmInput.value !== passwordInput.value) {
      showError(confirmInput, "Passwords do not match.");
    }

    // Stop if a field is invalid.
    const firstError = registrationForm.querySelector(".is-invalid");

    if (firstError) {
      statusMessage.className = "text-danger mt-3 mb-0";
      statusMessage.textContent = "Please correct the highlighted fields.";
      firstError.focus();
      return;
    }

    // Show a successful demo result.
    statusMessage.className = "text-success mt-3 mb-0";
    statusMessage.textContent =
      "Validation passed! Demo only: no account was created.";

    registrationForm.reset();
  });

  // Clear the old result when editing.
  registrationForm.addEventListener("input", function () {
    statusMessage.textContent = "";
  });
}


// Task 3: subscription popup.
const subscriptionPopup = document.getElementById("subscription-popup");

if (subscriptionPopup) {
  const openButton = document.getElementById("open-subscription");
  const closeButton = document.getElementById("close-subscription");
  const subscriptionForm = document.getElementById("subscription-form");
  const subscriptionStatus = document.getElementById("subscription-status");

  // Open the popup.
  openButton.addEventListener("click", function () {
    subscriptionForm.reset();
    subscriptionStatus.textContent = "";
    subscriptionPopup.showModal();
  });

  // Close with the button.
  closeButton.addEventListener("click", function () {
    subscriptionPopup.close();
  });

  // Close when clicking the backdrop.
  subscriptionPopup.addEventListener("click", function (event) {
    if (event.target === subscriptionPopup) {
      subscriptionPopup.close();
    }
  });

  // Show the demo result.
  subscriptionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    subscriptionStatus.textContent =
      "Email accepted! Demo only: no subscription was created.";

    subscriptionForm.reset();
  });

  // Clear the result when editing.
  subscriptionForm.addEventListener("input", function () {
    subscriptionStatus.textContent = "";
  });
}