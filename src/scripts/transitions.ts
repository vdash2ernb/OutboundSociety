import { gsap } from 'gsap';
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';

// One punchy line per destination, shown on the orange curtain while the page changes.
const lines: Record<string, { page: string; line: string }> = {
  '': { page: 'Home', line: 'Run the night.' },
  events: { page: 'Events', line: 'See you at the start line.' },
  about: { page: 'About', line: 'No runner left behind.' },
};

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const parts = () => {
  const el = document.querySelector<HTMLElement>('[data-curtain]');
  return el && {
    el,
    bars: el.querySelectorAll('.curtain__bars i'),
    page: el.querySelector<HTMLElement>('[data-curtain-page]')!,
    line: el.querySelector<HTMLElement>('[data-curtain-line]')!,
  };
};

function cover(to: URL) {
  const c = parts();
  if (!c) return Promise.resolve();
  const key = to.pathname.replace(base, '').split('/').filter(Boolean)[0] ?? '';
  const copy = lines[key] ?? { page: 'Outbound Society', line: 'Keep moving.' };
  c.page.textContent = copy.page;
  c.line.textContent = copy.line;
  c.el.classList.add('is-active');
  document.documentElement.classList.add('curtain-on');

  return new Promise<void>((resolve) => {
    gsap
      .timeline({ onComplete: resolve })
      .set(c.bars, { transformOrigin: 'left' })
      // Stripes glitch in at random, like a broken signal
      .to(c.bars, { scaleX: 1, duration: 0.42, ease: 'power3.in', stagger: { each: 0.03, from: 'random' } })
      .fromTo(c.line, { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, duration: 0.45, ease: 'expo.out' }, '-=0.05')
      .fromTo(c.page, { opacity: 0 }, { opacity: 0.7, duration: 0.3 }, '<')
      .to({}, { duration: 0.35 }); // hold the line for a beat
  });
}

function reveal() {
  const c = parts();
  if (!c || !c.el.classList.contains('is-active')) return;
  gsap
    .timeline({
      onComplete: () => c.el.classList.remove('is-active'),
    })
    .to([c.line, c.page], { opacity: 0, yPercent: -30, duration: 0.25, ease: 'power2.in' })
    .add(() => {
      // Let the new page start its own entrance as the stripes clear
      document.documentElement.classList.remove('curtain-on');
      document.dispatchEvent(new Event('os:curtain-open'));
    })
    .set(c.bars, { transformOrigin: 'right' })
    .to(c.bars, { scaleX: 0, duration: 0.5, ease: 'power3.out', stagger: { each: 0.03, from: 'random' } });
}

document.addEventListener('astro:before-preparation', (e) => {
  const ev = e as TransitionBeforePreparationEvent;
  if (reduced() || ev.from.pathname === ev.to.pathname) return;
  const load = ev.loader;
  // Fetch the next page while the curtain closes; swap only once it's fully covered
  ev.loader = async () => {
    await Promise.all([load(), cover(ev.to)]);
  };
});

document.addEventListener('astro:page-load', reveal);
