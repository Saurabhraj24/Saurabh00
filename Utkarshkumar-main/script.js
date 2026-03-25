/* 
  Beginner-friendly JavaScript for:
  - Mobile menu toggle
  - Sticky navbar shadow on scroll
  - Active link highlighting (scroll spy)
  - Reveal animations on scroll
  - Skill bar animation when Skills section is visible
  - Simple contact form validation + EmailJS submit
*/

const headerEl = document.querySelector(".header");
const navToggleBtn = document.querySelector(".nav__toggle");
const navMenuEl = document.querySelector(".nav__menu");
const navLinks = Array.from(document.querySelectorAll(".nav__link"));
const yearEl = document.getElementById("year");

const revealEls = Array.from(document.querySelectorAll(".reveal"));
const skillEls = Array.from(document.querySelectorAll(".skill"));

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

// Theme toggle
const themeToggle = document.getElementById("themeToggle");
const currentTheme = localStorage.getItem("theme") || "dark";

// Project filtering
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".card");

// Typing animation
const typingText = document.getElementById("typingText");
const typingStrings = [
  "I build clean, scalable web apps.",
  "I solve complex problems with code.",
  "I create impactful digital solutions."
];
let typingIndex = 0;
let charIndex = 0;
let isDeleting = false;

// -------------------- Helpers --------------------
function setAriaExpanded(button, isExpanded) {
  button.setAttribute("aria-expanded", isExpanded ? "true" : "false");
}

function closeMenu() {
  navMenuEl.classList.remove("is-open");
  setAriaExpanded(navToggleBtn, false);
}

function openMenu() {
  navMenuEl.classList.add("is-open");
  setAriaExpanded(navToggleBtn, true);
}

function isMenuOpen() {
  return navMenuEl.classList.contains("is-open");
}

function setStatus(message, type) {
  formStatus.textContent = message;
  formStatus.classList.remove("ok", "bad");
  if (type) formStatus.classList.add(type);
}

function setFieldError(fieldName, message) {
  const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (errorEl) errorEl.textContent = message || "";
}

function getSectionFromLink(linkEl) {
  const href = linkEl.getAttribute("href");
  if (!href || !href.startsWith("#")) return null;
  return document.querySelector(href);
}

// -------------------- Footer year --------------------
if (yearEl) yearEl.textContent = new Date().getFullYear();

// -------------------- Theme toggle --------------------
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

setTheme(currentTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // Update currentTheme for next toggle
    window.location.reload(); // Simple way to apply theme changes
  });
}

// -------------------- Project filtering --------------------
function filterProjects(category) {
  projectCards.forEach(card => {
    const cardCategory = card.getAttribute("data-category");
    if (category === "all" || cardCategory === category) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons
    filterButtons.forEach(btn => btn.classList.remove("active"));
    // Add active class to clicked button
    button.classList.add("active");
    // Filter projects
    const category = button.getAttribute("data-filter");
    filterProjects(category);
  });
});

// -------------------- Typing animation --------------------
function typeWriter() {
  const currentString = typingStrings[typingIndex];
  
  if (!isDeleting) {
    typingText.textContent = currentString.substring(0, charIndex + 1);
    charIndex++;
    
    if (charIndex === currentString.length) {
      isDeleting = true;
      setTimeout(typeWriter, 2000); // Pause at end
      return;
    }
  } else {
    typingText.textContent = currentString.substring(0, charIndex - 1);
    charIndex--;
    
    if (charIndex === 0) {
      isDeleting = false;
      typingIndex = (typingIndex + 1) % typingStrings.length;
    }
  }
  
  const typingSpeed = isDeleting ? 50 : 100;
  setTimeout(typeWriter, typingSpeed);
}

// Start typing animation after a delay
setTimeout(() => {
  if (typingText) typeWriter();
}, 1000);

// -------------------- Sticky shadow --------------------
function onScrollHeader() {
  if (!headerEl) return;
  headerEl.classList.toggle("is-scrolled", window.scrollY > 8);
}
window.addEventListener("scroll", onScrollHeader, { passive: true });
onScrollHeader();

// -------------------- Mobile menu --------------------
if (navToggleBtn && navMenuEl) {
  navToggleBtn.addEventListener("click", () => {
    if (isMenuOpen()) closeMenu();
    else openMenu();
  });

  // Close the menu when a link is clicked (good for mobile UX)
  navLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  // Close on Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen()) closeMenu();
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    const clickedInsideNav =
      e.target.closest(".nav") || e.target.closest(".nav__menu");
    if (!clickedInsideNav && isMenuOpen()) closeMenu();
  });
}

