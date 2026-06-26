// ─────────────────────────────────────────────────────────────
// Centralized Navigation
// Edit the site nav in ONE place (NAV_LINKS below). It's injected
// into every page's <nav id="navbar"></nav> on load, with the right
// relative path prefix (resolved from this script's own src, so it works
// on a server, a subpath, or locally over file://), and the active link
// set automatically from the current URL.
// ─────────────────────────────────────────────────────────────

// The nav, in order. `match` lists page filenames (and folder names)
// that should light up this link as "active".
const NAV_LINKS = [
    { label: 'About Me',   href: 'pages/about.html',      match: ['about.html'] },
    { label: 'Presets',    href: 'pages/presets.html',    match: ['presets.html', 'presets/'] },
    { label: 'Characters', href: 'pages/characters.html', match: ['characters.html', 'worlds/'] },
    { label: 'Utilities',  href: 'pages/utilities.html',  match: ['utilities.html'] },
    { label: 'Aesthetics', href: 'pages/aesthetics.html', match: ['aesthetics.html'] },
    { label: 'Resources',  href: 'pages/resources.html',  match: ['resources.html', 'guides/'] },
];

const BRAND_HREF = 'index.html';

// Resolve the relative path prefix back to the project root.
// We anchor off this script's own <script src="…/js/main.js"> tag rather
// than counting URL directories, because on file:// there's no "site root"
// to count from — the path is the whole filesystem. The script's src is
// relative to the page, so it gives the correct prefix everywhere:
// server, subpath, or local file:// — no matter how deep the folder is.
function getRootPrefix() {
    const script =
        document.currentScript ||
        document.querySelector('script[src$="js/main.js"]');
    if (script) {
        const src = script.getAttribute('src') || '';
        // Strip the trailing "js/main.js" to leave just the "../" prefix.
        return src.replace(/js\/main\.js$/, '');
    }
    return ''; // Fallback: assume root.
}

function buildNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    // Pages can opt out of injection (e.g. 404.html, which may be served
    // from any URL depth) by marking their nav with data-nav-static.
    if (navbar.hasAttribute('data-nav-static')) return;

    const prefix = getRootPrefix();
    const path = window.location.pathname;

    // What's the current page, for active-state matching?
    const current = (path.split('/').pop() || 'index.html').toLowerCase();
    const inFolder = (name) => path.toLowerCase().includes('/' + name);

    const linksHtml = NAV_LINKS.map(({ label, href, match }) => {
        const isActive = match.some((m) =>
            m.endsWith('/') ? inFolder(m) : m === current
        );
        const cls = isActive ? ' class="active"' : '';
        return `<a href="${prefix}${href}"${cls}>${label}</a>`;
    }).join('\n            ');

    navbar.innerHTML = `
        <a href="${prefix}${BRAND_HREF}" class="nav-brand">MOKI.</a>
        <div class="nav-links">
            ${linksHtml}
        </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    // 0. Inject the shared navbar (must run before nav-autohide below)
    buildNavbar();

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



// ─────────────────────────────────────────────────────────────
// Shared Song Player (world character cards)
// Markup contract:
//   .song-player[data-src][data-title]
//     button.song-player-play              (play/pause toggle)
//     .song-player-more
//       button.song-player-kebab           (opens menu)
//       .song-player-menu
//         a.song-download[data-filename]    (forces a real download)
// One <audio> element is shared, so only one track plays at a time.
// Uses event delegation, so it needs no per-page wiring and works for
// any cards added later.
// ─────────────────────────────────────────────────────────────
(function () {
    let audio = null;
    let currentPlayer = null;

    function ensureAudio() {
        if (audio) return audio;
        audio = new Audio();
        audio.addEventListener('ended', () => {
            if (currentPlayer) currentPlayer.classList.remove('is-playing');
        });
        audio.addEventListener('pause', () => {
            if (currentPlayer && audio.paused) {
                currentPlayer.classList.remove('is-playing');
            }
        });
        return audio;
    }

    function togglePlay(player) {
        const src = player.dataset.src;
        if (!src) return;
        ensureAudio();

        const isSame = currentPlayer === player;
        if (isSame && !audio.paused) {
            audio.pause();
            player.classList.remove('is-playing');
            return;
        }

        if (currentPlayer && currentPlayer !== player) {
            currentPlayer.classList.remove('is-playing');
        }
        if (!isSame) audio.src = src;
        currentPlayer = player;
        audio.play()
            .then(() => player.classList.add('is-playing'))
            .catch(() => player.classList.remove('is-playing'));
    }

    function toggleMenu(more) {
        const wasOpen = more.classList.contains('open');
        document.querySelectorAll('.song-player-more.open')
            .forEach(m => m.classList.remove('open'));
        if (!wasOpen) more.classList.add('open');
    }

    // catbox (and most file hosts) are cross-origin, so <a download> is
    // ignored and the browser just opens the file. Fetching as a blob lets
    // us save it with the intended filename; falls back to opening on error.
    async function downloadSong(link) {
        const url = link.href;
        const filename = link.dataset.filename || 'song.mp3';
        const original = link.textContent;
        link.textContent = 'Downloading…';
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('fetch failed');
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            window.open(url, '_blank', 'noopener');
        } finally {
            link.textContent = original;
            const more = link.closest('.song-player-more');
            if (more) more.classList.remove('open');
        }
    }

    document.addEventListener('click', (e) => {
        const playBtn = e.target.closest('.song-player-play');
        if (playBtn) {
            e.stopPropagation();
            togglePlay(playBtn.closest('.song-player'));
            return;
        }

        const kebab = e.target.closest('.song-player-kebab');
        if (kebab) {
            e.stopPropagation();
            toggleMenu(kebab.closest('.song-player-more'));
            return;
        }

        const dl = e.target.closest('.song-download');
        if (dl) {
            e.preventDefault();
            e.stopPropagation();
            downloadSong(dl);
            return;
        }

        // outside click closes any open menu
        if (!e.target.closest('.song-player-more')) {
            document.querySelectorAll('.song-player-more.open')
                .forEach(m => m.classList.remove('open'));
        }
    });
})();
