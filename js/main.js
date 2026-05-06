document.addEventListener('DOMContentLoaded', () => {
    // 1. Sleek Load Effect
    const loader = document.getElementById('loader');
    const loaderLine = document.querySelector('.loader-line');

    if (loader && loaderLine) {
        // Animate the line width instantly on load
        setTimeout(() => {
            loaderLine.style.width = '100vw';
        }, 50);

        // Fade out the overlay cleanly
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 1000);
    }

    // 2. Unobtrusive Navigation Menu
    let lastScrollY = window.scrollY;
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        // If scrolling down, hide the nav. If scrolling up, show it.
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
            navbar.classList.add('nav-hidden');
        } else {
            navbar.classList.remove('nav-hidden');
        }
        lastScrollY = window.scrollY;
    }, { passive: true });
});