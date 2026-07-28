document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!mobileToggle || !navMenu) return;

    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '80px';
            navMenu.style.left = '0';
            navMenu.style.width = '100%';
            navMenu.style.background = 'rgba(8, 12, 20, 0.95)';
            navMenu.style.padding = '2rem';
            navMenu.style.borderBottom = '1px solid rgba(0, 229, 255, 0.2)';
            navMenu.style.gap = '1.5rem';
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
            navMenu.style.display = '';
        }
    });
});
