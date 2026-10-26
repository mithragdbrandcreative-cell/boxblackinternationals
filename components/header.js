// ==========================================
// MOBILE MENU
// ==========================================

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    mainNav.classList.toggle('is-open', !isOpen);
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      mainNav.classList.remove('is-open');
    });
  });
}


// ==========================================
// VIDEO
// ==========================================

document.querySelectorAll('.video-embed').forEach((videoEmbed) => {
  const videoThumbnail = videoEmbed.querySelector('.video-thumbnail-button');
  const video = videoEmbed.querySelector('video');

  if (videoThumbnail && video) {
    const thumbnailImage = videoThumbnail.querySelector('img');

    // Use a frame from the local video as its thumbnail.
    video.addEventListener('loadedmetadata', () => {
      if (video.duration > 0) video.currentTime = Math.min(1, video.duration / 2);
    }, { once: true });

    video.addEventListener('seeked', () => {
      if (!thumbnailImage || !video.videoWidth || !video.videoHeight) return;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      thumbnailImage.src = canvas.toDataURL('image/jpeg', 0.82);
    }, { once: true });

    videoThumbnail.addEventListener('click', () => {
      videoEmbed.classList.add('is-playing');
      video.play();
    }, { once: true });
  }
});


// ==========================================
// PROJECT FORM → EMAIL INBOX + CALENDLY
// ==========================================

/*
 * SETUP
 * -----
 * 1. EMAIL: Get a free access key at https://web3forms.com
 *    (enter the inbox that should receive the enquiries) and paste it below.
 *
 * 2. CALENDLY: The event needs 9 Invitee Questions, in this order, as
 *    "One-line text" (use "Multi-line text" for #6):
 *      1 Timeline      2 Investment     3 Plot size
 *      4 Style         5 Floors         6 Home use
 *      7 Location      8 Service        9 Phone number
 *    Date, time and availability are controlled inside Calendly:
 *    Event Types → your event → Availability.
 */

const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_KEY';
const CALENDLY_URL = ' https://calendly.com/socailboxblackinternational/new-meeting'


;

