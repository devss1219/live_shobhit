// === MAIN ENTRY ===
document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  loadProjects();
  setupTestimonials();
  setupTypewriter();
  setupScrollSpy(); // <-- NEW: Call the scrollspy function
});

// === NAVBAR / HAMBURGER ===
function setupMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".navbar a");

  if (!menuToggle || !navbar) return;

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navbar.classList.toggle("active");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      navbar.classList.remove("active");
    });
  });
}

// === LOAD PROJECTS FROM JSON ===
async function loadProjects() {
  const container = document.querySelector(".services-container");
  if (!container) return;

  try {
    const response = await fetch("projects.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const projects = await response.json();

    container.innerHTML = "";

    projects.forEach((project) => {
      const box = document.createElement("div");
      box.className = "service-box";
      box.innerHTML = `
        <div class="service-icon"><i class="bx ${escapeHtml(project.icon)}"></i></div>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <a href="${escapeHtml(project.link)}" class="btn">Read More</a>
      `;
      container.appendChild(box);
    });
  } catch (err) {
    console.error("Error loading projects:", err);
    container.innerHTML = `<p style="color:red;text-align:center;">Failed to load projects.</p>`;
  }
}

// === TESTIMONIALS SYSTEM ===
function setupTestimonials() {
  const form = document.getElementById("reviewForm");
  const testimonialList =
    document.getElementById("testimonialList") ||
    document.querySelector(".testimonials");

  if (!testimonialList) return;

  let reviews = JSON.parse(localStorage.getItem("reviews") || "[]");
  let selectedRating = 0;

  // --- render reviews ---
  function renderReviews() {
    testimonialList
      .querySelectorAll(".testimonial-box.dynamic")
      .forEach((e) => e.remove());

    reviews.forEach((r, index) => {
      const box = document.createElement("div");
      box.classList.add("testimonial-box", "dynamic");
      box.innerHTML = `
        <div class="testimonial-content">
          <div class="testimonial-img">
            <div class="avatar">${escapeHtml(r.initial)}</div>
          </div>
          <div class="testimonial-text">
            <i class="bx bxs-quote-alt-left quote-icon"></i>
            <p>${escapeHtml(r.message)}</p>
            <i class="bx bxs-quote-alt-right quote-icon"></i>
          </div>
        </div>
        <div class="testimonial-info">
          <h4>${escapeHtml(r.name)}</h4>
          <p>${escapeHtml(r.role)}</p>
          <div class="testimonial-stars">${generateStarsHtml(r.rating)}</div>
          <button class="delete-btn" data-index="${index}">Delete</button>
        </div>
      `;
      testimonialList.appendChild(box);
    });
  }

  // --- stars helper ---
  function generateStarsHtml(n) {
    const c = Math.max(0, Math.min(5, Number(n) || 0));
    return "★".repeat(c) + "☆".repeat(5 - c);
  }

  // --- add new review ---
  if (form) {
    const stars = form.querySelectorAll(".rating-stars .star");

    if (stars && stars.length) {
      stars.forEach((star) => {
        star.addEventListener("click", () => {
          selectedRating = parseInt(star.dataset.value, 10);
          stars.forEach((s, i) =>
            s.classList.toggle("active", i < selectedRating)
          );
        });
      });
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reviewerName").value.trim();
      const email = document.getElementById("reviewerEmail").value.trim();
      const role = document.getElementById("reviewerRole").value.trim();
      const message = document.getElementById("reviewMessage").value.trim();

      if (!name || !email || !role || !message || selectedRating === 0) {
        alert("⚠️ Please fill all fields and give a rating!");
        return;
      }

      const initial = name.charAt(0).toUpperCase();
      const newReview = {
        name,
        email,
        role,
        message,
        rating: selectedRating,
        initial,
      };
      reviews.push(newReview);
      localStorage.setItem("reviews", JSON.stringify(reviews));

      form.reset();
      selectedRating = 0;
      if (stars && stars.length)
        stars.forEach((s) => s.classList.remove("active"));
      renderReviews();
    });
  }

  // --- delete review with password ---
  testimonialList.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;
    const index = parseInt(btn.dataset.index, 10);
    const password = prompt("Enter admin password to delete:");
    if (password === "123777") {
      reviews.splice(index, 1);
      localStorage.setItem("reviews", JSON.stringify(reviews));
      renderReviews();
      alert("✅ Review deleted successfully.");
    } else {
      alert("❌ Incorrect password!");
    }
  });

  // initial render
  renderReviews();
}

// === TYPEWRITER EFFECT ===
function setupTypewriter() {
  const typedTextSpan = document.getElementById("typewriter");
  if (!typedTextSpan) return;

  typedTextSpan.textContent = "";

  const textArray = [
    "Full Stack Developer",
    "Backend Developer",
    "Programmer",
    "MERN Developer",
  ];

  const typingSpeed = 100;
  const erasingSpeed = 60;
  const newTextDelay = 1000;

  let textArrayIndex = 0;
  let charIndex = 0;

  function type() {
    if (charIndex < textArray[textArrayIndex].length) {
      typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
      charIndex++;
      requestAnimationFrame(() => setTimeout(type, typingSpeed));
    } else {
      setTimeout(erase, newTextDelay);
    }
  }

  function erase() {
    if (charIndex > 0) {
      typedTextSpan.textContent = textArray[textArrayIndex].substring(
        0,
        charIndex - 1
      );
      charIndex--;
      requestAnimationFrame(() => setTimeout(erase, erasingSpeed));
    } else {
      textArrayIndex = (textArrayIndex + 1) % textArray.length;
      setTimeout(type, 400);
    }
  }
  setTimeout(type, 1000);
}

// === SCROLLSPY (ACTIVE NAV LINK ON SCROLL) ===
// <-- NEW: This entire function is new
function setupScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar a");
  const header = document.querySelector(".header");

  if (!sections.length || !navLinks.length || !header) return;

  const headerHeight = header.offsetHeight;

  function updateActiveLink() {
    const scrollY = window.scrollY;
    let currentSectionId = "";

    // Find the current section
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - headerHeight - 1; // -1 to be precise
      if (scrollY >= sectionTop) {
        currentSectionId = section.getAttribute("id");
      }
    });

    // Update the nav links
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSectionId}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveLink);
  updateActiveLink(); // Run once on page load
}

// === HELPERS ===
function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}