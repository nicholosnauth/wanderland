// All DOM: start overlay + pointer lock, location banner, toast messages,
// stamina ring, orb counter, clock. Other modules talk to the page only
// through ctx.hud.
const RING_LEN = 150.8;

export function init(ctx) {
  const el = id => document.getElementById(id);
  const orbCount = el('orbCount'), clock = el('clock'), toastEl = el('toast');
  const stamina = el('stamina'), stamRing = el('stamRing');
  const start = el('start'), banner = el('banner');

  let toastTimer = null;
  let bannerShown = false;

  start.addEventListener('click', () => ctx.renderer.domElement.requestPointerLock());
  document.addEventListener('pointerlockchange', () => {
    const locked = !!document.pointerLockElement;
    start.style.display = locked ? 'none' : 'flex';
    if (locked && !bannerShown) {
      bannerShown = true;
      setTimeout(() => banner.style.opacity = 1, 400);
      setTimeout(() => banner.style.opacity = 0, 4600);
    }
  });

  ctx.hud = {
    toast(msg, ms) {
      toastEl.textContent = msg;
      toastEl.style.opacity = 1;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.style.opacity = 0, ms || 2300);
    },
    setStamina(frac, exhausted) {
      stamina.style.opacity = frac < 0.995 ? 1 : 0;
      stamRing.setAttribute('stroke-dashoffset', RING_LEN * (1 - frac));
      stamRing.setAttribute('stroke', exhausted ? '#e05a4a' : '#8fe07a');
    },
    setClock(text) { clock.textContent = text; },
    setOrbs(n, total) { orbCount.innerHTML = `✦ Spirit Lights &nbsp;${n} / ${total}`; },
  };
}
