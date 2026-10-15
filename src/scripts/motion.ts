import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
const cleanups: Array<() => void> = [];
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => window.matchMedia('(min-width: 900px)').matches;

function smoothScroll() {
  if (reduced()) return;
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  (window as unknown as { lenis: Lenis }).lenis = lenis;
  const raf = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  cleanups.push(() => gsap.ticker.remove(raf));
}

function navBehaviour() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > last && y > 300 && !document.documentElement.classList.contains('menu-open'));
    last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  cleanups.push(() => window.removeEventListener('scroll', onScroll));

  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!toggle || !menu) return;
  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    open ? lenis?.stop() : lenis?.start();
  };
  const onClick = () => setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
  toggle.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);
  cleanups.push(() => {
    toggle.removeEventListener('click', onClick);
    window.removeEventListener('keydown', onKey);
    document.documentElement.classList.remove('menu-open');
  });
}

function reveals() {
  // Headline lines slide up
  gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
    const lines = el.querySelectorAll('.split-line > span');
    gsap.to(lines, {
      y: 0,
      yPercent: 0,
      duration: 1.15,
      ease: 'expo.out',
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // Media wipes open, image settles from a slight zoom
  gsap.utils.toArray<HTMLElement>('[data-reveal-media]').forEach((el) => {
    const img = el.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%' } });
    tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out' });
    if (img && !img.hasAttribute('data-parallax')) tl.from(img, { scale: 1.25, duration: 1.6, ease: 'expo.out' }, 0);
  });

  // Parallax drift inside media frames
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -8, scale: 1.18 },
      {
        yPercent: 8,
        scale: 1.18,
        ease: 'none',
        scrollTrigger: { trigger: img.closest('.media') ?? img, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });

  // Simple fade-up for copy blocks
  gsap.utils.toArray<HTMLElement>('[data-fade]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      delay: Number(el.dataset.fade || 0),
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // Manifesto: words light up as you scroll through
  gsap.utils.toArray<HTMLElement>('[data-words]').forEach((el) => {
    const words = el.querySelectorAll('.w');
    gsap.to(words, {
      opacity: 1,
      stagger: 0.08,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 45%', scrub: true },
    });
  });

  // Numbers count up
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const raw = el.dataset.count || el.textContent || '';
    const m = raw.match(/[\d.]+/);
    if (!m) return;
    const target = parseFloat(m[0]);
    const decimals = m[0].includes('.') ? m[0].split('.')[1].length : 0;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => (el.textContent = raw.replace(m[0], obj.v.toFixed(decimals))),
    });
  });

  // Big outlined type slides sideways on scroll
  gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el) => {
    const dir = Number(el.dataset.drift || -1);
    gsap.fromTo(el, { xPercent: 0 }, {
      xPercent: 12 * dir,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

function horizontalScroll() {
  gsap.utils.toArray<HTMLElement>('[data-hscroll]').forEach((section) => {
    const track = section.querySelector<HTMLElement>('[data-hscroll-track]');
    if (!track) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const distance = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    });
    cleanups.push(() => mm.revert());
  });
}

function heroIntro() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const tl = gsap.timeline({ delay: 0.15 });
  tl.from(hero.querySelectorAll('.hero__clip'), {
    clipPath: 'inset(100% 0% 0% 0%)',
    duration: 1.4,
    ease: 'expo.inOut',
    stagger: 0.12,
  })
    .to(hero.querySelectorAll('.hero__title .split-line > span'), { y: 0, yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1 }, '-=0.7')
    .to(hero.querySelectorAll('[data-hero-fade]'), { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, '-=0.8');

  // Clips sink and dim as you scroll past
  gsap.to(hero.querySelector('.hero__clips'), {
    yPercent: 18,
    opacity: 0.35,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
}

function magnetic() {
  if (!isDesktop()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    cleanups.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    });
  });
}

function countdown() {
  document.querySelectorAll<HTMLElement>('[data-countdown]').forEach((el) => {
    const target = new Date(el.dataset.countdown!).getTime();
    const parts = {
      d: el.querySelector('[data-d]'),
      h: el.querySelector('[data-h]'),
      m: el.querySelector('[data-m]'),
      s: el.querySelector('[data-s]'),
    };
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const pad = (n: number) => String(n).padStart(2, '0');
      if (parts.d) parts.d.textContent = pad(Math.floor(diff / 864e5));
      if (parts.h) parts.h.textContent = pad(Math.floor((diff / 36e5) % 24));
      if (parts.m) parts.m.textContent = pad(Math.floor((diff / 6e4) % 60));
      if (parts.s) parts.s.textContent = pad(Math.floor((diff / 1e3) % 60));
      if (diff === 0) el.classList.add('is-done');
    };
    tick();
    const id = window.setInterval(tick, 1000);
    cleanups.push(() => window.clearInterval(id));
  });
}

function heroVideos() {
  // Only play clips while they are on screen (saves battery on phones)
  const vids = document.querySelectorAll<HTMLVideoElement>('video[data-autoplay]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting && !reduced()) v.play().catch(() => {});
      else v.pause();
    });
  });
  vids.forEach((v) => io.observe(v));
  cleanups.push(() => io.disconnect());
}

export function init() {
  document.documentElement.classList.add('js');
  if (reduced()) document.documentElement.classList.add('reduced');
  smoothScroll();
  navBehaviour();
  countdown();
  heroVideos();
  if (!reduced()) {
    heroIntro();
    reveals();
    horizontalScroll();
    magnetic();
  }
  // Fonts and images change layout; refresh trigger positions once they settle.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

export function destroy() {
  cleanups.splice(0).forEach((fn) => fn());
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.clear();
  lenis?.destroy();
  lenis = null;
}
