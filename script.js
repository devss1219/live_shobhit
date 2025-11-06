// === SUPABASE CONNECTION ===
// 1. FILL IN YOUR KEYS
const SUPABASE_URL = "https://bpsksfcjdtnxmjlpbvhy.supabase.co"; // <-- LIKE THIS

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwc2tzZmNqZHRueG1qbHBidmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzkxNzEsImV4cCI6MjA3Nzg1NTE3MX0.GrtGS8Ys81agyndp7arwH51jl2yioYvlxsvMkz02DQ4";
// This creates the connection
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// === MAIN ENTRY ===
document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  loadProjects();
  setupTypewriter();
  setupScrollSpy();

  // --- NEW Testimonial functions ---
  loadTestimonials(); // Load reviews from Supabase
  setupReviewForm(); // Set up the review form
  
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
        <div class="service-icon"><i class="bx ${escapeHtml(
          project.icon
        )}"></i></div>
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

// === TESTIMONIALS SYSTEM (NEW SUPABASE VERSION) ===

// Get elements (global for testimonial functions)
const testimonialList = document.getElementById("testimonialList");
const reviewForm = document.getElementById("reviewForm");
const reviewMsg = document.getElementById("reviewMsg");

// --- stars helper (from your old code) ---
function generateStarsHtml(n) {
  const c = Math.max(0, Math.min(5, Number(n) || 0));
  return "★".repeat(c) + "☆".repeat(5 - c);
}

// --- 1. Load reviews from Supabase ---
async function loadTestimonials() {
  if (!testimonialList) return;

  // Get all reviews from the 'testimonials' table
  const { data, error } = await sb.from("testimonials").select("*");

  if (error) {
    console.error("Error loading testimonials:", error);
    testimonialList.innerHTML = "<p>Error loading reviews.</p>";
    return;
  }

  testimonialList.innerHTML = ""; // Clear the list

  // Loop through the data and build the HTML (using your old structure)
  data.forEach((review) => {
    const box = document.createElement("div");
    box.classList.add("testimonial-box", "dynamic");
    const initial = escapeHtml(review.name).charAt(0).toUpperCase();

    box.innerHTML = `
      <div class="testimonial-content">
        <div class="testimonial-img">
          <div class="avatar">${initial}</div>
        </div>
        <div class="testimonial-text">
          <i class="bx bxs-quote-alt-left quote-icon"></i>
          <p>${escapeHtml(review.message)}</p>
          <i class="bx bxs-quote-alt-right quote-icon"></i>
        </div>
      </div>
      <div class="testimonial-info">
        <h4>${escapeHtml(review.name)}</h4>
        <p>${escapeHtml(review.occupation)}</p>
        <div class="testimonial-stars">${generateStarsHtml(review.rating)}</div>
       
    `;
    testimonialList.appendChild(box);
  });
}

// --- 2. Set up the review form to submit to Supabase ---
function setupReviewForm() {
  if (!reviewForm) return;

  let selectedRating = 0;
  const stars = reviewForm.querySelectorAll(".rating-stars .star");

  // Your star rating logic (untouched)
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

  // Your form submission logic (updated for Supabase)
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("reviewerName").value.trim();
    const email = document.getElementById("reviewerEmail").value.trim();
    const role = document.getElementById("reviewerRole").value.trim();
    const message = document.getElementById("reviewMessage").value.trim();

    if (!name || !email || !role || !message || selectedRating === 0) {
      alert("⚠️ Please fill all fields and give a rating!");
      return;
    }

    reviewMsg.textContent = "Submitting...";

    // Insert new review into Supabase
    const { data, error } = await sb
      .from("testimonials")
      .insert([
        {
          name: name,
          occupation: role,
          message: message,
          rating: selectedRating,
        },
      ]);

    if (error) {
      console.error("Error submitting review:", error);
      reviewMsg.textContent = "Error. Please try again.";
    } else {
      reviewMsg.textContent = "Thank you for your review!";
      reviewForm.reset();
      selectedRating = 0;
      if (stars && stars.length)
        stars.forEach((s) => s.classList.remove("active"));
      loadTestimonials(); // Refresh the list with the new review
    }
  });
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

