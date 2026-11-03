// Ramazan's Assignment 6 features; full jQuery 4.0.0.
$(document).ready(function () {
  console.log("jQuery is ready!");

  const $window = $(window);
  const $document = $(document);

  // For visible elements in normal page flow.
  function isInViewport($element) {
    if (!$element.is(":visible")) return false;

    const top = $element.offset().top;
    const viewportTop = $window.scrollTop();
    const viewportBottom = viewportTop + $window.height();

    return top < viewportBottom &&
      top + $element.outerHeight() > viewportTop;
  }

  function refreshLayout() {
    $document.trigger("layoutchange");
  }

  function initScrollProgress() {
    const $bar = $("#scroll-progress");
    if (!$bar.length) return;

    function updateProgress() {
      const distance = $document.height() - $window.height();
      const ratio = distance > 0 ? $window.scrollTop() / distance : 0;
      const progress = Math.max(0, Math.min(1, ratio));

      $bar.css("transform", `scaleX(${progress})`);
    }

    $window.on("scroll.progress resize.progress load.progress", updateProgress);
    $document.on("layoutchange.progress", updateProgress);

    // Measure after the planner's own handlers update the layout.
    $(".coffee-planner")
      .on("click.progress", "#coffee-next, #coffee-back, #coffee-results-back, #coffee-restart", refreshLayout)
      .on("submit.progress", "#coffee-planner-form", refreshLayout)
      .on("input.progress", "#coffee-budget", refreshLayout);

    updateProgress();
  }

  function initCounters() {
    const $stats = $("#site-stats");
    if (!$stats.length) return;

    // Reduced motion keeps the final HTML values.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function startCounters() {
      if (!isInViewport($stats)) return;

      // Run once; preserve other components' listeners.
      $window.off(".counters");
      $document.off(".counters");

      $stats.find("[data-count]").each(function () {
        const $number = $(this);
        const target = Number($number.attr("data-count"));
        if (!Number.isFinite(target) || target < 0) return;

        $number.text(0);
        $({ value: 0 }).animate({ value: target }, {
          duration: 900,
          step: function (value) {
            $number.text(Math.floor(value));
          },
          complete: function () {
            $number.text(target);
          }
        });
      });
    }

    $window.on("scroll.counters resize.counters load.counters", startCounters);
    $document.on("layoutchange.counters", startCounters);
    startCounters();
  }

  // FAQ content must remain plain text.
  function highlightText($element, query) {
    const original = $element.data("originalText");
    $element.empty();

    if (!query) {
      $element.text(original);
      return;
    }

    const lower = original.toLowerCase();
    let start = 0;
    let match = lower.indexOf(query);

    while (match !== -1) {
      $element.append(document.createTextNode(original.slice(start, match)));
      $element.append($("<mark>").text(original.slice(match, match + query.length)));
      start = match + query.length;
      match = lower.indexOf(query, start);
    }

    $element.append(document.createTextNode(original.slice(start)));
  }

  function initFaqSearch() {
    const $faq = $("#faq");
    const $input = $faq.find("#faq-search");
    if (!$input.length) return;

    const $items = $faq.find(".faq-item");
    const $status = $faq.find("#faq-search-status");

    $faq.find(".faq-text").each(function () {
      const $text = $(this);
      // Match rendered whitespace.
      $text.data("originalText", $text.text().replace(/\s+/g, " ").trim());
    });

    function filterFaq() {
      const query = $input.val().trim().toLowerCase();
      let count = 0;

      $items.each(function () {
        const $item = $(this);
        const $texts = $item.find(".faq-text");
        let matches = !query;

        $texts.each(function () {
          const $text = $(this);
          const original = $text.data("originalText");
          if (original.toLowerCase().includes(query)) matches = true;
          highlightText($text, query);
        });

        const isOpen = Boolean(query) && matches;
        $item.toggle(matches).toggleClass("is-open", isOpen);
        $item.find(".faq-question").attr("aria-expanded", String(isOpen));
        if (matches) count++;
      });

      $status.text(!query ? `${count} questions to explore` : count ?
        `Questions found: ${count}.` : "No matching questions.");
      refreshLayout();
    }

    $input.on("input.faqSearch", filterFaq);
    // site.js owns manual FAQ toggles.
    $faq.on("click.faqLayout", ".faq-question", refreshLayout);
    $faq.on("transitionend.faqLayout", ".faq-answer", refreshLayout);
    filterFaq();
  }

  function initLazyImages() {
    let $pending = $("#gallery .gallery-thumbnail img.lazy-image[data-src]");
    if (!$pending.length) return;

    function loadVisibleImages() {
      $pending.each(function () {
        const $image = $(this);
        if (!isInViewport($image)) return;

        const source = $image.attr("data-src");
        const placeholder = $image.attr("src");

        $image.one("load.lazyImages error.lazyImages", function (event) {
          $image.off(".lazyImages");
          if (event.type === "load") {
            $image.addClass("is-loaded");
          } else {
            $image.addClass("is-error")
              .attr("src", placeholder)
              .attr("title", "Image unavailable");
            $image.closest(".gallery-thumbnail").addClass("has-image-error");
          }
        });

        $image.removeAttr("data-src").attr("src", source);
      });

      $pending = $pending.filter("[data-src]");
      if (!$pending.length) {
        $window.off(".lazyImages");
        $document.off(".lazyImages");
      }
    }

    $window.on("scroll.lazyImages resize.lazyImages load.lazyImages", loadVisibleImages);
    $document.on("layoutchange.lazyImages", loadVisibleImages);
    loadVisibleImages();
  }

  initScrollProgress();
  initCounters();
  initFaqSearch();
  initLazyImages();
});



