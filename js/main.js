// mobile menu
const toggle = document.getElementById('nav-toggle');
const mobileNav = document.getElementById('mobile-nav');

function setMenu(open) {
  mobileNav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.firstElementChild.className = open ? 'fas fa-times' : 'fas fa-bars';
}

toggle.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));
mobileNav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('click', e => {
  if (!mobileNav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
});


// fade sections in as they scroll into view
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    fadeObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));


// highlight the nav link of the section on screen
const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(a => {
      if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('main section[id]').forEach(el => spy.observe(el));


// contact form -> opens the visitor's mail app
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', e => {
  e.preventDefault();
  const subject = form.elements['cf-subject'].value;
  const message = `From: ${form.elements['cf-name'].value} (${form.elements['cf-email'].value})\n\n${form.elements['cf-msg'].value}`;

  location.href = `mailto:mamdouslaskar@protonmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

  status.textContent = '✓ Opening your email client…';
  status.hidden = false;
  form.reset();
  setTimeout(() => { status.hidden = true; }, 4000);
});
