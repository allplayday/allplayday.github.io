const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
const currentSubnavLink = document.querySelector('.event-subnav-link.is-current');
const eventSubnavSelect = document.querySelector('[data-event-subnav-select]');

if (currentSubnavLink) {
  const subnav = currentSubnavLink.parentElement;
  subnav.scrollLeft = currentSubnavLink.offsetLeft - (subnav.clientWidth - currentSubnavLink.offsetWidth) / 2;
}

if (eventSubnavSelect) {
  eventSubnavSelect.addEventListener('change', (event) => {
    if (event.target.value) window.location.assign(event.target.value);
  });
}

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

const updatesModal = document.querySelector('[data-updates-modal]');
const showcaseLightbox = document.querySelector('[data-showcase-lightbox]');
if (showcaseLightbox && typeof showcaseLightbox.showModal === 'function') {
  const largeImage = showcaseLightbox.querySelector('[data-showcase-large-image]');
  const imageTitle = showcaseLightbox.querySelector('[data-showcase-image-title]');
  const gameDescription = showcaseLightbox.querySelector('[data-showcase-description]');
  const gameDesigners = showcaseLightbox.querySelector('[data-showcase-designers]');
  const steamLink = showcaseLightbox.querySelector('[data-showcase-steam]');
  let lastImageTrigger;

  document.querySelectorAll('[data-showcase-image]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      lastImageTrigger = trigger.classList.contains('video-game-hover-image')
        ? trigger.closest('.showcase-image').querySelector('.video-game-image-link')
        : trigger;
      const imageUrl = trigger.dataset.imageUrl;
      largeImage.hidden = !imageUrl;
      showcaseLightbox.classList.toggle('showcase-lightbox-no-image', !imageUrl);
      if (imageUrl) largeImage.src = imageUrl;
      else largeImage.removeAttribute('src');
      largeImage.alt = trigger.dataset.gameName;
      imageTitle.textContent = trigger.dataset.gameName;
      gameDescription.textContent = trigger.dataset.gameDescription;
      gameDesigners.textContent = trigger.dataset.gameCredits || `Designed by ${trigger.dataset.gameDesigners}`;
      if (steamLink) {
        steamLink.hidden = !trigger.dataset.steamUrl;
        if (trigger.dataset.steamUrl) steamLink.href = trigger.dataset.steamUrl;
        else steamLink.removeAttribute('href');
      }
      showcaseLightbox.showModal();
    });
  });
  showcaseLightbox.querySelector('[data-close-showcase-image]').addEventListener('click', () => showcaseLightbox.close());
  showcaseLightbox.addEventListener('click', (event) => {
    if (event.target === showcaseLightbox) {
      const bounds = showcaseLightbox.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) showcaseLightbox.close();
    }
  });
  showcaseLightbox.addEventListener('close', () => lastImageTrigger?.focus());
}

if (updatesModal) {
  const updatesFrame = updatesModal.querySelector('[data-src]');
  const closeUpdatesButton = updatesModal.querySelector('[data-close-updates]');
  let lastUpdatesTrigger;

  const openUpdatesModal = (trigger) => {
    lastUpdatesTrigger = trigger;
    if (!updatesFrame.hasAttribute('src')) updatesFrame.src = updatesFrame.dataset.src;
    updatesModal.showModal();
  };

  document.querySelectorAll('[data-open-updates]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openUpdatesModal(trigger);
    });
  });

  closeUpdatesButton.addEventListener('click', () => updatesModal.close());
  updatesModal.addEventListener('click', (event) => {
    if (event.target === updatesModal) updatesModal.close();
  });
  updatesModal.addEventListener('close', () => lastUpdatesTrigger?.focus());
}

const showContactError = (status, technicalMessage) => {
  const emailLink = document.createElement('a');
  const details = document.createElement('span');

  emailLink.href = 'mailto:contact@allplay.day';
  emailLink.textContent = 'contact@allplay.day';
  details.className = 'contact-error-detail';
  details.textContent = `Technical details: ${technicalMessage}`;

  status.replaceChildren(
    'Your message could not be sent. Please try again, or email ',
    emailLink,
    '.',
    details
  );
  status.classList.add('is-error');
};

const web3ContactForm = document.querySelector('[data-web3forms-form]');
if (web3ContactForm) {
  const status = web3ContactForm.querySelector('[data-form-status]');
  const submitButton = web3ContactForm.querySelector('button[type="submit"]');
  const buttonLabel = submitButton.querySelector('strong');

  web3ContactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (web3ContactForm.querySelector('[name="botcheck"]').checked) return;

    const captchaResponse = web3ContactForm.querySelector('[name="h-captcha-response"]');
    if (!captchaResponse?.value) {
      status.textContent = 'Please complete the hCaptcha check before sending your message.';
      status.classList.add('is-error');
      return;
    }

    submitButton.disabled = true;
    buttonLabel.textContent = 'Sending…';
    status.textContent = '';
    status.classList.remove('is-error');

    try {
      const formData = new FormData(web3ContactForm);
      const mobile = web3ContactForm.querySelector('[data-mobile-field]').value.trim();

      if (mobile) {
        const message = formData.get('message');
        formData.set('message', `${message}\n\nMobile: ${mobile}`);
      }

      const response = await fetch(web3ContactForm.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formData))
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        const message = result.message || result.body?.message || result.error || 'Unknown Web3Forms error.';
        throw new Error(`HTTP ${response.status}: ${message}`);
      }

      web3ContactForm.reset();
      window.hcaptcha?.reset();
      status.textContent = 'Thanks — your message has been sent.';
    } catch (error) {
      showContactError(status, error.message || 'Web3Forms request failed.');
    } finally {
      submitButton.disabled = false;
      buttonLabel.textContent = 'Send message';
    }
  });
}
