const btnMenu = document.querySelector('.app-header__btn-menu');
const nav = document.querySelector('.app-header__nav');

btnMenu.addEventListener('click', function() {
  const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
  this.setAttribute('aria-expanded', expanded);
  nav.classList.toggle('active');
});

// Fecha o menu ao clicar em um link (opcional, melhora usabilidade)
nav.querySelectorAll('.app-header__link').forEach(link => {
  link.addEventListener('click', () => {
    btnMenu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('active');
  });
});