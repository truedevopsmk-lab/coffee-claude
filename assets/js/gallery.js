document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxDialog = lightbox?.querySelector(".gallery-lightbox-dialog");
  const lightboxImage = document.getElementById("gallery-lightbox-image");
  const lightboxCaption = document.getElementById("gallery-lightbox-caption");
  const triggerButtons = document.querySelectorAll(".gallery-trigger");
  const closeButtons = lightbox?.querySelectorAll("[data-gallery-close]") || [];

  if (!lightbox || !lightboxDialog || !lightboxImage || !lightboxCaption || triggerButtons.length === 0) {
    return;
  }

  let lastFocusedElement = null;

  function getFocusableElements() {
    return Array.from(
      lightbox.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute("disabled"));
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

  function openLightbox(imageSrc, captionText, trigger) {
    lastFocusedElement = trigger;
    lightboxImage.src = imageSrc;
    lightboxImage.alt = captionText;
    lightboxCaption.textContent = captionText;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";

    const firstFocusable = getFocusableElements()[0];
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      lightboxDialog.focus();
    }
  }

  triggerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openLightbox(
        button.dataset.galleryImage || "",
        button.dataset.galleryCaption || "",
        button
      );
    });
  });

  closeButtons.forEach((element) => {
    element.addEventListener("click", closeLightbox);
  });

  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if (event.key !== "Tab" || lightbox.hidden) {
      return;
    }

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });
});
