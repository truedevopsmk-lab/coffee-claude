document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxDialog = lightbox?.querySelector(".gallery-lightbox-dialog");
  const lightboxImage = document.getElementById("gallery-lightbox-image");
  const lightboxCaption = document.getElementById("gallery-lightbox-caption");
  const lightboxCount = document.getElementById("gallery-lightbox-count");
  const triggerButtons = Array.from(document.querySelectorAll(".gallery-trigger"));
  const closeButtons = lightbox?.querySelectorAll("[data-gallery-close]") || [];
  const prevButton = lightbox?.querySelector("[data-gallery-prev]");
  const nextButton = lightbox?.querySelector("[data-gallery-next]");

  if (!lightbox || !lightboxDialog || !lightboxImage || !lightboxCaption || triggerButtons.length === 0) {
    return;
  }

  let lastFocusedElement = null;
  let currentIndex = -1;

  function getFocusableElements() {
    return Array.from(
      lightbox.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
  }

  function wrapIndex(index) {
    return (index + triggerButtons.length) % triggerButtons.length;
  }

  // Warm the browser cache for the neighbours so swiping feels instant
  function preload(index) {
    const src = triggerButtons[wrapIndex(index)].dataset.galleryImage;
    if (src) new Image().src = src;
  }

  function showAt(index) {
    currentIndex = wrapIndex(index);
    const trigger = triggerButtons[currentIndex];
    const src = trigger.dataset.galleryImage || "";
    const caption = trigger.dataset.galleryCaption || "";
    // Show the already-loaded grid thumbnail instantly, then swap in the full image
    const thumb = trigger.querySelector("img");
    const thumbSrc = thumb && thumb.complete ? thumb.currentSrc : "";
    if (thumbSrc && thumbSrc !== new URL(src, location.href).href) {
      const shownIndex = currentIndex;
      lightboxImage.src = thumbSrc;
      const full = new Image();
      full.onload = () => {
        if (!lightbox.hidden && currentIndex === shownIndex) lightboxImage.src = src;
      };
      full.src = src;
    } else {
      lightboxImage.src = src;
    }
    lightboxImage.alt = caption;
    lightboxCaption.textContent = caption;
    lightboxCaption.style.display = caption ? "" : "none";
    if (lightboxCount) lightboxCount.textContent = `${currentIndex + 1} / ${triggerButtons.length}`;
    preload(currentIndex + 1);
    preload(currentIndex - 1);
  }

  function openLightbox(index, trigger) {
    lastFocusedElement = trigger;
    showAt(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxDialog.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.src = "";
    lightboxImage.alt = "";
    lightboxCaption.textContent = "";
    document.body.style.overflow = "";
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
  }

  triggerButtons.forEach((button, index) => {
    button.addEventListener("click", () => openLightbox(index, button));
  });

  closeButtons.forEach((el) => el.addEventListener("click", closeLightbox));
  prevButton?.addEventListener("click", () => showAt(currentIndex - 1));
  nextButton?.addEventListener("click", () => showAt(currentIndex + 1));

  // Touch: swipe left/right to browse, swipe down to close
  let touchStartX = 0;
  let touchStartY = 0;
  lightboxDialog.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  lightboxDialog.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showAt(currentIndex + (dx < 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) closeLightbox();
  }, { passive: true });

  lightbox.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;

    if (event.key === "Escape") { closeLightbox(); return; }
    if (event.key === "ArrowRight") { event.preventDefault(); showAt(currentIndex + 1); return; }
    if (event.key === "ArrowLeft") { event.preventDefault(); showAt(currentIndex - 1); return; }

    if (event.key !== "Tab") return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) { event.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
});
