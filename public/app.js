(() => {
  'use strict';
  const config = window.SITE_CONFIG;
  const target = Date.parse(config.launchAt);
  const timer = document.querySelector('.countdown');
  const note = document.querySelector('#launch-note');
  const units = Object.fromEntries([...document.querySelectorAll('[data-unit]')].map(el => [el.dataset.unit, el]));
  let interval;
  function updateCountdown() {
    if (!Number.isFinite(target)) {
      note.textContent = 'SOMETHING NEW IS ON THE WAY';
      timer.setAttribute('aria-label', 'Launch date to be announced');
      clearInterval(interval);
      return;
    }
    const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
    const values = { days: Math.floor(remaining / 86400), hours: Math.floor(remaining % 86400 / 3600), minutes: Math.floor(remaining % 3600 / 60), seconds: remaining % 60 };
    for (const [key, value] of Object.entries(values)) {
      const text = String(value).padStart(2, '0');
      if (units[key].textContent !== text) units[key].textContent = text;
    }
    timer.setAttribute('aria-label', `${values.days} days, ${values.hours} hours, ${values.minutes} minutes, ${values.seconds} seconds until launch`);
    if (remaining === 0) {
      note.textContent = 'THE WAIT IS ALMOST OVER. STAY CLOSE.';
      timer.setAttribute('aria-label', 'Countdown complete. Website coming soon.');
      clearInterval(interval);
    }
  }
  updateCountdown();
  if (Number.isFinite(target) && target > Date.now()) interval = setInterval(updateCountdown, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCountdown(); });

  const video = document.querySelector('video');
  video.play().catch(() => {});

  const themeButton = document.querySelector('.theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  let savedTheme;
  try { savedTheme = localStorage.getItem('theme'); } catch {}
  let theme = savedTheme === 'dark' || savedTheme === 'light'
    ? savedTheme
    : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  function setTheme(value) {
    theme = value;
    document.documentElement.dataset.theme = theme;
    const dark = theme === 'dark';
    themeButton.setAttribute('aria-pressed', String(dark));
    const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
    themeColor.content = dark ? '#000000' : '#FFFFFF';
  }
  setTheme(theme);
  themeButton.addEventListener('click', () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try { localStorage.setItem('theme', nextTheme); } catch {}
  });
  video.addEventListener('error', () => {
    video.style.display = 'none';
    document.querySelector('.blockchain-still').style.display = 'block';
  });

  const discordButton = document.querySelector('#discord-button');
  const card = document.querySelector('#discord-card');
  const copyButton = document.querySelector('#copy-discord');
  document.querySelector('.discord-name').textContent = config.discordUsername;
  function setCard(open) {
    card.hidden = !open;
    discordButton.setAttribute('aria-expanded', String(open));
    if (open) copyButton.focus();
  }
  discordButton.addEventListener('click', () => setCard(card.hidden));
  document.addEventListener('click', e => {
    if (!card.hidden && !card.contains(e.target) && !discordButton.contains(e.target)) setCard(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !card.hidden) { setCard(false); discordButton.focus(); }
  });
  let toastTimeout;
  function toast(message) {
    const element = document.querySelector('.toast');
    element.textContent = message;
    element.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => element.classList.remove('visible'), 3000);
  }
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(config.discordUsername);
      copyButton.textContent = 'Copied!';
      toast('Discord username copied');
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 2500);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector('.discord-name'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      toast('Select and copy: ' + config.discordUsername);
    }
  });
})();
