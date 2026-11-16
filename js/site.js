(function () {
  "use strict";

  // Apply the color mode before styles load; no page elements are read here.
  const themeKey = "aitu.theme";
  let savedTheme = null;
  try {
    const value = localStorage.getItem(themeKey);
    if (value === "light" || value === "dark") savedTheme = value;
  } catch (error) {
    // Private browsing or storage restrictions must not prevent switching themes.
  }
  const systemTheme = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  document.documentElement.dataset.bsTheme = savedTheme ||
    (systemTheme && systemTheme.matches ? "dark" : "light");

  function refreshLayout() {
    document.dispatchEvent(new Event("layoutchange"));
  }

  // Theme and disclosure navigation.
  function initThemeToggle() {
    const button = document.getElementById("theme-toggle");
    if (!button) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let transitionTimer;

    function updateButton() {
      const dark = document.documentElement.dataset.bsTheme === "dark";
      button.setAttribute("aria-pressed", String(dark));
      button.title = dark ? "Switch to light theme" : "Switch to dark theme";
    }
    function applyTheme(theme) {
      const root = document.documentElement;
      clearTimeout(transitionTimer);
      root.classList.toggle("theme-switching", !reducedMotion.matches);
      root.dataset.bsTheme = theme;
      updateButton();
      transitionTimer = setTimeout(function () { root.classList.remove("theme-switching"); }, 460);
    }
    button.addEventListener("click", function () {
      savedTheme = document.documentElement.dataset.bsTheme === "dark" ? "light" : "dark";
      applyTheme(savedTheme);
      try {
        localStorage.setItem(themeKey, savedTheme);
      } catch (error) {
        // The selected mode still works for this page when storage is unavailable.
      }
    });
    if (systemTheme) {
      systemTheme.addEventListener("change", function (event) {
        if (savedTheme) return;
        applyTheme(event.matches ? "dark" : "light");
      });
    }
    updateButton();
    button.hidden = false;
  }

  function initNavigation() {
    const navigation = document.getElementById("main-nav");
    const toggle = document.getElementById("nav-toggle");
    if (!navigation || !toggle) return;

    // Keep this breakpoint identical to the navigation media query in style.css.
    const mobile = window.matchMedia("(max-width: 767.98px)");
    function setExpanded(expanded) {
      if (!expanded && navigation.contains(document.activeElement)) {
        toggle.focus({ preventScroll: true });
      }
      navigation.hidden = !expanded;
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.setAttribute("aria-label", expanded ? "Close navigation" : "Open navigation");
      refreshLayout();
    }
    function updateMode() {
      if (mobile.matches) {
        toggle.hidden = false;
        setExpanded(false);
      } else {
        setExpanded(true);
        if (document.activeElement === toggle) {
          const currentLink = navigation.querySelector('[aria-current="page"]') || navigation.querySelector("a");
          if (currentLink) currentLink.focus({ preventScroll: true });
        }
        toggle.hidden = true;
      }
    }
    toggle.addEventListener("click", function () {
      setExpanded(navigation.hidden);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mobile.matches && !navigation.hidden) {
        setExpanded(false);
        toggle.focus({ preventScroll: true });
      }
    });
    navigation.addEventListener("keydown", function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const links = Array.from(navigation.querySelectorAll("a.nav-link"))
        .filter(link => link.getClientRects().length > 0);
      const currentIndex = links.indexOf(event.target);
      if (currentIndex === -1) return;
      const offset = event.key === "ArrowRight" ? 1 : -1;
      event.preventDefault();
      links[(currentIndex + offset + links.length) % links.length].focus();
    });
    mobile.addEventListener("change", updateMode);
    updateMode();
  }

  function initHeaderHeight() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const menuNavigation = document.querySelector(".menu-nav");
    let previousHeight = -1;
    let previousMenuHeight = -1;
    function updateHeight() {
      const height = Math.ceil(header.getBoundingClientRect().height);
      const menuHeight = menuNavigation ? Math.ceil(menuNavigation.getBoundingClientRect().height) : 0;
      let changed = false;
      if (height !== previousHeight) {
        previousHeight = height;
        document.documentElement.style.setProperty("--site-header-height", height + "px");
        changed = true;
      }
      if (menuHeight !== previousMenuHeight) {
        previousMenuHeight = menuHeight;
        document.documentElement.style.setProperty("--menu-nav-height", menuHeight + "px");
        changed = true;
      }
      if (changed) refreshLayout();
    }
    updateHeight();
    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(updateHeight);
      observer.observe(header);
      if (menuNavigation) observer.observe(menuNavigation);
    } else {
      window.addEventListener("resize", updateHeight);
    }
  }

  function initFaqToggles() {
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
  }

  function initAstanaClock() {
    const astanaTime = document.getElementById("astana-time");
    if (!astanaTime) return;

    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Almaty",
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const weekdays = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
    function minutes(time) {
      const parts = time.split(":").map(Number);
      return parts[0] * 60 + parts[1];
    }
    // Read the same times that the table displays; do not maintain a second schedule.
    const schedules = Array.from(document.querySelectorAll(".hours-table tr[data-open-days]"), function (row) {
      const times = row.querySelectorAll("time[datetime]");
      return {
        days: row.dataset.openDays.split(",").map(Number),
        opens: minutes(times[0].getAttribute("datetime")),
        closes: minutes(times[1].getAttribute("datetime")),
        status: row.querySelector(".hours-status")
      };
    });
    let timer;
    function updateAstanaTime() {
      clearTimeout(timer);
      if (document.hidden) return;
      const now = new Date();
      const parts = Object.fromEntries(formatter.formatToParts(now).map(function (part) {
        return [part.type, part.value];
      }));
      const day = weekdays[parts.weekday];
      const currentMinutes = Number(parts.hour) * 60 + Number(parts.minute);
      astanaTime.textContent = "Astana time · " + formatter.format(now);
      schedules.forEach(function (schedule) {
        const open = schedule.days.includes(day) &&
          schedule.opens <= currentMinutes && currentMinutes < schedule.closes;
        const state = open ? "open" : "closed";
        if (schedule.status.dataset.state !== state) {
          schedule.status.dataset.state = state;
          schedule.status.textContent = open ? "Open" : "Closed";
        }
      });
      // Align with the next minute so opening and closing boundaries update on time.
      timer = setTimeout(updateAstanaTime, 60000 - (Date.now() % 60000));
    }
    document.addEventListener("visibilitychange", updateAstanaTime);
    window.addEventListener("pageshow", updateAstanaTime);
    window.addEventListener("pagehide", function () { clearTimeout(timer); });
    updateAstanaTime();
  }

  function initializePhotoGuide() {
    const gallery = document.querySelector("#gallery");

    if (!gallery) {
      return;
    }

    const thumbnailButtons = gallery.querySelectorAll(".gallery-thumbnail");
    const thumbnailStrip = gallery.querySelector(".gallery-thumbnails");
    const galleryPhotos = [];

    // Cache real photo URLs before lazy loading removes data-src.
    for (const button of thumbnailButtons) {
      const image = button.querySelector("img");
      const photo = {
        src: image.getAttribute("data-src") || image.getAttribute("src"),
        alt: image.alt,
        caption: button.dataset.caption,
        menu: button.dataset.menu,
        spot: button.dataset.spot,
        button: button
      };
      galleryPhotos.push(photo);
    }

    if (galleryPhotos.length === 0) {
      return;
    }

    const mainImage = gallery.querySelector("#gallery-image");
    const caption = gallery.querySelector("#gallery-caption");
    const counter = gallery.querySelector("#gallery-counter");
    const menuLink = gallery.querySelector("#gallery-menu");
    const previousButton = gallery.querySelector("#gallery-previous");
    const nextButton = gallery.querySelector("#gallery-next");
    const soundMessage = gallery.querySelector("#gallery-sound-message");
    const imagePanel = gallery.querySelector(".gallery-image-panel");
    const mediaFeedback = gallery.querySelector(".gallery-media-feedback");
    const mediaStatus = gallery.querySelector("#gallery-media-status");
    const imageRetry = gallery.querySelector("#gallery-image-retry");
    let currentPhotoIndex = 0;
    let photoRequest = 0;

    // Play sound only after a user changes the photo.
    const gallerySound = {
      audio: gallery.querySelector("#gallery-audio"),
      play() {
        try {
          this.stop();
          this.audio.play().then(clearGallerySoundError).catch(handleGallerySoundError);
        } catch (error) {
          handleGallerySoundError(error);
        }
      },
      stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
    };
    gallerySound.audio.volume = 0.25;

    function clearGallerySoundError() {
      soundMessage.textContent = "";
    }

    function handleGallerySoundError(error) {
      // Rapid clicks can interrupt playback.
      if (error.name === "AbortError") {
        return;
      }

      gallerySound.stop();
      soundMessage.textContent = "Sound is unavailable. You can still explore the photos.";
    }

    function loadPhoto(photo, retrying = false) {
      const request = ++photoRequest;
      const pendingImage = new Image();
      imagePanel.classList.remove("is-error");
      imagePanel.classList.add("is-loading");
      mediaFeedback.hidden = false;
      mediaStatus.textContent = "Loading photo " + (currentPhotoIndex + 1) + " of " + galleryPhotos.length + "…";
      imageRetry.hidden = !retrying;
      imageRetry.disabled = true;
      mainImage.alt = photo.alt;

      function showLoadedPhoto() {
        if (request !== photoRequest) return;
        // A completed retry should leave keyboard users on a visible gallery control.
        if (document.activeElement === imageRetry) nextButton.focus({ preventScroll: true });
        imagePanel.classList.remove("is-loading", "is-error");
        mediaFeedback.hidden = true;
        mediaStatus.textContent = "";
        imageRetry.hidden = true;
        imageRetry.disabled = false;
      }

      function showPhotoError() {
        if (request !== photoRequest) return;
        imagePanel.classList.remove("is-loading");
        imagePanel.classList.add("is-error");
        mediaStatus.textContent = "This photo could not load. Retry or choose another photo.";
        imageRetry.hidden = false;
        imageRetry.disabled = false;
      }

      pendingImage.onload = function () {
        if (request !== photoRequest) return;
        mainImage.src = photo.src;
        // Keep the reserved image area hidden until the selected photo can be painted.
        if (typeof mainImage.decode === "function") {
          mainImage.decode().then(showLoadedPhoto).catch(showPhotoError);
        } else {
          showLoadedPhoto();
        }
      };
      pendingImage.onerror = showPhotoError;
      pendingImage.src = photo.src;
    }

    function revealThumbnail(button) {
      const stripBounds = thumbnailStrip.getBoundingClientRect();
      const buttonBounds = button.getBoundingClientRect();
      const inset = 6; // Match the strip's room for focus outlines.
      if (buttonBounds.left < stripBounds.left + inset) {
        thumbnailStrip.scrollLeft -= stripBounds.left + inset - buttonBounds.left;
      } else if (buttonBounds.right > stripBounds.right - inset) {
        thumbnailStrip.scrollLeft += buttonBounds.right - stripBounds.right + inset;
      }
    }

    function showPhoto(index) {
      if (index < 0) {
        index = galleryPhotos.length - 1;
      } else if (index >= galleryPhotos.length) {
        index = 0;
      }

      currentPhotoIndex = index;
      const photo = galleryPhotos[currentPhotoIndex];
      caption.textContent = photo.caption;
      counter.textContent = "Photo " + (currentPhotoIndex + 1) + " of " + galleryPhotos.length;
      menuLink.href = photo.menu;
      menuLink.textContent = "View " + photo.spot + " menu";

      galleryPhotos.forEach(function updateThumbnailState(item, photoIndex) {
        if (photoIndex === currentPhotoIndex) {
          item.button.setAttribute("aria-current", "true");
        } else {
          item.button.removeAttribute("aria-current");
        }
      });
      // Scroll the strip only; choosing a photo must not move the page vertically.
      revealThumbnail(photo.button);
      loadPhoto(photo);
    }

    galleryPhotos.forEach(function connectThumbnail(photo, index) {
      photo.button.disabled = false;
      photo.button.addEventListener("click", function selectThumbnail() {
        if (index === currentPhotoIndex) {
          return;
        }

        showPhoto(index);
        gallerySound.play();
      });
    });

    function showPreviousPhoto() {
      showPhoto(currentPhotoIndex - 1);
      gallerySound.play();
    }

    function showNextPhoto() {
      showPhoto(currentPhotoIndex + 1);
      gallerySound.play();
    }

    function focusGalleryControl(event) {
      if (event.target.closest(".gallery-media-feedback")) return;
      let button = event.target.closest(".gallery-thumbnail, .gallery-arrow");

      if (!button && event.target.closest(".gallery-image-panel")) {
        button = nextButton;
      }

      // Some browsers do not focus buttons on click.
      if (button && gallery.contains(button)) {
        button.focus({ preventScroll: true });
      }
    }

    function handleGalleryArrowKeys(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      // Arrow keys affect photo controls only.
      if (!event.target.matches(".gallery-thumbnail, .gallery-arrow")) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPreviousPhoto();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showNextPhoto();
      } else {
        return;
      }
      if (event.target.matches(".gallery-thumbnail")) {
        galleryPhotos[currentPhotoIndex].button.focus({ preventScroll: true });
      }
    }

    previousButton.addEventListener("click", showPreviousPhoto);
    nextButton.addEventListener("click", showNextPhoto);
    imageRetry.addEventListener("click", function () {
      loadPhoto(galleryPhotos[currentPhotoIndex], true);
    });
    gallery.addEventListener("click", focusGalleryControl);
    gallery.addEventListener("keydown", handleGalleryArrowKeys);
    previousButton.disabled = false;
    nextButton.disabled = false;

    // Initial render stays silent and preserves focus.
    showPhoto(0);
  }

  function initPageEffects($) {
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
          `Questions found: ${count}.` : "No matching questions. Clear the search or try another word.");
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
      let activeLoads = 0;

      function loadVisibleImages() {
        $pending.each(function () {
          // A horizontal strip can reveal twelve images at once; load in small batches.
          if (activeLoads >= 3) return false;
          const $image = $(this);
          if (!isInViewport($image)) return;

          const source = $image.attr("data-src");
          const placeholder = $image.attr("src");

          $image.one("load.lazyImages error.lazyImages", function (event) {
            $image.off(".lazyImages");
            activeLoads--;
            if (event.type === "load") {
              $image.addClass("is-loaded");
            } else {
              $image.addClass("is-error")
                .attr("src", placeholder)
                .attr("title", "Image unavailable");
              $image.closest(".gallery-thumbnail").addClass("has-image-error");
            }
            loadVisibleImages();
          });

          activeLoads++;
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
  }

  function initMenuSearch($) {
    const searchInput = $("#menu-search");
    const sections = $(".menu-section");

    if (!searchInput.length) return;

    sections.each(function () {
      const section = $(this);

      // Add a separate message for each dining spot.
      $("<p>")
        .addClass("menu-empty-message text-muted mt-3")
        .hide()
        .insertAfter(section.find("h2").first());

      // Save dish names, including rows with different portions.
      section.find("tbody").each(function () {
        let dishName = "";

        $(this).children("tr").not(".group-row").each(function () {
          const nameCell = $(this).find('th[scope="row"]');

          if (nameCell.length) {
            dishName = nameCell.text()
              .replace(/\s+/g, " ")
              .trim()
              .toLowerCase();
          }

          $(this).data("dishName", dishName);
        });
      });
    });

    searchInput.on("input", function () {
      const query = $(this).val().trim().toLowerCase();
      let matchingOptions = 0;
      let matchingSpots = 0;

      sections.each(function () {
        const section = $(this);
        let sectionHasMatches = false;

        section.find("tbody").each(function () {
          let groupHasMatches = false;

          $(this).children("tr").not(".group-row").each(function () {
            const matches = $(this).data("dishName").includes(query);

            $(this).toggle(matches);

            if (matches) {
              groupHasMatches = true;
              sectionHasMatches = true;
              matchingOptions += 1;
            }
          });

          $(this).toggle(groupHasMatches);
        });

        // Hide the empty table, but keep the dining spot heading.
        section.find(".table-responsive").toggle(sectionHasMatches);
        section.children("p").not(".menu-empty-message")
          .toggle(sectionHasMatches);

        const spotName = section.find("h2").text().trim();

        section.find(".menu-empty-message")
          .text(
            sectionHasMatches
              ? ""
              : "No matching dishes found in " + spotName + "."
          )
          .toggle(!sectionHasMatches);
        if (sectionHasMatches) matchingSpots += 1;
      });

      // One live summary avoids four competing announcements while typing.
      $("#menu-search-status").text(matchingOptions
        ? (query ? "Found " : "Showing all ") + matchingOptions +
          (matchingOptions === 1 ? " menu option across " : " menu options across ") +
          matchingSpots + (matchingSpots === 1 ? " dining spot." : " dining spots.")
        : "No matching menu options. Try another name or clear the search.");

      $(document).trigger("layoutchange");
    });

    searchInput.trigger("input");
  }

  function initMenuAutocomplete($) {
    const searchInput = $("#menu-search");
    const suggestions = $("#menu-suggestions");

    if (!searchInput.length) return;

    const dishNames = [];
    function closeSuggestions() { suggestions.hide(); }

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

          // Apply the selected suggestion to the existing menu filter.
          searchInput.trigger("input").trigger("keyup");

          suggestions.empty().hide();
          searchInput.focus();
        });

        suggestions.append(button);
      });

      suggestions.toggle(matches.length > 0);
    });

    // Tab out and pointer clicks dismiss the same suggestion group.
    $(document).on("click focusin", function (event) {
      if (!$(event.target).closest("#menu-search, #menu-suggestions").length) {
        closeSuggestions();
      }
    });

    searchInput.on("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSuggestions();
      } else if ((event.key === "ArrowDown" || event.key === "ArrowUp") && suggestions.is(":visible")) {
        event.preventDefault();
        const choices = suggestions.find("button");
        (event.key === "ArrowDown" ? choices.first() : choices.last()).trigger("focus");
      }
    });
    suggestions.on("keydown", "button", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSuggestions();
        searchInput.trigger("focus");
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const choices = suggestions.find("button");
        const index = choices.index(this) + (event.key === "ArrowDown" ? 1 : -1);
        if (index < 0 || index >= choices.length) searchInput.trigger("focus");
        else choices.eq(index).trigger("focus");
      }
    });
  }

  function initClipboard($) {
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
  }

  function initRegistrationForm() {
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
        } else if (passwordInput.value.length < 8) {
          passwordError.textContent = "Use at least 8 characters.";
          passwordInput.classList.add("is-invalid");
          passwordInput.setAttribute("aria-invalid", "true");
        }

        if (confirmInput.value.trim() === "") {
          confirmError.textContent = "This field is required.";
          confirmInput.classList.add("is-invalid");
          confirmInput.setAttribute("aria-invalid", "true");
        } else if (confirmInput.value !== passwordInput.value) {
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
          "The fields passed validation. This demo has not created an account.";

        registrationForm.reset();
      });

      registrationForm.addEventListener("input", function (event) {
        statusMessage.textContent = "";
        const fields = [nameInput, emailInput, passwordInput, confirmInput];
        const errors = [nameError, emailError, passwordError, confirmError];
        const index = fields.indexOf(event.target);
        if (index !== -1) {
          fields[index].classList.remove("is-invalid");
          fields[index].setAttribute("aria-invalid", "false");
          errors[index].textContent = "";
        }
        // A changed password also invalidates a previous comparison message.
        if (event.target === passwordInput) {
          confirmInput.classList.remove("is-invalid");
          confirmInput.setAttribute("aria-invalid", "false");
          confirmError.textContent = "";
        }
      });
    }
  }

  function initSubscriptionDialog() {
    // Subscription dialog.
    const subscriptionPopup = document.getElementById("subscription-popup");

    if (subscriptionPopup) {
      const openButton = document.getElementById("open-subscription");
      const closeButton = document.getElementById("close-subscription");
      const subscriptionForm = document.getElementById("subscription-form");
      const subscriptionStatus = document.getElementById("subscription-status");

      openButton.addEventListener("click", function () {
        subscriptionPopup.showModal();
        document.getElementById("subscription-email").focus();
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
          "The email format passed validation. This demo has not created a subscription.";

        subscriptionForm.reset();
      });

      subscriptionForm.addEventListener("input", function () {
        subscriptionStatus.textContent = "";
      });
    }
  }

  function initContactForm() {
    const contactForm = document.getElementById("contact-form");

    if (contactForm) {
      const contactEmail = document.getElementById("cf-email");
      const contactEmailError = document.getElementById("cf-email-error");
      const contactStatus = document.getElementById("form-status");

      const contactName = document.getElementById("cf-name");
      const contactNameError = document.getElementById("cf-name-error");

      const submitButton = contactForm.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      contactStatus.textContent = "";

      function handleContactSubmit(event) {
        event.preventDefault();

        const name = contactName.value.trim();

        contactNameError.textContent = "";
        contactName.classList.remove("is-invalid");
        contactName.setAttribute("aria-invalid", "false");

        if (name === "") {
          contactNameError.textContent = "Enter your name.";
        } else if (name.length < 2) {
          contactNameError.textContent = "Use at least 2 characters.";
        }

        if (contactNameError.textContent !== "") {
          contactName.classList.add("is-invalid");
          contactName.setAttribute("aria-invalid", "true");
          contactStatus.textContent = "";
          contactName.focus();
          return;
        }

        const email = contactEmail.value.trim();
        contactEmail.value = email;

        const hasValidDomain = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[a-z]{2,}$/i.test(email);

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
        contactEmailError.textContent = "";

        if (!contactForm.reportValidity()) {
          contactStatus.textContent = "";
          return;
        }

        // Validation is local and immediate. Keep both the result and the draft visible.
        contactStatus.textContent =
          "Your entries passed validation. This demo has not sent a message; use the team email links above to contact us.";
      }

      function clearContactError(event) {
        if (event.target === contactName || event.target === contactEmail) {
          event.target.classList.remove("is-invalid");
          event.target.setAttribute("aria-invalid", "false");
          (event.target === contactName ? contactNameError : contactEmailError).textContent = "";
        }
        contactStatus.textContent = "";
      }

      contactForm.addEventListener("submit", handleContactSubmit);
      contactForm.addEventListener("input", clearContactError);
      contactForm.addEventListener("change", clearContactError);
    }
  }

  function initLoginDialog() {
    const loginDialog = document.getElementById("login-dialog");

    if (loginDialog) {
      document.getElementById("open-login").addEventListener("click", function () {
        loginDialog.showModal();
        document.getElementById("reg-name").focus();
      });

      document.getElementById("close-login").addEventListener("click", function () {
        loginDialog.close();
      });
    }
  }

  function initCoffeePlanner() {
    const coffeeForm = document.getElementById("coffee-planner-form");

    if (coffeeForm) {
      const planner = coffeeForm.closest("details");
      if (planner) planner.addEventListener("toggle", refreshLayout);
      const step1 = document.getElementById("coffee-step-1");
      const step2 = document.getElementById("coffee-step-2");
      const step3 = document.getElementById("coffee-step-3");

      const temperatureInput = document.getElementById("coffee-temperature");
      const budgetInput = document.getElementById("coffee-budget");
      const budgetError = document.getElementById("coffee-budget-error");
      const progress = document.getElementById("coffee-progress");
      const results = document.getElementById("coffee-results");
      const resultsHeading = document.getElementById("coffee-results-title");
      const resultsSummary = document.getElementById("coffee-results-summary");

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
        updateBudgetEquivalent(null);
        step1.hidden = false;
        step2.hidden = true;
        step3.hidden = true;

        progress.textContent = "Step 1 of 3: Your coffee";
        temperatureInput.focus();
      }

      function showBudgetStep() {
        updateBudgetEquivalent(null);
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
        updateBudgetEquivalent(null);

        const budget = Number(budgetInput.value);

        if (!Number.isFinite(budget) || budget <= 0) {
          budgetError.textContent = "Enter a budget greater than zero.";
          budgetInput.setAttribute("aria-invalid", "true");
          budgetInput.focus();
          return;
        }

        if (!Number.isInteger(budget)) {
          budgetError.textContent = "Enter a whole number, for example 1000.";
          budgetInput.setAttribute("aria-invalid", "true");
          budgetInput.focus();
          return;
        }

        budgetError.textContent = "";
        budgetInput.setAttribute("aria-invalid", "false");

        preferences.budget = budget;
        preferences.temperature = temperatureInput.value;

        const matchingCoffees = coffees.filter(matchesPreferences);

        results.innerHTML = "";
        resultsSummary.textContent = matchingCoffees.length +
          (matchingCoffees.length === 1 ? " option fits " : " options fit ") +
          "your " + budget + " ₸ budget and coffee preference.";

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
            menuLink.setAttribute("aria-label", "View " + coffee.place + " menu for " + coffee.name);
            menuLink.addEventListener("click", function () {
              // A planner result must remain visible even after an unrelated menu search.
              const search = document.getElementById("menu-search");
              if (search) {
                search.value = "";
                search.dispatchEvent(new Event("input", { bubbles: true }));
              }
            });

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
        updateBudgetEquivalent(budget);
        resultsHeading.focus();
      }

      function startAgain() {
        coffeeForm.reset();

        preferences.temperature = "any";
        preferences.budget = 0;

        budgetError.textContent = "";
        budgetInput.setAttribute("aria-invalid", "false");
        results.innerHTML = "";
        resultsSummary.textContent = "";

        showCoffeeStep();
      }

      function clearBudgetError() {
        updateBudgetEquivalent(null);
        budgetError.textContent = "";
        budgetInput.setAttribute("aria-invalid", "false");
      }

      nextButton.addEventListener("click", showBudgetStep);
      backButton.addEventListener("click", showCoffeeStep);
      resultsBackButton.addEventListener("click", showBudgetStep);
      restartButton.addEventListener("click", startAgain);

      coffeeForm.addEventListener("reset", function () { updateBudgetEquivalent(null); });
      temperatureInput.addEventListener("change", function () { updateBudgetEquivalent(null); });
      coffeeForm.addEventListener("submit", findCoffee);
      budgetInput.addEventListener("input", clearBudgetError);
    }
  }

  // Budget equivalents are display-only; the planner keeps all calculations in KZT.
  const exchangeCacheKey = "aitu.exchangeRates.v1";
  const exchangeEndpoint = "https://open.er-api.com/v6/latest/KZT";
  let exchangeRates = null;
  let exchangeRequest = null;
  let exchangeError = "";
  let exchangeRetryAt = 0;
  let confirmedBudgetKzt = null;
  let budgetEquivalent = null;
  let exchangeRefreshTimer = null;

  function isValidExchangeRates(data) {
    if (!data || data.base !== "KZT" || !data.rates) return false;

    const ratesAreValid = [data.rates.USD, data.rates.EUR].every(function (rate) {
      return typeof rate === "number" && Number.isFinite(rate) && rate > 0;
    });
    // Milliseconds, a plausible date, and a short update interval reject corrupt caches.
    const timesAreValid = Number.isSafeInteger(data.updatedAt) &&
      Number.isSafeInteger(data.nextUpdateAt) &&
      data.updatedAt >= Date.UTC(2000, 0, 1) &&
      data.updatedAt <= Date.now() + 5 * 60 * 1000 &&
      data.nextUpdateAt > data.updatedAt &&
      data.nextUpdateAt - data.updatedAt <= 7 * 24 * 60 * 60 * 1000;

    return ratesAreValid && timesAreValid;
  }

  function readExchangeCache() {
    try {
      const data = JSON.parse(localStorage.getItem(exchangeCacheKey));
      return isValidExchangeRates(data) ? data : null;
    } catch {
      return null;
    }
  }

  function parseExchangeResponse(data) {
    if (!data || data.result !== "success" || data.base_code !== "KZT" ||
        !Number.isFinite(data.time_last_update_unix) ||
        !Number.isFinite(data.time_next_update_unix)) {
      throw new Error("invalid-rates");
    }

    const rates = {
      base: "KZT",
      rates: { USD: data.rates?.USD, EUR: data.rates?.EUR },
      updatedAt: data.time_last_update_unix * 1000,
      nextUpdateAt: data.time_next_update_unix * 1000
    };
    if (!isValidExchangeRates(rates) || Date.now() >= rates.nextUpdateAt) {
      throw new Error("invalid-rates");
    }
    return rates;
  }

  function getExchangeRetryTime(header) {
    const now = Date.now();
    if (header !== null && header.trim() !== "") {
      const seconds = Number(header);
      const time = Number.isFinite(seconds) && seconds >= 0 ?
        now + seconds * 1000 : Date.parse(header);
      if (Number.isFinite(time) && time >= now && time <= 8640000000000000) {
        return time;
      }
    }
    // The provider documents a 20-minute cooldown for rate-limited IP addresses.
    return now + 20 * 60 * 1000;
  }

  function formatBudgetCurrency(amount, currency) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency,
      currencyDisplay: "code",
      maximumFractionDigits: 2
    }).format(amount);
  }

  function scheduleExchangeRefresh() {
    clearTimeout(exchangeRefreshTimer);
    exchangeRefreshTimer = null;
    if (!budgetEquivalent || confirmedBudgetKzt === null || document.hidden ||
        exchangeRequest || exchangeError || !exchangeRates ||
        Date.now() >= exchangeRates.nextUpdateAt) return;

    // Refresh only a currently displayed result, once its cached rates expire.
    exchangeRefreshTimer = setTimeout(refreshExpiredExchangeRates,
      Math.min(exchangeRates.nextUpdateAt - Date.now() + 50, 2147483647));
  }

  function refreshExpiredExchangeRates() {
    clearTimeout(exchangeRefreshTimer);
    exchangeRefreshTimer = null;
    if (!budgetEquivalent || confirmedBudgetKzt === null || document.hidden) return;

    if (!exchangeRequest && !exchangeError && Date.now() >= exchangeRetryAt &&
        (!exchangeRates || Date.now() >= exchangeRates.nextUpdateAt)) {
      requestExchangeRates();
    } else {
      // A failed request or a 429 still needs the existing explicit Retry action.
      renderBudgetEquivalent();
    }
  }

  function renderBudgetEquivalent() {
    if (!budgetEquivalent) return;
    const ui = budgetEquivalent;
    ui.block.hidden = confirmedBudgetKzt === null;
    ui.values.hidden = true;
    ui.updated.textContent = "";
    ui.usd.textContent = "";
    ui.eur.textContent = "";
    ui.retry.hidden = false;
    ui.retry.disabled = Boolean(exchangeRequest);

    if (confirmedBudgetKzt === null) {
      ui.budget.textContent = "";
      ui.status.textContent = "";
    } else {
      ui.budget.textContent = formatBudgetCurrency(confirmedBudgetKzt, "KZT");
      if (exchangeRates && Date.now() < exchangeRates.nextUpdateAt) {
        const usd = confirmedBudgetKzt * exchangeRates.rates.USD;
        const eur = confirmedBudgetKzt * exchangeRates.rates.EUR;
        if (Number.isFinite(usd) && Number.isFinite(eur)) {
          ui.usd.textContent = formatBudgetCurrency(usd, "USD");
          ui.eur.textContent = formatBudgetCurrency(eur, "EUR");
          ui.values.hidden = false;
          ui.updated.textContent = "Rates updated: " + new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Almaty"
          }).format(exchangeRates.updatedAt) + " (Astana time).";
          ui.status.textContent = "Approximate equivalents. Prices and money left stay in KZT.";
        } else {
          ui.status.textContent = "This budget is too large to display its equivalents. Prices stay in KZT.";
        }
        ui.retry.hidden = true;
      } else if (exchangeRequest) {
        ui.status.textContent = "Loading exchange rates… Your coffee options are ready in KZT.";
      } else if (exchangeRetryAt > Date.now()) {
        const minutes = Math.ceil((exchangeRetryAt - Date.now()) / 60000);
        ui.status.textContent = "The rate service is busy. Try again in " + minutes +
          (minutes === 1 ? " minute." : " minutes.") + " Your coffee options stay in KZT.";
      } else {
        ui.status.textContent = exchangeError;
      }
    }
    scheduleExchangeRefresh();
    document.dispatchEvent(new Event("layoutchange"));
  }

  async function fetchExchangeRates() {
    const controller = new AbortController();
    const timeout = setTimeout(function () { controller.abort(); }, 8000);
    try {
      const response = await fetch(exchangeEndpoint, { signal: controller.signal });
      if (response.status === 429) {
        exchangeRetryAt = getExchangeRetryTime(response.headers.get("Retry-After"));
        throw new Error("rate-limit");
      }
      if (!response.ok) throw new Error("http-error");
      return parseExchangeResponse(await response.json());
    } catch (error) {
      if (controller.signal.aborted) throw new Error("timeout");
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  function requestExchangeRates() {
    if (exchangeRequest) return;
    exchangeRequest = fetchExchangeRates();
    renderBudgetEquivalent();
    exchangeRequest.then(function (rates) {
      exchangeRates = rates;
      exchangeError = "";
      exchangeRetryAt = 0;
      try {
        localStorage.setItem(exchangeCacheKey, JSON.stringify(rates));
      } catch {
        // A denied or full store still leaves valid rates available in memory.
      }
    }).catch(function (error) {
      if (error.message === "timeout") {
        exchangeError = "The rate request timed out. Try again. Your coffee options stay in KZT.";
      } else if (error.message === "invalid-rates" || error instanceof SyntaxError) {
        exchangeError = "The rate service returned invalid data. Try again. Your coffee options stay in KZT.";
      } else if (error.message === "rate-limit") {
        exchangeError = "The rate service is busy. Try again. Your coffee options stay in KZT.";
      } else {
        exchangeError = "Conversion is unavailable. Check your connection and try again. Your coffee options stay in KZT.";
      }
    }).finally(function () {
      exchangeRequest = null;
      // Render only the current budget. A reset keeps this block hidden.
      renderBudgetEquivalent();
    });
  }

  function updateBudgetEquivalent(budgetKzt) {
    if (!budgetEquivalent) return;
    confirmedBudgetKzt = budgetKzt;
    if (budgetKzt !== null && (!exchangeRates || Date.now() >= exchangeRates.nextUpdateAt)) {
      // A previous failure needs an explicit retry, even after another budget is confirmed.
      if (!exchangeRequest && !exchangeError) requestExchangeRates();
    }
    renderBudgetEquivalent();
  }

  function initBudgetEquivalent() {
    const block = document.getElementById("budget-equivalent");
    if (!block) return;
    budgetEquivalent = {
      block: block,
      budget: block.querySelector("#equivalent-kzt"),
      values: block.querySelector("#equivalent-values"),
      usd: block.querySelector("#equivalent-usd"),
      eur: block.querySelector("#equivalent-eur"),
      updated: block.querySelector("#equivalent-updated"),
      status: block.querySelector("#equivalent-status"),
      retry: block.querySelector("#equivalent-retry")
    };
    exchangeRates = readExchangeCache();
    document.addEventListener("visibilitychange", refreshExpiredExchangeRates);
    window.addEventListener("pageshow", refreshExpiredExchangeRates);
    budgetEquivalent.retry.addEventListener("click", function () {
      if (confirmedBudgetKzt === null || exchangeRequest) return;
      if (Date.now() < exchangeRetryAt) {
        renderBudgetEquivalent();
        return;
      }
      exchangeError = "";
      updateBudgetEquivalent(confirmedBudgetKzt);
    });
  }

  async function initCampusMap() {
    const viewport = document.getElementById("map-viewport");
    if (!viewport) return; // No Three.js or plan request on other pages.
    const notice = document.getElementById("map-notice");
    const status = document.getElementById("map-status");
    const retry = document.getElementById("map-retry");
    const mapScreen = document.getElementById("campus-map");
    const spotCard = document.getElementById("map-spot-card");
    const cardLeader = document.getElementById("map-card-leader");
    const spotPhoto = document.getElementById("map-spot-image");
    const photoStatus = document.getElementById("map-spot-image-status");
    function setSpotPhotoState(state) {
      spotPhoto.parentElement.classList.toggle("is-photo-pending", state !== "ready");
      photoStatus.hidden = state === "ready";
      photoStatus.textContent = state === "loading" ? "Loading photo…" :
        state === "error" ? "Photo unavailable. You can still open the dining spot details." : "";
    }
    spotPhoto.addEventListener("load", function () { setSpotPhotoState("ready"); });
    spotPhoto.addEventListener("error", function () { setSpotPhotoState("error"); });
    const buttons = Array.from(document.querySelectorAll(".map-controls button"));
    let renderer, controls, frame = 0, failed = false;
    let mapThemeTransition = null;
    function showError(message) {
      failed = true;
      cancelAnimationFrame(frame);
      frame = 0;
      if (controls) controls.enabled = false;
      buttons.forEach(function (button) { button.disabled = true; });
      notice.hidden = false;
      status.textContent = message;
      status.classList.add("map-error");
      status.setAttribute("role", "alert");
      retry.hidden = false;
    }
    // A fresh page also recovers a failed module import or lost WebGL context.
    retry.addEventListener("click", function () { window.location.reload(); });
    try {
      const [THREE, { OrbitControls }, { SVGLoader }] = await Promise.all([
        import("../vendor/three/three.module.min.js"),
        import("../vendor/three/OrbitControls.js"),
        import("../vendor/three/SVGLoader.js")
      ]);
      const abort = new AbortController();
      const timeout = setTimeout(function () { abort.abort(); }, 15000);
      let plan;
      try {
        const response = await fetch("images/campus-first-floor.svg", { signal: abort.signal });
        if (!response.ok) throw new Error("Floor plan unavailable");
        plan = new SVGLoader().parse(await response.text());
        if (plan.xml.getAttribute("data-floor") !== "1" || !plan.paths.length) {
          throw new Error("Invalid first-floor plan");
        }
      } finally { clearTimeout(timeout); }

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.domElement.setAttribute("aria-hidden", "true");
      viewport.prepend(renderer.domElement);
      renderer.domElement.addEventListener("webglcontextlost", function (event) {
        event.preventDefault();
        showError("3D rendering stopped. Retry the map or return Home.");
      });
      const scene = new THREE.Scene();
      const model = new THREE.Group();
      scene.add(model);
      const material = function () { return new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }); };
      const materials = { floor: material(), room: material(), wall: material(), cap: material(), edge: material(),
        stem: new THREE.LineBasicMaterial() };

      // Source coordinates are the licensed SVG's viewBox, after its transforms.
      // Use only drawn wall segments: closing a room polyline would seal its door.
      const wallSegments = [];
      const seenSegments = new Set();
      const venueShapes = new Map();
      plan.paths.forEach(function (path) {
        const kind = path.userData.node.getAttribute("data-kind");
        if (kind === "floor" || kind === "room") {
          const shapes = SVGLoader.createShapes(path);
          const venue = path.userData.node.getAttribute("data-venue");
          if (venue) venueShapes.set(venue, shapes);
          const geometry = kind === "floor"
            ? new THREE.ExtrudeGeometry(shapes, { depth: 5, bevelEnabled: false, curveSegments: 20 })
            : new THREE.ShapeGeometry(shapes, 20);
          const mesh = new THREE.Mesh(geometry, kind === "floor" ? [materials.floor, materials.edge] : materials.room);
          mesh.rotation.x = Math.PI / 2; // SVG down becomes world +Z; slab extends below the floor.
          mesh.position.y = kind === "room" ? 0.4 : 0;
          model.add(mesh);
        }
        if (kind !== "room" && kind !== "wall") return;
        path.subPaths.forEach(function (subpath) {
          const points = subpath.getPoints(20);
          if (subpath.autoClose && !points[0].equals(points[points.length - 1])) points.push(points[0]);
          for (let i = 1; i < points.length; i++) {
            const a = points[i - 1], b = points[i];
            if (a.distanceTo(b) < 0.05) continue;
            const key = [a, b].map(function (p) { return p.x.toFixed(2) + "," + p.y.toFixed(2); }).sort().join(";");
            if (!seenSegments.has(key)) { seenSegments.add(key); wallSegments.push([a, b]); }
          }
        });
      });
      // Heights are schematic; the horizontal plan and all door gaps come from floor 1.
      const wallHeight = 8;
      const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1),
        [materials.wall, materials.wall, materials.cap, materials.wall, materials.wall, materials.wall], wallSegments.length);
      const transform = new THREE.Object3D();
      wallSegments.forEach(function ([a, b], index) {
        transform.position.set((a.x + b.x) / 2, wallHeight / 2 + 0.4, (a.y + b.y) / 2);
        transform.rotation.y = -Math.atan2(b.y - a.y, b.x - a.x);
        transform.scale.set(a.distanceTo(b), wallHeight, 1);
        transform.updateMatrix();
        walls.setMatrixAt(index, transform.matrix);
      });
      model.add(walls);
      const bounds = new THREE.Box3().setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      model.position.set(-center.x, 0, -center.z);
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 4000);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      controls.dampingFactor = 0.12;
      controls.screenSpacePanning = false;
      controls.minPolarAngle = 0.04;
      controls.maxPolarAngle = Math.PI * 0.38;
      controls.minZoom = 0.75;
      controls.maxZoom = 4;
      controls.rotateSpeed = 0.65;
      controls.zoomSpeed = 0.8;
      controls.keyPanSpeed = 24;
      viewport.addEventListener("keydown", function (event) {
        if (event.key.startsWith("Arrow") &&
            (event.target !== viewport || event.altKey || event.ctrlKey || event.metaKey)) {
          // Leave browser shortcuts and focused controls alone, before OrbitControls sees the event.
          event.stopImmediatePropagation();
        }
      }, true);
      controls.listenToKeyEvents(viewport);

      // Pin TIPS from the user's images/campus-map.jpg, not the service's POIs.
      // Image -> SVG calibration: x=(px-8)/2.0595, z=(py-155.9243)/2.0653937.
      // Checked against the outside contour, central cores and entrance notches;
      // practical reference precision is about 3 image pixels. No north inferred.
      const spots = [
        { id: "sheker", name: "Sheker", color: "#30D5C8", x: 330.18, z: 238.73,
          kioskAngle: -8.3989, image: "gallery/sheker-sign.jpg", alt: "Sheker coffee shop sign",
          description: "Hot coffee, cakes, croissants, sandwiches and salads from an open kiosk with small tables.",
          location: "Between C1.1 and C1.2", hours: "Mon–Sat · 10:00–19:30" },
        { id: "coffee-lake", name: "Coffee Lake", color: "#E55934", x: 423.89, z: 269.23,
          image: "gallery/coffee-lake-view.jpg", alt: "General view of the Coffee Lake coffee shop",
          description: "Iced coffee and tea, sandwiches and ready-to-go meals in a cozy indoor corner.",
          location: "C1.2 (atrium)", hours: "Mon–Sat · 9:00–20:00" },
        { id: "mokko", name: "Mokko", color: "#D0B73E", x: 591.41, z: 244.06,
          kioskAngle: 8.4339, image: "gallery/mokko-view.jpg", alt: "General view of the Mokko coffee shop",
          description: "Classic coffee, packaged sandwiches and salads, chocolate and snacks from a small open kiosk.",
          location: "Between C1.2 and C1.3", hours: "Mon–Fri · 10:00–19:00" },
        { id: "cafeteria", name: "Cafeteria", color: "#2DCA6A", x: 803.59, z: 281.82,
          image: "gallery/cafeteria-view.jpg", alt: "General view of the campus Cafeteria",
          description: "Hot dishes, soups, salads, fresh bakery and dairy at the lowest prices on campus.",
          location: "C1.3", hours: "Mon–Fri · 9:00–20:00" }
      ];
      let selected = null;
      let revealSelection = false;
      const areaMaterials = [];
      const clickableAreas = [];
      function createSpotArea(spot) {
        let shapes = venueShapes.get(spot.id);
        if (spot.kioskAngle !== undefined) {
          // Kiosk footprints are schematic 12 × 8 SVG units, not measured architecture.
          // The reference supplies their anchors; these small boxes fit within the passages.
          const angle = THREE.MathUtils.degToRad(spot.kioskAngle);
          const corners = [[-6, -4], [6, -4], [6, 4], [-6, 4]].map(function ([x, z]) {
            return new THREE.Vector2(spot.x + x * Math.cos(angle) - z * Math.sin(angle),
              spot.z + x * Math.sin(angle) + z * Math.cos(angle));
          });
          // The highlighted territory follows the source plan's full outlined area.
          // Only the small physical kiosk remains schematic.
          if (!shapes) shapes = [new THREE.Shape(corners)];
          const top = new THREE.MeshBasicMaterial({ color: spot.color });
          areaMaterials.push(top);
          const kiosk = new THREE.Mesh(new THREE.BoxGeometry(12, 7, 8),
            [materials.wall, materials.wall, top, materials.wall, materials.wall, materials.wall]);
          kiosk.position.set(spot.x, 4.2, spot.z);
          kiosk.rotation.y = -angle;
          kiosk.userData.spot = spot;
          model.add(kiosk);
          clickableAreas.push(kiosk);
          const stem = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(spot.x, 7.7, spot.z), new THREE.Vector3(spot.x, 24, spot.z)
          ]), materials.stem);
          model.add(stem);
        }
        if (!shapes) return;
        const fill = new THREE.MeshBasicMaterial({ color: spot.color, transparent: true,
          opacity: 0.25, depthWrite: false, side: THREE.DoubleSide });
        const glow = fill.clone();
        glow.opacity = 0.1;
        const edge = fill.clone();
        edge.opacity = 0.8;
        areaMaterials.push(fill, glow, edge);
        spot.area = { fill: fill, glow: glow, edge: edge };
        const surface = new THREE.Mesh(new THREE.ShapeGeometry(shapes, 20), fill);
        surface.rotation.x = Math.PI / 2;
        surface.position.y = 0.6;
        surface.userData.spot = spot;
        model.add(surface);
        clickableAreas.push(surface);
        shapes.forEach(function (shape) {
          const points = shape.getPoints(20);
          if (!points[0].equals(points[points.length - 1])) points.push(points[0].clone());
          // Two static outline bands give a soft glow without a continuous animation or bloom pass.
          [[6, glow, 0.65], [1.4, edge, 0.7]].forEach(function ([width, strokeMaterial, height]) {
            const geometry = SVGLoader.pointsToStroke(points, SVGLoader.getStrokeStyle(width, spot.color, "round", "round"));
            if (!geometry) return;
            const outline = new THREE.Mesh(geometry, strokeMaterial);
            outline.rotation.x = Math.PI / 2;
            outline.position.y = height;
            model.add(outline);
          });
        });
      }
      function updateSpotSelection() {
        spots.forEach(function (spot) {
          const active = spot === selected;
          spot.button.setAttribute("aria-pressed", String(active));
          spot.button.setAttribute("aria-expanded", String(active));
          if (spot.area) {
            spot.area.fill.opacity = active ? 0.46 : 0.25;
            spot.area.glow.opacity = active ? 0.22 : 0.1;
            spot.area.edge.opacity = active ? 1 : 0.8;
          }
        });
        requestRender();
      }
      function selectSpot(spot, keyboard) {
        selected = spot;
        setSpotPhotoState("loading");
        spotPhoto.alt = spot.alt;
        spotPhoto.src = spot.image;
        if (spotPhoto.complete) setSpotPhotoState(spotPhoto.naturalWidth ? "ready" : "error");
        document.getElementById("map-spot-title").textContent = spot.name;
        document.getElementById("map-spot-description").textContent = spot.description;
        const location = document.createElement("span");
        location.textContent = spot.location.replace("Between ", "").replace(" and ", " ↔ ");
        location.setAttribute("aria-label", spot.location);
        location.title = spot.location;
        const hours = document.createElement("span");
        hours.textContent = spot.hours;
        document.getElementById("map-spot-meta").replaceChildren(location, document.createTextNode("\n"), hours);
        const details = document.getElementById("map-spot-details");
        details.href = "eateries.html#" + spot.id;
        details.setAttribute("aria-label", "More details about " + spot.name);
        spotCard.style.setProperty("--spot-color", spot.color);
        spotCard.hidden = false;
        spotCard.querySelector(".map-spot-card-scroll").scrollTop = 0;
        revealSelection = true;
        updateSpotSelection();
        projectMarkers();
        // Keep pointer selection on the map; keyboard activation lands on the requested action.
        if (keyboard) {
          details.focus({ preventScroll: true });
          details.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      }
      function closeSpotCard(restoreFocus = true) {
        const previous = selected;
        selected = null;
        spotCard.hidden = true;
        cardLeader.setAttribute("hidden", "");
        updateSpotSelection();
        if (previous && restoreFocus) previous.button.focus({ preventScroll: true });
      }
      document.getElementById("map-spot-close").addEventListener("click", function () { closeSpotCard(); });
      mapScreen.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !spotCard.hidden) {
          event.preventDefault();
          event.stopPropagation();
          closeSpotCard();
        }
      });
      const markerLayer = document.getElementById("map-markers");
      let gestureStart = null, dragged = false;
      viewport.addEventListener("pointerdown", function (event) {
        if (!event.isPrimary) { dragged = true; return; }
        gestureStart = { x: event.clientX, y: event.clientY };
        dragged = false;
      }, true);
      viewport.addEventListener("pointermove", function (event) {
        if (gestureStart && Math.hypot(event.clientX - gestureStart.x, event.clientY - gestureStart.y) > 6) dragged = true;
      }, true);
      viewport.addEventListener("pointerup", function () { gestureStart = null; }, true);
      viewport.addEventListener("pointercancel", function () { gestureStart = null; dragged = true; }, true);
      spots.forEach(function (spot) {
        createSpotArea(spot);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "map-marker";
        button.setAttribute("aria-label", spot.name);
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", "map-spot-card");
        button.style.setProperty("--marker-color", spot.color);
        const label = document.createElement("span");
        label.className = "map-marker-label";
        label.textContent = spot.name;
        const dot = document.createElement("span");
        dot.className = "map-marker-dot";
        dot.setAttribute("aria-hidden", "true");
        button.append(label, dot);
        markerLayer.append(button);
        spot.button = button;
        spot.label = label;
        spot.position = new THREE.Vector3(spot.x - center.x, spot.kioskAngle !== undefined ? 24 : wallHeight + 2, spot.z - center.z);
        button.addEventListener("click", function (event) {
          if (event.detail && dragged) return;
          selectSpot(spot, event.detail === 0);
        });
        button.addEventListener("focus", function () {
          // A preview must never obscure the next keyboard-focused dining spot.
          if (selected && selected !== spot) closeSpotCard(false);
          // Off-screen markers remain keyboard reachable, and focus brings their real anchor into view.
          if (button.classList.contains("map-marker-offscreen")) {
            const shift = new THREE.Vector3(spot.position.x, 0, spot.position.z).sub(controls.target);
            controls.target.add(shift);
            camera.position.add(shift);
          }
          requestRender();
        });
        button.addEventListener("blur", requestRender);
      });
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      function spotAtPointer(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.set((event.clientX - rect.left) / rect.width * 2 - 1,
          1 - (event.clientY - rect.top) / rect.height * 2);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(clickableAreas, false)[0];
        return hit ? hit.object.userData.spot : null;
      }
      renderer.domElement.addEventListener("click", function (event) {
        if (dragged || event.button !== 0) return;
        const spot = spotAtPointer(event);
        if (spot) selectSpot(spot, false);
      });
      renderer.domElement.addEventListener("pointermove", function (event) {
        if (!event.buttons) viewport.classList.toggle("is-over-spot", Boolean(spotAtPointer(event)));
      });
      renderer.domElement.addEventListener("pointerleave", function () { viewport.classList.remove("is-over-spot"); });
      const projected = new THREE.Vector3();
      const viewPosition = new THREE.Vector3();
      const panels = Array.from(document.querySelectorAll(".map-toolbar, .map-controls, .map-help, .map-help-content"));
      function positionSpotCard() {
        if (!selected || spotCard.hidden) { cardLeader.setAttribute("hidden", ""); return; }
        const anchor = selected.screen;
        const outside = selected.button.classList.contains("map-marker-offscreen");
        spotCard.classList.toggle("map-card-offscreen", outside);
        spotCard.inert = outside;
        cardLeader.toggleAttribute("hidden", outside);
        if (outside) return;
        const width = mapScreen.clientWidth, height = mapScreen.clientHeight;
        const toolbar = document.querySelector(".map-toolbar").getBoundingClientRect();
        const controlBar = document.querySelector(".map-controls").getBoundingClientRect();
        const top = toolbar.bottom + 12, bottom = controlBar.top - 12;
        const gap = 28;
        const cardWidth = spotCard.offsetWidth;
        let maxHeight = Math.max(44, bottom - top);
        // On narrow screens, keep the pin exposed above or below a scrollable preview.
        if (anchor.x - gap - 12 < cardWidth && width - 12 - anchor.x - gap < cardWidth) {
          maxHeight = Math.min(maxHeight, Math.max(44, anchor.y - gap - top, bottom - anchor.y - gap));
        }
        spotCard.style.maxHeight = Math.floor(maxHeight) + "px";
        const cardHeight = spotCard.offsetHeight;
        const clamp = THREE.MathUtils.clamp;
        const candidates = [
          [anchor.x - cardWidth / 2, anchor.y - cardHeight - gap],
          [anchor.x + gap, anchor.y - cardHeight / 2],
          [anchor.x - cardWidth - gap, anchor.y - cardHeight / 2],
          [anchor.x - cardWidth / 2, anchor.y + gap]
        ].map(function ([x, y], index) {
          const left = clamp(x, 12, Math.max(12, width - cardWidth - 12));
          const upper = clamp(y, top, Math.max(top, bottom - cardHeight));
          const right = left + cardWidth, lower = upper + cardHeight;
          const nearestX = clamp(anchor.x, left, right), nearestY = clamp(anchor.y, upper, lower);
          const distance = Math.hypot(nearestX - anchor.x, nearestY - anchor.y);
          const covered = spots.filter(function (spot) {
            return spot !== selected && spot.screen && spot.screen.x > left - 16 && spot.screen.x < right + 16 &&
              spot.screen.y > upper - 16 && spot.screen.y < lower + 16;
          }).length;
          return { left: left, top: upper, right: right, bottom: lower,
            score: Math.abs(left - x) + Math.abs(upper - y) + distance * 0.2 + covered * 90 +
              (distance < 20 ? 10000 : 0) + index };
        });
        candidates.sort(function (a, b) { return a.score - b.score; });
        const placement = candidates[0];
        spotCard.style.left = Math.round(placement.left) + "px";
        spotCard.style.top = Math.round(placement.top) + "px";
        // Both endpoints are derived from the current camera projection, never screen percentages.
        const endX = clamp(anchor.x, placement.left + 8, placement.right - 8);
        const endY = clamp(anchor.y, placement.top + 8, placement.bottom - 8);
        const length = Math.hypot(endX - anchor.x, endY - anchor.y);
        const startX = anchor.x + (endX - anchor.x) * Math.min(1, 16 / Math.max(1, length));
        const startY = anchor.y + (endY - anchor.y) * Math.min(1, 16 / Math.max(1, length));
        cardLeader.setAttribute("viewBox", "0 0 " + width + " " + height);
        cardLeader.querySelectorAll("path").forEach(function (path) {
          path.setAttribute("d", "M " + startX + " " + startY + " L " + endX + " " + endY);
        });
      }
      function projectMarkers() {
        const width = viewport.clientWidth, height = viewport.clientHeight;
        const panelRects = panels.filter(function (panel) {
          return panel.getClientRects().length &&
            (!panel.classList.contains("map-help-content") || panel.parentElement.open);
        }).map(function (panel) { return panel.getBoundingClientRect(); });
        const intersects = function (a, b) {
          return a.left < b.right + 5 && a.right > b.left - 5 && a.top < b.bottom + 5 && a.bottom > b.top - 5;
        };
        spots.forEach(function (spot) {
          projected.copy(spot.position).project(camera);
          viewPosition.copy(spot.position).applyMatrix4(camera.matrixWorldInverse);
          const x = (projected.x + 1) * width / 2, y = (1 - projected.y) * height / 2;
          spot.screen = { x: x, y: y };
          spot.button.style.left = x + "px";
          spot.button.style.top = y + "px";
          spot.label.classList.remove("map-label-crowded");
          const rect = spot.button.getBoundingClientRect();
          const outside = viewPosition.z >= 0 || Math.abs(projected.z) > 1 ||
            rect.left < 8 || rect.right > width - 8 || rect.top < 8 || rect.bottom > height - 8 ||
            panelRects.some(function (panel) { return intersects(rect, panel); });
          spot.button.classList.toggle("map-marker-offscreen", outside);
          if (outside && (spot.button === document.activeElement || (spot === selected && revealSelection))) {
            const shift = new THREE.Vector3(spot.position.x, 0, spot.position.z).sub(controls.target);
            // If a very small screen still clips the label, don't loop forever at the same target.
            if (shift.lengthSq() > 0.01) {
              controls.target.add(shift);
              camera.position.add(shift);
              requestRender();
            }
          }
        });
        positionSpotCard();
        revealSelection = false;
        const occupied = [];
        // Selected and keyboard-focused labels have priority when the view gets tight.
        const priority = spots.slice().sort(function (a, b) {
          const rank = function (spot) { return spot.button === document.activeElement ? 2 : Number(spot === selected); };
          return rank(b) - rank(a);
        });
        priority.forEach(function (spot) {
          if (spot.button.classList.contains("map-marker-offscreen")) return;
          const rect = spot.label.getBoundingClientRect();
          if (!rect.width) return;
          const overlaps = occupied.some(function (other) { return intersects(rect, other); });
          if (overlaps) spot.label.classList.add("map-label-crowded");
          else occupied.push(rect);
        });
      }
      function clampTarget() {
        const bounded = controls.target.clone();
        bounded.x = THREE.MathUtils.clamp(bounded.x, -size.x * 0.42, size.x * 0.42);
        bounded.z = THREE.MathUtils.clamp(bounded.z, -size.z * 0.42, size.z * 0.42);
        bounded.y = 0;
        camera.position.add(bounded.clone().sub(controls.target));
        controls.target.copy(bounded);
      }
      function requestRender() {
        if (!frame && !document.hidden && !failed) frame = requestAnimationFrame(renderMap);
      }
      function renderMap(now) {
        frame = 0;
        if (mapThemeTransition) {
          const progress = Math.min(1, Math.max(0, (now - mapThemeTransition.started) / 420));
          const eased = progress * progress * (3 - 2 * progress);
          mapThemeTransition.colors.forEach(function (entry) {
            entry.color.lerpColors(entry.from, entry.to, eased);
          });
          if (progress === 1) mapThemeTransition = null;
        }
        const moving = controls.update();
        clampTarget();
        camera.updateMatrixWorld();
        renderer.render(scene, camera);
        projectMarkers();
        document.getElementById("map-zoom-in").disabled = camera.zoom >= controls.maxZoom;
        document.getElementById("map-zoom-out").disabled = camera.zoom <= controls.minZoom;
        if (mapThemeTransition || (moving && controls.enableDamping)) requestRender();
      }
      function resizeMap() {
        const width = viewport.clientWidth, height = viewport.clientHeight;
        if (!width || !height) return;
        const aspect = width / height;
        camera.lookAt(controls.target);
        camera.updateMatrixWorld();
        const viewBounds = new THREE.Box3();
        [-size.x / 2, size.x / 2].forEach(function (x) {
          [-5, wallHeight + 2].forEach(function (y) {
            [-size.z / 2, size.z / 2].forEach(function (z) {
              viewBounds.expandByPoint(new THREE.Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse));
            });
          });
        });
        const viewSize = viewBounds.getSize(new THREE.Vector3());
        // Fit the full first floor, reserving room for the compact top/bottom controls.
        const verticalSpace = Math.max(100, height - 200);
        const span = Math.max(viewSize.x / aspect * 1.15, viewSize.y * height / verticalSpace);
        camera.left = -span * aspect / 2;
        camera.right = span * aspect / 2;
        camera.top = span / 2;
        camera.bottom = -span / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        revealSelection = !spotCard.hidden;
        requestRender();
      }
      function resetView() {
        // Flush any damping left by a drag before restoring the current viewport's fit.
        const damping = controls.enableDamping;
        controls.enableDamping = false;
        controls.update();
        controls.enableDamping = damping;
        controls.target.set(0, 0, 0);
        if (viewport.clientWidth < viewport.clientHeight * 0.85) camera.position.set(700, 850, 0);
        else camera.position.set(0, 850, 700);
        camera.zoom = 1;
        resizeMap();
        controls.update();
        requestRender();
      }
      function zoom(factor) {
        camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom);
        camera.updateProjectionMatrix();
        controls.update();
        requestRender();
      }
      function rotate(angle) {
        const offset = camera.position.clone().sub(controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        camera.position.copy(controls.target).add(offset);
        controls.update();
        requestRender();
      }
      document.getElementById("map-zoom-in").addEventListener("click", function () { zoom(1.25); });
      document.getElementById("map-zoom-out").addEventListener("click", function () { zoom(0.8); });
      document.getElementById("map-rotate-left").addEventListener("click", function () { rotate(-Math.PI / 8); });
      document.getElementById("map-rotate-right").addEventListener("click", function () { rotate(Math.PI / 8); });
      document.getElementById("map-reset").addEventListener("click", resetView);
      viewport.addEventListener("keydown", function (event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.target !== viewport) return;
        const key = event.key.toLowerCase();
        if (key === "+" || key === "=") zoom(1.25);
        else if (key === "-" || key === "_") zoom(0.8);
        else if (key === "a") rotate(-Math.PI / 8);
        else if (key === "d") rotate(Math.PI / 8);
        else if (key === "home") resetView();
        else return;
        event.preventDefault();
      });
      function updateMapTheme() {
        const css = getComputedStyle(document.documentElement);
        const color = function (name) { return css.getPropertyValue(name).trim(); };
        const dark = document.documentElement.dataset.bsTheme === "dark";
        const animate = scene.background && document.documentElement.classList.contains("theme-switching") &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!scene.background) scene.background = new THREE.Color(color("--color-bg"));
        const colors = [
          [scene.background, "--color-bg"],
          [materials.floor.color, "--bs-border-color"],
          [materials.room.color, "--color-surface-muted"],
          [materials.wall.color, dark ? "--color-control-border" : "--color-text-soft"],
          [materials.cap.color, dark ? "--color-text-soft" : "--color-text"],
          [materials.edge.color, "--color-control-border"],
          [materials.stem.color, "--color-text-soft"]
        ].map(function (entry) {
          return { color: entry[0], from: entry[0].clone(), to: new THREE.Color(color(entry[1])) };
        });
        mapThemeTransition = animate ? { started: performance.now(), colors: colors } : null;
        if (!animate) colors.forEach(function (entry) { entry.color.copy(entry.to); });
        requestRender();
      }
      const themeObserver = new MutationObserver(updateMapTheme);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
      const resizeObserver = new ResizeObserver(resizeMap);
      resizeObserver.observe(viewport);
      const cardObserver = new ResizeObserver(requestRender);
      cardObserver.observe(spotCard);
      controls.addEventListener("change", requestRender);
      document.addEventListener("layoutchange", requestRender);
      document.querySelector(".map-help").addEventListener("toggle", requestRender);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
        else requestRender();
      });
      window.addEventListener("pagehide", function (event) {
        cancelAnimationFrame(frame);
        frame = 0;
        if (event.persisted) return;
        themeObserver.disconnect();
        resizeObserver.disconnect();
        cardObserver.disconnect();
        controls.dispose();
        model.traverse(function (object) { if (object.geometry) object.geometry.dispose(); });
        Object.values(materials).forEach(function (value) { value.dispose(); });
        areaMaterials.forEach(function (value) { value.dispose(); });
        renderer.dispose();
      });
      window.addEventListener("pageshow", requestRender);
      updateMapTheme();
      resetView();
      buttons.forEach(function (button) { button.disabled = false; });
      notice.hidden = true;
    } catch (error) {
      if (renderer) renderer.dispose();
      console.error("Campus map could not initialize:", error);
      showError("The 3D map could not load. Check WebGL and your connection, then retry or return Home.");
    }
  }

  function initDiningSpotAnchor() {
    const strip = document.querySelector(".spots-strip");
    if (!strip) return;
    function revealCard() {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target && target.parentElement === strip) {
        // Native fragment scrolling can snap back to the previous card on narrow screens.
        target.scrollIntoView({ block: "start", inline: "start", behavior: "instant" });
      }
    }
    window.addEventListener("hashchange", revealCard);
    if (document.readyState === "complete") revealCard();
    else window.addEventListener("load", revealCard, { once: true });
  }

  // Initialize once after deferred jQuery and the document are ready.
  let initialized = false;
  function initSite() {
    if (initialized) return;
    initialized = true;
    initThemeToggle();
    initNavigation();
    initHeaderHeight();
    initFaqToggles();
    initAstanaClock();
    initializePhotoGuide(); // Save real gallery URLs before lazy loading consumes data-src.
    initBudgetEquivalent();
    initCoffeePlanner();
    initRegistrationForm();
    initSubscriptionDialog();
    initLoginDialog();
    initContactForm();
    initCampusMap();
    initDiningSpotAnchor();
    const $ = window.jQuery;
    if ($) {
      initPageEffects($);
      initMenuSearch($);
      initMenuAutocomplete($);
      initClipboard($);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSite, { once: true });
  } else {
    initSite();
  }
})();
