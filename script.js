const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const yearEl = document.getElementById("year");
const calendarMonthLabel = document.getElementById("calendar-month");
const calendarDays = document.getElementById("calendar-days");
const upcomingEvent = document.querySelector(".upcoming-event[data-calendar-date]");
const contactForm = document.getElementById("contact-form");
const contactFormStatus = document.getElementById("contact-form-status");
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

if (calendarMonthLabel && calendarDays && upcomingEvent) {
  const [year, month, day] = upcomingEvent.dataset.calendarDate.split("-").map(Number);
  const eventDate = new Date(year, month - 1, day);
  const monthLabel = eventDate.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  const weekdayOffset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cellCount = Math.ceil((weekdayOffset + daysInMonth) / 7) * 7;
  const eventTitle = upcomingEvent.querySelector("h3").textContent;

  calendarMonthLabel.textContent = monthLabel;
  calendarDays.setAttribute("aria-label", `Calendario de ${monthLabel}`);

  for (let index = 0; index < cellCount; index += 1) {
    const date = new Date(year, month - 1, index - weekdayOffset + 1);
    const calendarDay = document.createElement("span");
    calendarDay.className = "calendar-day";
    calendarDay.textContent = String(date.getDate());

    if (date.getMonth() !== month - 1) {
      calendarDay.classList.add("outside-month");
      calendarDay.setAttribute("aria-hidden", "true");
    }

    if (date.getTime() === eventDate.getTime()) {
      calendarDay.classList.add("has-event");
      calendarDay.setAttribute("aria-label", `${date.toLocaleDateString("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long"
      })}: ${eventTitle}`);
    }

    calendarDays.appendChild(calendarDay);
  }
}

if (contactForm && contactFormStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const subject = formData.get("subject");
    const message = [
      `Nombre: ${formData.get("name")}`,
      `Empresa: ${formData.get("company")}`,
      `Correo electrónico: ${formData.get("email")}`,
      `Teléfono: ${formData.get("phone") || "No indicado"}`,
      `Asunto: ${subject}`,
      "",
      "Descripción:",
      formData.get("description")
    ].join("\n");
    const emailParameters = new URLSearchParams({
      subject: `Contacto GEMEV: ${subject}`,
      body: message
    });

    contactFormStatus.dataset.state = "info";
    contactFormStatus.textContent = "Se abrirá tu aplicación de correo con el mensaje listo. Recuerda pulsar Enviar.";
    window.location.href = `mailto:contacto@gemev.co?${emailParameters.toString()}`;
  });}
