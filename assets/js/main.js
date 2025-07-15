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
// Category Sorting
const filterButtons = document.querySelectorAll('.filter-btn');
const articles = document.querySelectorAll('.featured-article');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;

        // Update active button UI
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Fade out all articles first
        articles.forEach(article => {
            article.classList.remove('fade-in');
            article.classList.add('fade-out');
        });

        // After fade-out, apply filtering and staggered fade-in
        setTimeout(() => {
            let visibleIndex = 0;

            articles.forEach(article => {
                const matches = category === 'all' || article.dataset.category === category;

                article.classList.remove('fade-out');

                if (matches) {
                    article.style.display = 'block';

                    // Apply staggered delay
                    article.style.animationDelay = `${visibleIndex * 0.3}s`;
                    article.classList.add('fade-in');
                    visibleIndex++;
                } else {
                    article.style.display = 'none';
                }
            });
        }, 300); // Match fadeOut duration
    });
});
// -- Close the search form popup on ESC keypress

// Switch theme/add to local storage

// Swiper
