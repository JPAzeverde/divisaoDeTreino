document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const headerNav = document.getElementById('header-nav');

    if (menuToggle && headerNav) {
        menuToggle.addEventListener('click', function() {
            headerNav.classList.toggle('active');
            const isOpen = headerNav.classList.contains('active');
            menuToggle.innerHTML = isOpen ? '✕' : '☰';
        });
    }
});