// Existing features: background color, FAQ and Astana clock.
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

// Interactive gallery: initialize only when its container exists.
function initializePhotoGuide() {
  const gallery = document.querySelector("#gallery");

  if (!gallery) {
    return;
  }

  const thumbnailButtons = gallery.querySelectorAll(".gallery-thumbnail");
  const galleryPhotos = [];

  // HTML is the source of photo paths, descriptions and menu destinations.
  for (const button of thumbnailButtons) {
    const image = button.querySelector("img");
    const photo = {
      src: image.getAttribute("src"),
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
  let currentPhotoIndex = 0;

  // Gallery sound: always play after a user changes the photo, never on load.
  const gallerySound = {
    audio: gallery.querySelector("#gallery-audio"),
    play() {
      this.stop();
      this.audio.play().then(clearGallerySoundError).catch(handleGallerySoundError);
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
    // A rapid second click can interrupt the previous play request.
    if (error.name === "AbortError") {
      return;
    }

    gallerySound.stop();
    soundMessage.textContent = "Sound is unavailable. You can still explore the photos.";
  }

  // Photo display and controls.
  function showPhoto(index) {
    if (index < 0) {
      index = galleryPhotos.length - 1;
    } else if (index >= galleryPhotos.length) {
      index = 0;
    }

    currentPhotoIndex = index;
    const photo = galleryPhotos[currentPhotoIndex];
    mainImage.src = photo.src;
    mainImage.alt = photo.alt;
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
  }

  // Register each listener once. Native buttons also handle Enter and Space.
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
    let button = event.target.closest(".gallery-thumbnail, .gallery-arrow");

    // Clicking the large photo also gives its keyboard controls focus.
    if (!button && event.target.closest(".gallery-image-panel")) {
      button = nextButton;
    }

    // Some browsers do not focus buttons when they are clicked.
    if (button && gallery.contains(button)) {
      button.focus({ preventScroll: true });
    }
  }

  function handleGalleryArrowKeys(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    // Only photo controls handle arrows; menu links keep their native behavior.
    if (!event.target.matches(".gallery-thumbnail, .gallery-arrow")) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousPhoto();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextPhoto();
    }
  }

  previousButton.addEventListener("click", showPreviousPhoto);
  nextButton.addEventListener("click", showNextPhoto);
  gallery.addEventListener("click", focusGalleryControl);
  gallery.addEventListener("keydown", handleGalleryArrowKeys);
  previousButton.disabled = false;
  nextButton.disabled = false;

  // Initial rendering is silent and does not move focus or scroll the page.
  showPhoto(0);
}

// Keyboard navigation: arrow keys move focus within the primary links.
function initializePrimaryNavigation() {
  const navigation = document.querySelector("#main-nav");

  if (!navigation) {
    return;
  }

  const navigationLinks = Array.from(navigation.querySelectorAll("a.nav-link"));

  if (navigationLinks.length === 0) {
    return;
  }

  function moveNavigationFocus(event) {
    // Preserve browser shortcuts such as Alt+ArrowLeft and modified keys.
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const currentIndex = navigationLinks.indexOf(event.target);

    if (currentIndex === -1) {
      return;
    }

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") {
      nextIndex = currentIndex + 1;
      if (nextIndex >= navigationLinks.length) {
        nextIndex = 0;
      }
    } else if (event.key === "ArrowLeft") {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) {
        nextIndex = navigationLinks.length - 1;
      }
    } else {
      return;
    }

    event.preventDefault();
    navigationLinks[nextIndex].focus();
  }

  navigation.addEventListener("keydown", moveNavigationFocus);

  // Give arrows a starting point without overriding a focused control or anchor.
  const currentPageLink = navigation.querySelector('a[aria-current="page"]');
  if (currentPageLink && document.activeElement === document.body && !window.location.hash) {
    currentPageLink.focus({ preventScroll: true });
  }
}

initializePrimaryNavigation();
initializePhotoGuide();
