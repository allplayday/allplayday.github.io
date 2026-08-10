const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const form = document.querySelector('[data-notify-form]');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = form.elements.email;
    if (!email.checkValidity()) { email.reportValidity(); return; }
    form.querySelector('.form-success').hidden = false;
    form.querySelector('.form-row').hidden = true;
    form.querySelector('.form-note').hidden = true;
  });
}