//Amirs

// Task 1: real-time menu search.
$(document).ready(function () {
  const searchInput = $("#menu-search");

  if (!searchInput.length) return;

  // Save the dish name for every row, including portion variants.
  $("#menus tbody").each(function () {
    let dishName = "";

    $(this).children("tr").not(".group-row").each(function () {
      const nameCell = $(this).find('th[scope="row"]');

      if (nameCell.length) {
        dishName = nameCell.text().replace(/\s+/g, " ").trim().toLowerCase();
      }

      $(this).data("dishName", dishName);
    });
  });

  searchInput.on("input", function () {
    const query = $(this).val().trim().toLowerCase();
    let found = false;

    $("#menus tbody").each(function () {
      let groupHasMatches = false;

      $(this).children("tr").not(".group-row").each(function () {
        const matches = $(this).data("dishName").includes(query);

        $(this).toggle(matches);

        if (matches) {
          groupHasMatches = true;
          found = true;
        }
      });

      // Hide categories that have no matching dishes.
      $(this).toggle(groupHasMatches);
    });

    $("#menu-search-status").text(
      found ? "" : "No matching dishes found."
    );

    // Recalculate Ramazan's scroll progress bar.
    $(document).trigger("layoutchange");
  });
});


// Task 2:autocomplete search suggestions.
$(document).ready(function () {
  const searchInput = $("#menu-search");
  const suggestions = $("#menu-suggestions");

  if (!searchInput.length) return;

  const dishNames = [];

  // Collect unique dish names from the tables.
  $('#menus th[scope="row"]').each(function () {
    const name = $(this).text().replace(/\s+/g, " ").trim();

    if (!dishNames.includes(name)) {
      dishNames.push(name);
    }
  });

  // Show matching suggestions while typing.
  searchInput.on("input", function () {
    const query = $(this).val().trim().toLowerCase();

    suggestions.empty().hide();

    if (query === "") return;

    const matches = dishNames.filter(function (name) {
      return name.toLowerCase().includes(query);
    });

    matches.slice(0, 6).forEach(function (name) {
      const button = $("<button>")
        .attr("type", "button")
        .addClass("list-group-item list-group-item-action")
        .text(name);

      button.on("click", function () {
        searchInput.val(name);

        // Run Task 1's filter, including if you changed it to keyup.
        searchInput.trigger("input").trigger("keyup");

        suggestions.empty().hide();
        searchInput.focus();
      });

      suggestions.append(button);
    });

    suggestions.toggle(matches.length > 0);
  });

  // Close suggestions when clicking outside the search.
  $(document).on("click", function (event) {
    if (!$(event.target).closest("#menu-search, #menu-suggestions").length) {
      suggestions.hide();
    }
  });

  searchInput.on("keydown", function (event) {
    if (event.key === "Escape") {
      suggestions.hide();
    }
  });
});

// Task 8: copy contact text to clipboard.
$(document).ready(function () {
  $(".copy-button").on("click", async function () {
    const button = $(this);
    const icon = button.find(".copy-icon");
    const tooltip = button.siblings(".copy-tooltip");
    const text = button.attr("data-copy");

    button.prop("disabled", true);

    try {
      await navigator.clipboard.writeText(text);

      icon.text("✓");
      tooltip.text("Copied to clipboard!").fadeIn(150);
    } catch (error) {
      tooltip.text("Could not copy. Please copy manually.").fadeIn(150);
    }

    setTimeout(function () {
      tooltip.fadeOut(200, function () {
        icon.text("📋");
        button.prop("disabled", false);
      });
    }, 2000);
  });
});