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

    statusMessage.textContent = "";

    nameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmError.textContent = "";

    nameInput.classList.remove("is-invalid");
    emailInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");
    confirmInput.classList.remove("is-invalid");

    nameInput.setAttribute("aria-invalid", "false");
    emailInput.setAttribute("aria-invalid", "false");
    passwordInput.setAttribute("aria-invalid", "false");
    confirmInput.setAttribute("aria-invalid", "false");


const name = nameInput.value.trim();

const hasLetter = /[a-zа-яёәғқңөұүһі]/i.test(name);

const hasLink =
  /https?:\/\/|www\.|[a-zа-яёәғқңөұүһі0-9-]+\.[a-zа-яёәғқңөұүһі]{2,}/i.test(name);

if (name === "") {
  nameError.textContent = "Enter your name.";
} else if (name.length < 2) {
  nameError.textContent = "Your name must contain at least 2 characters.";
} else if (hasLink) {
  nameError.textContent = "Links are not allowed in your name.";
} else if (!hasLetter) {
  nameError.textContent = "Your name must contain at least one letter.";
}

if (nameError.textContent !== "") {
  nameInput.classList.add("is-invalid");
  nameInput.setAttribute("aria-invalid", "true");
}

const email = emailInput.value.trim();
emailInput.value = email;

const hasValidDomain = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[a-z]{2,}$/i.test(email);

if (email === "") {
  emailError.textContent = "Enter your email.";
} else if (!emailInput.checkValidity() || !hasValidDomain) {
  emailError.textContent =
    "Enter a valid email with at least 2 letters after the last dot.";
}

if (emailError.textContent !== "") {
  emailInput.classList.add("is-invalid");
  emailInput.setAttribute("aria-invalid", "true");
}


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


    const firstError =
      registrationForm.querySelector(".is-invalid");

    if (firstError) {
      statusMessage.className = "text-danger mt-3 mb-0";
      statusMessage.textContent =
        "Please correct the highlighted fields.";

      firstError.focus();
      return;
    }


    statusMessage.className = "text-success mt-3 mb-0";
    statusMessage.textContent =
      "Validation passed! Demo only: no account was created.";

    registrationForm.reset();
  });


  registrationForm.addEventListener("input", function () {
    statusMessage.textContent = "";
  });
}

// Subscription dialog.
const subscriptionPopup = document.getElementById("subscription-popup");

if (subscriptionPopup) {
  const openButton = document.getElementById("open-subscription");
  const closeButton = document.getElementById("close-subscription");
  const subscriptionForm = document.getElementById("subscription-form");
  const subscriptionStatus = document.getElementById("subscription-status");


  openButton.addEventListener("click", function () {

    subscriptionForm.reset();

    subscriptionStatus.textContent = "";

    subscriptionPopup.showModal();
  });


  closeButton.addEventListener("click", function () {
    subscriptionPopup.close();
  });


  // Clicking the backdrop closes the dialog.
  subscriptionPopup.addEventListener("click", function (event) {

    if (event.target === subscriptionPopup) {
      subscriptionPopup.close();
    }

  });


  subscriptionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    subscriptionStatus.textContent =
      "Email accepted! Demo only: no subscription was created.";

    subscriptionForm.reset();
  });


  subscriptionForm.addEventListener("input", function () {
    subscriptionStatus.textContent = "";
  });
}

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  const contactEmail = document.getElementById("cf-email");
  const contactEmailError = document.getElementById("cf-email-error");
  const contactStatus = document.getElementById("form-status");

  function handleContactSubmit(event) {
    event.preventDefault();

    const email = contactEmail.value.trim();
    contactEmail.value = email;

    const  hasValidDomain =/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[a-z]{2,}$/i.test(email);

    if (!contactEmail.checkValidity() || !hasValidDomain) {
      contactEmailError.textContent = "";
contactStatus.textContent = "";

if (email === "") {
  contactEmailError.textContent = "Enter your email.";
} else if (!contactEmail.checkValidity()) {
  contactEmailError.textContent =
    "Enter a valid email address, for example 123@mail.kz.";
} else if (!hasValidDomain) {
  contactEmailError.textContent =
    "The domain must end with at least 2 letters, for example .kz or .com.";
}

if (contactEmailError.textContent !== "") {
  contactEmail.classList.add("is-invalid");
  contactEmail.setAttribute("aria-invalid", "true");
  contactEmail.focus();
  return;
}
}

    contactEmail.classList.remove("is-invalid");
    contactEmail.setAttribute("aria-invalid", "false");

if (!contactForm.reportValidity()) {
  contactStatus.textContent = "";
  return;
}
    contactStatus.textContent =
      "Demo form: validation passed. No message was sent.";
  }

  function clearContactEmailError() {
  contactEmail.classList.remove("is-invalid");
  contactEmail.setAttribute("aria-invalid", "false");
  contactEmailError.textContent = "";
  contactStatus.textContent = "";
}
  

  contactForm.addEventListener("submit", handleContactSubmit);
  contactEmail.addEventListener("input", clearContactEmailError);
}


const loginDialog = document.getElementById("login-dialog");

if (loginDialog) {
  document.getElementById("open-login").addEventListener("click", function () {
    loginDialog.showModal();
  });

  document.getElementById("close-login").addEventListener("click", function () {
    loginDialog.close();
  });
}
