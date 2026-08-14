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
if (updatesModal) {
  const updatesFrame = updatesModal.querySelector('[data-src]');
  const closeUpdatesButton = updatesModal.querySelector('[data-close-updates]');
  let lastUpdatesTrigger;

  const openUpdatesModal = (trigger) => {
    lastUpdatesTrigger = trigger;
    if (!updatesFrame.hasAttribute('src')) updatesFrame.src = updatesFrame.dataset.src;
    updatesModal.showModal();
  };

  document.querySelectorAll('[data-open-updates], a[href$="#tickets"]').forEach((trigger) => {
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
