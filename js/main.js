document.addEventListener('DOMContentLoaded', () => {
    // 1. Sleek Load Effect
    const loader = document.getElementById('loader');
    const loaderLine = document.querySelector('.loader-line');

    if (loader && loaderLine) {
        setTimeout(() => {
            loaderLine.style.width = '100vw';
        }, 50);

        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 1000);
    }

    // 2. Hover-Reveal Navigation (only on pages that opt in with .nav-autohide)
    const navbar = document.getElementById('navbar');
    if (navbar && document.body.classList.contains('nav-autohide')) {
        // Create invisible trigger zone at top of viewport
        const trigger = document.createElement('div');
        trigger.id = 'nav-trigger';
        document.body.prepend(trigger);

        let hideTimeout;

        const showNav = () => {
            clearTimeout(hideTimeout);
            navbar.classList.add('nav-visible');
        };

        const hideNav = () => {
            hideTimeout = setTimeout(() => {
                navbar.classList.remove('nav-visible');
            }, 300);
        };

        trigger.addEventListener('mouseenter', showNav);
        trigger.addEventListener('mouseleave', hideNav);
        navbar.addEventListener('mouseenter', showNav);
        navbar.addEventListener('mouseleave', hideNav);
    }
});