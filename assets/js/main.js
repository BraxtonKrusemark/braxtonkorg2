// Header shrink on scroll
window.addEventListener("scroll", () => {
    const header = document.getElementById("header");
    header.classList.toggle("shrink", window.scrollY > 50);
});

// Hamburger menu toggle
const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
    menu.classList.toggle("open");
    const icon = menuToggle.querySelector("i");
    icon.classList.toggle("ri-menu-line");
    icon.classList.toggle("ri-close-line");
});

// Category filter for featured articles
const filterButtons = document.querySelectorAll('.filter-btn');
const articles = document.querySelectorAll('.featured-article');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;

        // Highlight active filter
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Fade out all first
        articles.forEach(article => {
            article.classList.remove('fade-in');
            article.classList.add('fade-out');
        });

        // Apply filter after fade-out delay
        setTimeout(() => {
            let index = 0;
            articles.forEach(article => {
                const match = category === 'all' || article.dataset.category === category;
                article.classList.remove('fade-out');
                if (match) {
                    article.style.display = 'block';
                    article.style.animationDelay = `${index * 0.3}s`;
                    article.classList.add('fade-in');
                    index++;
                } else {
                    article.style.display = 'none';
                }
            });
        }, 300);
    });
});
