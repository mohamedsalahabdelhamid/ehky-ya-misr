/**
 * ==============================================================================
 * EHKY YA MISR - JOURNEY AUDIO & INTRO EXPERIENCE
 * Welcome music during the opening intro, then a looping ambient track.
 * Adapted from the reference demo with our i18n (5 languages) and storage keys.
 * ==============================================================================
 */
(() => {
  'use strict';

  const button = document.getElementById('journeyAudio');
  const content = document.getElementById('app');
  const intro = document.getElementById('journeyIntro');
  const start = document.getElementById('startJourneyIntro');
  const skip = document.getElementById('skipJourneyIntro');
  const volume = document.getElementById('journeyVolume');
  const root = document.documentElement;
  const audio = new Audio();
  const music = 'assets/audio/opening-an-old-book.mp3';
  const welcome = 'assets/audio/welcome.mp3';

  // Exit quietly on pages without the audio controls (defensive).
  if (!button || !volume || !content) return;

  const label = key => (window.I18N && typeof window.I18N.t === 'function' ? window.I18N.t(key) : key);

  function read(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch {}
  }

  let enabled = read('ehky-audio') !== 'off';
  let videoOpen = false;
  let blocked = false;
  let opening = root.classList.contains('journey-opening');
  let playAttempt = 0;

  const savedVolume = read('ehky-volume');
  if (savedVolume !== null) volume.value = savedVolume;
  audio.volume = Number(volume.value) / 100;
  audio.preload = 'none';

  function selectMusic() {
    if (audio.loop) return;
    audio.src = music;
    audio.loop = true;
  }

  if (opening) audio.src = welcome;
  else selectMusic();

  function updateLabel() {
    button.textContent = label(blocked ? 'journeyAudioStart' :
      enabled ? 'journeyAudioStop' : 'journeyAudioStartMusic');
    const group = button.closest('.journey-audio');
    if (group) group.setAttribute('aria-label', label('journeyAudioControls'));
    const summary = document.querySelector('.journey-volume summary');
    if (summary) {
      summary.setAttribute('aria-label', label('journeyVolumeLabel'));
      summary.title = label('journeyVolumeLabel');
    }
  }

  function syncPlayback() {
    const attempt = ++playAttempt;
    if (!enabled || videoOpen) {
      audio.pause();
      return;
    }
    audio.play().then(() => {
      if (attempt !== playAttempt) return;
      blocked = false;
      if (opening) {
        root.classList.add('journey-playing');
        start.hidden = true;
        if (document.activeElement === start) skip.focus();
      }
      updateLabel();
    }).catch(() => {
      if (attempt !== playAttempt) return;
      blocked = true;
      if (opening) start.hidden = false;
      updateLabel();
    });
  }

  function finishIntro() {
    if (!opening) return;
    opening = false;
    root.classList.remove('journey-opening', 'journey-reveal', 'journey-playing');
    const restoreFocus = intro.contains(document.activeElement);
    intro.hidden = true;
    if (restoreFocus) button.focus();
    selectMusic();
    syncPlayback();
  }

  if (opening) {
    const sparks = document.getElementById('journeySparks');
    for (let index = 0; index < 104; index++) {
      const spark = document.createElement('i');
      spark.style.setProperty('--x', `${Math.random() * 100}%`);
      spark.style.setProperty('--y', `${Math.random() * 100}%`);
      spark.style.setProperty('--size', `${2 + Math.random() * 6}px`);
      spark.style.setProperty('--delay', `${Math.random() * 1.1}s`);
      spark.style.setProperty('--spin', `${Math.random() * 360}deg`);
      sparks.append(spark);
    }
    intro.hidden = false;
    start.addEventListener('click', () => {
      enabled = true;
      save('ehky-audio', 'on');
      syncPlayback();
    });
    skip.addEventListener('click', () => {
      finishIntro();
      button.focus();
    });
    intro.addEventListener('keydown', event => {
      if (event.key === 'Escape') skip.click();
    });
  } else {
    root.classList.remove('journey-opening');
  }

  button.addEventListener('click', () => {
    enabled = blocked || !enabled;
    blocked = false;
    save('ehky-audio', enabled ? 'on' : 'off');
    updateLabel();
    syncPlayback();
  });

  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value) / 100;
    save('ehky-volume', volume.value);
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-replay-welcome]')) {
      enabled = true;
      save('ehky-audio', 'on');
      audio.loop = false;
      audio.src = welcome;
      syncPlayback();
      return;
    }
    // Retry unlocking playback after the browser blocked autoplay.
    if (!blocked || !enabled || opening ||
        event.target.closest('#journeyAudio, .journey-volume, [data-heritage-video]')) return;
    syncPlayback();
  });

  // Reveal the site behind the intro once the welcome message is underway.
  audio.addEventListener('timeupdate', () => {
    if (opening && audio.currentTime >= 1.8) root.classList.add('journey-reveal');
  });

  audio.addEventListener('ended', () => {
    if (opening) finishIntro();
    else if (!audio.loop) {
      // A replayed welcome finished - go back to the ambient loop.
      selectMusic();
      syncPlayback();
    }
  });

  // Pause the ambient track whenever a video player takes over the screen
  // (heritage record videos inside #app, or our global video lightbox on body).
  const hasVideoOpen = () =>
    Boolean(content.querySelector('.heritage-video-player')) ||
    Boolean(document.getElementById('ehkyVideoLightbox'));
  new MutationObserver(() => {
    const hasVideo = hasVideoOpen();
    if (hasVideo === videoOpen) return;
    videoOpen = hasVideo;
    syncPlayback();
  }).observe(document.body, { childList: true, subtree: true });

  window.addEventListener('ehkyLanguageChanged', updateLabel);
  updateLabel();
  syncPlayback();
})();
