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
