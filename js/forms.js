const registrationForm = document.getElementById("registration-form");

if (registrationForm) {
  const nameInput = document.getElementById("reg-name");
  const emailInput = document.getElementById("reg-email");
  const passwordInput = document.getElementById("reg-password");
  const confirmInput = document.getElementById("reg-confirm");

  const nameError = document.getElementById("reg-name-error");
  const emailError = document.getElementById("reg-email-error");
  const passwordError = document.getElementById("reg-password-error");
  const confirmError = document.getElementById("reg-confirm-error");

  const statusMessage = document.getElementById("registration-status");

  registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Clear old messages
    statusMessage.textContent = "";

    nameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmError.textContent = "";

    // Remove old red borders
    nameInput.classList.remove("is-invalid");
    emailInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");
    confirmInput.classList.remove("is-invalid");

    // Reset accessibility state
    nameInput.setAttribute("aria-invalid", "false");
    emailInput.setAttribute("aria-invalid", "false");
    passwordInput.setAttribute("aria-invalid", "false");
    confirmInput.setAttribute("aria-invalid", "false");


    // Check name
    if (nameInput.value.trim() === "") {
      nameError.textContent = "This field is required.";
      nameInput.classList.add("is-invalid");
      nameInput.setAttribute("aria-invalid", "true");
    }


    // Check email
    if (emailInput.value.trim() === "") {
      emailError.textContent = "This field is required.";
      emailInput.classList.add("is-invalid");
      emailInput.setAttribute("aria-invalid", "true");
    } 
    else if (!emailInput.checkValidity()) {
      emailError.textContent = "Enter a valid email address.";
      emailInput.classList.add("is-invalid");
      emailInput.setAttribute("aria-invalid", "true");
    }


    // Check password
    if (passwordInput.value.trim() === "") {
      passwordError.textContent = "This field is required.";
      passwordInput.classList.add("is-invalid");
      passwordInput.setAttribute("aria-invalid", "true");
    } 
    else if (passwordInput.value.length < 8) {
      passwordError.textContent = "Use at least 8 characters.";
      passwordInput.classList.add("is-invalid");
      passwordInput.setAttribute("aria-invalid", "true");
    }


    // Check confirm password
    if (confirmInput.value.trim() === "") {
      confirmError.textContent = "This field is required.";
      confirmInput.classList.add("is-invalid");
      confirmInput.setAttribute("aria-invalid", "true");
    } 
    else if (confirmInput.value !== passwordInput.value) {
      confirmError.textContent = "Passwords do not match.";
      confirmInput.classList.add("is-invalid");
      confirmInput.setAttribute("aria-invalid", "true");
    }


    // Find first incorrect field
    const firstError =
      registrationForm.querySelector(".is-invalid");

    if (firstError) {
      statusMessage.className = "text-danger mt-3 mb-0";
      statusMessage.textContent =
        "Please correct the highlighted fields.";

      firstError.focus();
      return;
    }


    // Everything is correct
    statusMessage.className = "text-success mt-3 mb-0";
    statusMessage.textContent =
      "Validation passed! Demo only: no account was created.";

    registrationForm.reset();
  });


  // Clear success/error status when user starts typing again
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


  // Open popup
  openButton.addEventListener("click", function () {

    // Clear old form data
    subscriptionForm.reset();

    // Clear old message
    subscriptionStatus.textContent = "";

    // Show popup
    subscriptionPopup.showModal();
  });


  // Close popup
  closeButton.addEventListener("click", function () {
    subscriptionPopup.close();
  });


  // Close popup when clicking outside
  subscriptionPopup.addEventListener("click", function (event) {

    if (event.target === subscriptionPopup) {
      subscriptionPopup.close();
    }

  });


  // Submit subscription form
  subscriptionForm.addEventListener("submit", function (event) {

    // Do not reload the page
    event.preventDefault();

    // Show success message
    subscriptionStatus.textContent =
      "Email accepted! Demo only: no subscription was created.";

    // Clear email field
    subscriptionForm.reset();
  });


  // Clear old message when user starts typing
  subscriptionForm.addEventListener("input", function () {
    subscriptionStatus.textContent = "";
  });
}