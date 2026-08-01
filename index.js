document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('business-card');
    const btnFlip = document.getElementById('btn-flip');
    const btnDownload = document.getElementById('btn-download');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Flip Card Handler
    const flipCard = () => {
        card.classList.toggle('flipped');
        // Reset transform when flipping to prevent weird rotation artifacts
        card.style.transform = card.classList.contains('flipped') 
            ? 'rotateY(180deg)' 
            : 'rotateY(0deg)';
    };

    card.addEventListener('click', flipCard);
    btnFlip.addEventListener('click', (e) => {
        e.stopPropagation();
        flipCard();
    });

    // 3D Parallax Tilt Effect
    card.addEventListener('mousemove', (e) => {
        if (card.classList.contains('flipped')) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within card
        const y = e.clientY - rect.top;  // y position within card

        const cardWidth = rect.width;
        const cardHeight = rect.height;

        // Calculate rotation angles based on cursor offset from card center
        const rotateX = -(15 * (y - cardHeight / 2)) / (cardHeight / 2);
        const rotateY = (15 * (x - cardWidth / 2)) / (cardWidth / 2);

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    });

    // Reset rotation on mouse leave
    card.addEventListener('mouseleave', () => {
        if (card.classList.contains('flipped')) {
            card.style.transform = 'rotateY(180deg)';
        } else {
            card.style.transform = 'rotateY(0deg)';
        }
    });

    // Download/Print Layout
    btnDownload.addEventListener('click', () => {
        window.print();
    });

    // Mobile Navigation Toggle
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
            // Quick styles for open mobile menu
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '80px';
            navMenu.style.left = '0';
            navMenu.style.width = '100%';
            navMenu.style.background = 'rgba(255, 255, 255, 0.97)';
            navMenu.style.padding = '2rem';
            navMenu.style.borderBottom = '1px solid rgba(14, 116, 144, 0.2)';
            navMenu.style.gap = '1.5rem';
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
            navMenu.style.display = '';
        }
    });

    // Smooth Scroll Offset for Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active')) {
                mobileToggle.click();
            }
        });
    });

    // Project Slideshows: cycles each .project-slideshow's <img> children
    // via a fading .is-active class (see index.css) — add/remove <img>
    // tags in the markup to change what's shown, no JS changes needed.
    document.querySelectorAll('.project-slideshow').forEach((slideshow) => {
        const slides = slideshow.querySelectorAll('img');
        if (slides.length < 2) return;
        let current = 0;
        setInterval(() => {
            slides[current].classList.remove('is-active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('is-active');
        }, 3500);
    });
});
