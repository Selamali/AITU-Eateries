// Task 4: cycle through three page colors without saving the choice.
const changeBgButton = document.getElementById("change-bg-button");

if (changeBgButton) {
  const backgroundColors = ["#eef6ef", "#fff8ec", "#f7f8f3"];
  let colorIndex = 0;

  changeBgButton.addEventListener("click", function () {
    document.body.style.backgroundColor = backgroundColors[colorIndex];
    colorIndex = (colorIndex + 1) % backgroundColors.length;
  });
}

// Task 2: toggle each answer independently; CSS handles the animation.
const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(function (question) {
  const faqItem = question.parentElement;
  faqItem.classList.remove("is-open");
  question.setAttribute("aria-expanded", "false");

  question.addEventListener("click", function () {
    const isOpen = faqItem.classList.toggle("is-open");
    question.setAttribute("aria-expanded", isOpen);
  });
});

// Task 5: show a fresh date in Astana's time zone every second.
const astanaTime = document.getElementById("astana-time");

if (astanaTime) {
  function updateAstanaTime() {
    const now = new Date();
    const formattedTime = now.toLocaleString("en-GB", {
      timeZone: "Asia/Almaty",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    astanaTime.textContent = "Astana time: " + formattedTime;
  }

  updateAstanaTime();
  setInterval(updateAstanaTime, 1000);
}