// -------------------- Scroll spy (active nav link) --------------------
const sections = navLinks
  .map((link) => getSectionFromLink(link))
  .filter(Boolean);

function updateActiveLink() {
  if (!sections.length) return;

  const scrollPos = window.scrollY + 120; // offset for sticky header

  let activeIndex = 0;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.offsetTop <= scrollPos) activeIndex = i;
  }

  navLinks.forEach((l) => l.classList.remove("active"));
  const activeLink = navLinks[activeIndex];
  if (activeLink) activeLink.classList.add("active");
}
window.addEventListener("scroll", updateActiveLink, { passive: true });
updateActiveLink();

// -------------------- Reveal animations --------------------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => revealObserver.observe(el));

// -------------------- Animate skill bars --------------------
function fillSkillBar(skillEl) {
  const level = Number(skillEl.getAttribute("data-level") || "0");
  const fillEl = skillEl.querySelector(".bar__fill");
  const valueEl = skillEl.querySelector(".skill__value");

  const bounded = Math.max(0, Math.min(100, level));
  
  // Animate the counter
  let currentValue = 0;
  const increment = bounded / 60; // 60 frames for smooth animation
  const timer = setInterval(() => {
    currentValue += increment;
    if (currentValue >= bounded) {
      currentValue = bounded;
      clearInterval(timer);
    }
    if (valueEl) valueEl.textContent = `${Math.round(currentValue)}%`;
  }, 20);
  
  // Animate the bar fill
  if (fillEl) {
    fillEl.style.width = `${bounded}%`;
  }
}

const skillsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      fillSkillBar(entry.target);
      // Fill once (clean and simple)
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.35 }
);

skillEls.forEach((el) => skillsObserver.observe(el));

// -------------------- Contact form validation + EmailJS submit --------------------
// EmailJS setup:
// 1) Create an EmailJS account
// 2) Add an Email Service (ex: Gmail)
// 3) Create an Email Template and set "To Email" to: utarshrazzz@gmail.com
// 4) Paste your Public Key, Service ID, and Template ID below
const EMAILJS_PUBLIC_KEY = "sPp9h4BVMPVYGg2cI";
const EMAILJS_SERVICE_ID = "service_p67boxd";
const EMAILJS_TEMPLATE_ID = "template_zibe104";

function initEmailJS() {
  // EmailJS SDK is loaded in index.html
  if (!window.emailjs) return false;
  if (
    !EMAILJS_PUBLIC_KEY ||
    EMAILJS_PUBLIC_KEY.includes("YOUR_") ||
    !EMAILJS_SERVICE_ID ||
    EMAILJS_SERVICE_ID.includes("YOUR_") ||
    !EMAILJS_TEMPLATE_ID ||
    EMAILJS_TEMPLATE_ID.includes("YOUR_")
  ) {
    return false;
  }

  window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  return true;
}

const emailJsReady = initEmailJS();

function isValidEmail(email) {
  // Simple, beginner-friendly email check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (contactForm.name?.value || "").trim();
    const email = (contactForm.email?.value || "").trim();
    const message = (contactForm.message?.value || "").trim();

    // Clear old errors
    setFieldError("name", "");
    setFieldError("email", "");
    setFieldError("message", "");
    setStatus("", null);

    let hasError = false;

    if (!name) {
      setFieldError("name", "Please enter your name.");
      hasError = true;
    }
    if (!email) {
      setFieldError("email", "Please enter your email.");
      hasError = true;
    } else if (!isValidEmail(email)) {
      setFieldError("email", "Please enter a valid email address.");
      hasError = true;
    }
    if (!message) {
      setFieldError("message", "Please enter a message.");
      hasError = true;
    } else if (message.length < 10) {
      setFieldError("message", "Message should be at least 10 characters.");
      hasError = true;
    }

    if (hasError) {
      setStatus("Please fix the highlighted fields and try again.", "bad");
      return;
    }

    // Send using EmailJS, like the original behavior.
    if (!emailJsReady) {
      setStatus(
        "EmailJS is not configured yet. Add your keys in script.js (EMAILJS_*).",
        "bad"
      );
      return;
    }

    setStatus("Sending your message...", null);

    const time = new Date().toLocaleString();

    window.emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: name,
        reply_to: email,
        message,
        name,
        email,
        time,
        sent_time: time
      })
      .then(() => {
        setStatus("Message sent successfully ✅", "ok");
        contactForm.reset();
      })
      .catch((error) => {
        console.error("EmailJS send failed:", error);
        setStatus("Failed to send message. Try again later.", "bad");
      });
  });
}

