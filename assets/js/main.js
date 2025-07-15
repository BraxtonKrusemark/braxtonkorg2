// Grab elements

//Nav styles on scroll
window.addEventListener("scroll", () => {
    const header = document.getElementById("header");
    if (window.scrollY > 50) {
        header.classList.add("shrink");
    } else {
        header.classList.remove("shrink");
    }
});
// Hamburger menu toggle
const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
    menu.classList.toggle("open");

    // Toggle icon between hamburger and close
    const icon = menuToggle.querySelector("i");
    icon.classList.toggle("ri-menu-line");
    icon.classList.toggle("ri-close-line");
});
// Open/Close search form popup

// -- Close the search form popup on ESC keypress

// Switch theme/add to local storage

// Swiper
