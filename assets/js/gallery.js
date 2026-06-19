document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxDialog = lightbox?.querySelector(".gallery-lightbox-dialog");
  const lightboxImage = document.getElementById("gallery-lightbox-image");
  const lightboxCaption = document.getElementById("gallery-lightbox-caption");
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

  function showAt(index) {
    if (index < 0) index = triggerButtons.length - 1;
    if (index >= triggerButtons.length) index = 0;
    currentIndex = index;
    const trigger = triggerButtons[index];
    const src = trigger.dataset.galleryImage || "";
    const caption = trigger.dataset.galleryCaption || "";
    lightboxImage.src = src;
    lightboxImage.alt = caption;
    lightboxCaption.textContent = caption;
    lightboxCaption.style.display = caption ? "" : "none";
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

  // Basic swipe support on touch devices
  let touchStartX = 0;
  lightboxImage.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightboxImage.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 50) showAt(currentIndex + (dx < 0 ? 1 : -1));
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
