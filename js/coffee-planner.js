const coffeeForm = document.getElementById("coffee-planner-form");

if (coffeeForm) {
  const step1 = document.getElementById("coffee-step-1");
  const step2 = document.getElementById("coffee-step-2");
  const step3 = document.getElementById("coffee-step-3");

  const temperatureInput = document.getElementById("coffee-temperature");
  const budgetInput = document.getElementById("coffee-budget");
  const budgetError = document.getElementById("coffee-budget-error");
  const progress = document.getElementById("coffee-progress");
  const results = document.getElementById("coffee-results");

  const nextButton = document.getElementById("coffee-next");
  const backButton = document.getElementById("coffee-back");
  const resultsBackButton = document.getElementById("coffee-results-back");
  const restartButton = document.getElementById("coffee-restart");

  // Selected menu drinks, not the full catalogue.
  const coffees = [
    {
      name: "Americano",
      place: "Sheker",
      size: "350 ml",
      price: 750,
      temperature: "hot",
      link: "#sheker"
    },
    {
      name: "Latte",
      place: "Sheker",
      size: "350 ml",
      price: 850,
      temperature: "hot",
      link: "#sheker"
    },
    {
      name: "Americano",
      place: "Mokko",
      size: "300 ml",
      price: 990,
      temperature: "hot",
      link: "#mokko"
    },
    {
      name: "Latte",
      place: "Mokko",
      size: "300 ml",
      price: 990,
      temperature: "hot",
      link: "#mokko"
    },
    {
      name: "Ice Americano",
      place: "Coffee Lake",
      size: "500 ml",
      price: 900,
      temperature: "iced",
      link: "#coffee-lake"
    },
    {
      name: "Ice Latte",
      place: "Coffee Lake",
      size: "500 ml",
      price: 1000,
      temperature: "iced",
      link: "#coffee-lake"
    }
  ];

  const preferences = {
    temperature: "any",
    budget: 0,

    moneyLeft: function (price) {
      return this.budget - price;
    }
  };

  function showCoffeeStep() {
    step1.hidden = false;
    step2.hidden = true;
    step3.hidden = true;

    progress.textContent = "Step 1 of 3: Your coffee";
    temperatureInput.focus();
  }

  function showBudgetStep() {
    preferences.temperature = temperatureInput.value;

    step1.hidden = true;
    step2.hidden = false;
    step3.hidden = true;

    progress.textContent = "Step 2 of 3: Your budget";
    budgetInput.focus();
  }

  function matchesPreferences(coffee) {
    if (coffee.price > preferences.budget) {
      return false;
    }

    switch (preferences.temperature) {
      case "hot":
        return coffee.temperature === "hot";

      case "iced":
        return coffee.temperature === "iced";

      case "any":
        return true;

      default:
        return false;
    }
  }

  function findCoffee(event) {
    event.preventDefault();

    const budget = Number(budgetInput.value);

    if (!Number.isFinite(budget) || budget <= 0) {
      budgetError.textContent = "Enter a budget greater than zero.";
      budgetInput.focus();
      return;
    }

    if (!Number.isInteger(budget)) {
      budgetError.textContent = "Enter a whole number, for example 1000.";
      budgetInput.focus();
      return;
    }

    budgetError.textContent = "";

    preferences.budget = budget;
    preferences.temperature = temperatureInput.value;

    const matchingCoffees = coffees.filter(matchesPreferences);

    results.innerHTML = "";

    if (matchingCoffees.length === 0) {
      results.textContent =
        "No matching drinks. Go back and try a larger budget or another coffee type.";
    } else {
      for (const coffee of matchingCoffees) {
        const card = document.createElement("div");
        card.className = "border rounded-3 p-3 mb-3";

        const title = document.createElement("h4");
        title.className = "h6";
        title.textContent = coffee.name + " — " + coffee.place;

        const details = document.createElement("p");
        details.textContent = coffee.size + " · " + coffee.price + " ₸";

        const moneyLeft = document.createElement("p");
        moneyLeft.textContent =
          "Money left: " + preferences.moneyLeft(coffee.price) + " ₸";

        const menuLink = document.createElement("a");
        menuLink.href = coffee.link;
        menuLink.textContent = "View menu";

        card.appendChild(title);
        card.appendChild(details);
        card.appendChild(moneyLeft);
        card.appendChild(menuLink);

        results.appendChild(card);
      }
    }

    step1.hidden = true;
    step2.hidden = true;
    step3.hidden = false;

    progress.textContent = "Step 3 of 3: Your options";
    resultsBackButton.focus();
  }

  function startAgain() {
    coffeeForm.reset();

    preferences.temperature = "any";
    preferences.budget = 0;

    budgetError.textContent = "";
    results.innerHTML = "";

    showCoffeeStep();
  }

  function clearBudgetError() {
    budgetError.textContent = "";
  }

  nextButton.addEventListener("click", showBudgetStep);
  backButton.addEventListener("click", showCoffeeStep);
  resultsBackButton.addEventListener("click", showBudgetStep);
  restartButton.addEventListener("click", startAgain);

  coffeeForm.addEventListener("submit", findCoffee);
  budgetInput.addEventListener("input", clearBudgetError);
}