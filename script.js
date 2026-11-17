const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const yearEl = document.getElementById("year");
const navLinks = document.querySelectorAll(".main-nav a[href^='#']");
const observedSections = Array.from(navLinks)
  .map(link => document.querySelector(link.getAttribute("href")))
  .filter(Boolean)
  .sort((first, second) => first.offsetTop - second.offsetTop);
const siteHeader = document.querySelector(".site-header");

const setActiveLink = (sectionId) => {
  navLinks.forEach(link => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const closeMenu = () => {
  if (!nav) return;
  nav.classList.remove("open");
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
  }
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });
}

navLinks.forEach(link => {
  link.addEventListener("click", closeMenu);
});

const updateActiveLink = () => {
  const activationLine = (siteHeader ? siteHeader.offsetHeight : 0) + window.innerHeight * 0.2;
  const currentSection = observedSections.reduce((current, section) => {
    return section.getBoundingClientRect().top <= activationLine ? section : current;
  }, observedSections[0]);

  if (currentSection) setActiveLink(currentSection.id);
};

let scrollUpdatePending = false;
window.addEventListener("scroll", () => {
  if (scrollUpdatePending) return;
  scrollUpdatePending = true;
  window.requestAnimationFrame(() => {
    updateActiveLink();
    scrollUpdatePending = false;
  });
}, { passive: true });

window.addEventListener("resize", updateActiveLink);
updateActiveLink();

document.addEventListener("click", (event) => {
  if (!nav || !menuToggle) return;
  if (!nav.contains(event.target) && !menuToggle.contains(event.target)) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 700) closeMenu();
});

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