(() => {
  const projectModal = document.querySelector('.project-modal');
  const projectForm = document.querySelector('#project-form');

  if (!projectModal || !projectForm) return;

  const projectError = projectForm.querySelector('.project-form-error');
  const projectContinue = projectForm.querySelector('[data-project-continue]');
  const projectBack = projectForm.querySelector('[data-project-back]');
  const projectSubmit = projectForm.querySelector('[data-project-submit]');
  const openProjectForm = document.querySelectorAll('[data-open-project-form]');
  const closeProjectForm = projectModal.querySelector('.project-modal-close');
  const stepOne = projectForm.querySelector('[data-step="1"]');
  const stepTwo = projectForm.querySelector('[data-step="2"]');
  const progressBars = projectModal.querySelectorAll('.project-progress span');
  const submitLabel = projectSubmit.innerHTML;

  // ------------------------------------
  // STEP SWITCHING
  // ------------------------------------

  function showStep(step) {
    stepOne.hidden = step !== 1;
    stepTwo.hidden = step !== 2;
    progressBars.forEach((bar, index) => bar.classList.toggle('is-active', index < step));
    projectModal.querySelector('.project-modal-card').scrollTop = 0;
  }

  // ------------------------------------
  // OPEN / CLOSE MODAL
  // ------------------------------------

  openProjectForm.forEach((button) => {
    button.addEventListener('click', () => {
      showStep(1);
      projectModal.showModal();
    });
  });

  if (closeProjectForm) {
    closeProjectForm.addEventListener('click', () => projectModal.close());
  }

  projectModal.addEventListener('click', (event) => {
    if (event.target === projectModal) projectModal.close();
  });

  // ------------------------------------
  // STEP 1 → STEP 2
  // ------------------------------------

  projectContinue.addEventListener('click', () => {
    const uses = projectForm.querySelectorAll('input[name="use"]:checked');

    if (!uses.length) {
      projectError.hidden = false;
      return;
    }

    projectError.hidden = true;

    for (const select of stepOne.querySelectorAll('select')) {
      if (!select.checkValidity()) {
        select.reportValidity();
        return;
      }
    }

    showStep(2);
    stepTwo.querySelector('input').focus();
  });

  projectBack.addEventListener('click', () => showStep(1));

  // ------------------------------------
  // SEND ENQUIRY TO EMAIL INBOX
  // ------------------------------------

  async function sendEnquiryEmail(details) {
    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'YOUR_WEB3FORMS_KEY') {
      console.warn('Web3Forms access key is not set. Enquiry email was not sent.');
      return;
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'New Home Enquiry – Black Box Internationals',
          from_name: 'Black Box Internationals Website',
          replyto: details.email,

          // Contact
          Name: details.name,
          Email: details.email,
          Phone: details.phone,

          // Project answers
          'When are you looking to bring your home project to life?': details.timeline,
          'What investment range are you planning for your home?': details.investment,
          'What size is the plot you are planning to build on?': details.plotSize,
          'What kind of architectural character do you imagine?': details.style,
          'How much space are you planning to build?': details.floors,
          'How do you see your home being used?': details.homeUses,
          'Where is your plot located?': details.location,
          'What would you like our team to help you with?': details.service
        })
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Enquiry email failed:', result.message);
      }
    } catch (error) {
      console.error('Enquiry email failed:', error);
    }
  }

  // ------------------------------------
  // OPEN CALENDLY
  // ------------------------------------

  function openCalendly(details) {
    if (typeof Calendly === 'undefined') {
      console.error('Calendly widget has not loaded.');
      return;
    }

    Calendly.initPopupWidget({
      url: CALENDLY_URL,
      prefill: {
        name: details.name,
        email: details.email,
        customAnswers: {
          // Calendly question 1: Phone number
          a1: details.phone,

          // Calendly question 2: Project details (all questions + answers)
          a2: [
            `1. When are you looking to bring your home project to life? ${details.timeline}`,
            `2. What investment range are you planning for your home? ${details.investment}`,
            `3. What size is the plot you're planning to build on? ${details.plotSize}`,
            `4. What kind of architectural character do you imagine for your home? ${details.style}`,
            `5. How much space are you planning to build? ${details.floors}`,
            `6. How do you see your home being used? ${details.homeUses}`,
            `7. Where is your plot located? ${details.location}`,
            `8. What would you like our team to help you with? ${details.service}`
          ].join('\n')
        }
      }
    });
  }

  // ------------------------------------
  // STEP 2 → SUBMIT
  // ------------------------------------

  projectSubmit.addEventListener('click', async () => {
    for (const input of stepTwo.querySelectorAll('input[required]')) {
      if (!input.checkValidity()) {
        input.reportValidity();
        return;
      }
    }

    const data = new FormData(projectForm);

    // Spam trap: real visitors never tick this hidden box
    if (data.get('botcheck')) return;

    const details = {
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      timeline: String(data.get('timeline') || ''),
      investment: String(data.get('investment') || ''),
      plotSize: String(data.get('plotSize') || ''),
      style: String(data.get('style') || ''),
      floors: String(data.get('floors') || ''),
      homeUses: data.getAll('use').join(', '),
      location: String(data.get('location') || ''),
      service: String(data.get('service') || '')
    };

    // Prevent double clicks while the email is sending
    projectSubmit.disabled = true;
    projectSubmit.textContent = 'Sending…';

    // Email is sent first so the lead is saved even if the visitor
    // closes Calendly without choosing a time.
    await sendEnquiryEmail(details);

    projectSubmit.disabled = false;
    projectSubmit.innerHTML = submitLabel;

    projectModal.close();
    projectForm.reset();

    window.setTimeout(() => openCalendly(details), 300);
  });
})();
