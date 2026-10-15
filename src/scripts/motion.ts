import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
// Mobile address bars show/hide while scrolling; don't recalculate (and jump) when that happens.
ScrollTrigger.config({ ignoreMobileResize: true });

let lenis: Lenis | null = null;
const cleanups: Array<() => void> = [];
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => window.matchMedia('(min-width: 900px)').matches;
const isTouch = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

function smoothScroll() {
  // Smooth wheel scrolling on desktop only; phones keep native momentum scrolling.
  if (reduced() || isTouch()) return;
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  (window as unknown as { lenis: Lenis }).lenis = lenis;
  const raf = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  cleanups.push(() => gsap.ticker.remove(raf));
}

/* ── Intro: logo spins in, brand name rises, orange bars wipe to the page ── */
function preloader(): Promise<void> {
  const el = document.querySelector<HTMLElement>('[data-preloader]');
  const html = document.documentElement;
  if (!el || !html.classList.contains('intro')) {
    el?.remove();
    return Promise.resolve();
  }
  try {
    sessionStorage.setItem('os-intro', '1');
  } catch {}
  lenis?.stop();
  window.scrollTo(0, 0);

  return new Promise((resolve) => {
    const count = el.querySelector('[data-pre-count]');
    const counter = { v: 0 };
    const tl = gsap.timeline({
      defaults: { ease: 'expo.out' },
      onComplete: () => {
        el.remove();
        html.classList.remove('intro');
        lenis?.start();
        resolve();
      },
    });
    tl.to(el.querySelector('.pre__logo'), { opacity: 1, scale: 1, rotate: 0, duration: 1.2, ease: 'back.out(1.4)' })
      .to(el.querySelectorAll('.pre__ch i'), { y: 0, yPercent: 0, duration: 0.9, stagger: 0.035 }, 0.35)
      .to(counter, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate: () => count && (count.textContent = String(Math.round(counter.v))) }, 0)
      .to(el.querySelector('.pre__logo'), { rotate: 360, duration: 1.1, ease: 'power3.inOut' }, 1.15)
      .to(el.querySelectorAll('.pre__bars i'), { scaleX: 1, duration: 0.55, ease: 'power3.in', stagger: { each: 0.035, from: 'random' } }, 1.75)
      .set(el.querySelectorAll('.pre__center, .pre__foot'), { autoAlpha: 0 })
      .set(el, { backgroundColor: 'transparent' })
      .to(el.querySelectorAll('.pre__bars i'), { scaleX: 0, transformOrigin: 'right', duration: 0.6, ease: 'power3.out', stagger: { each: 0.035, from: 'random' } });
  });
}

/* ── Fit a single line of display type to the full width of the screen ── */
function fitText() {
  const els = document.querySelectorAll<HTMLElement>('[data-fit]');
  if (!els.length) return;
  const fit = () => {
    // Measure the real gutter (it's a clamp()) and the width without the scrollbar
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;padding-left:var(--gutter)';
    document.body.appendChild(probe);
    const gutter = parseFloat(getComputedStyle(probe).paddingLeft) || 16;
    probe.remove();
    const target = document.documentElement.clientWidth - gutter * 2;
    els.forEach((el) => {
      el.style.fontSize = '100px';
      const w = el.scrollWidth;
      if (w) el.style.fontSize = `${(100 * target) / w}px`;
    });
  };
  fit();
  let raf = 0;
  let lastW = window.innerWidth;
  const onResize = () => {
    if (window.innerWidth === lastW) return; // ignore height-only changes (mobile toolbars)
    lastW = window.innerWidth;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      fit();
      ScrollTrigger.refresh();
    });
  };
  window.addEventListener('resize', onResize);
  cleanups.push(() => window.removeEventListener('resize', onResize));
}

/* ── Hero: words part, video card opens to full screen, scrubbed by scroll ── */
function heroScroll() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const media = hero.querySelector<HTMLElement>('[data-hero-media]');
  const brand = hero.querySelector('[data-hero-brand]');
  const trio = hero.querySelectorAll('[data-hero-trio] span');
  const end = hero.querySelector('[data-hero-end]');
  const shade = hero.querySelector('.hero__shade');
  const vids = hero.querySelectorAll('.hero__vid');
  const mobile = !isDesktop();

  // Entrance once the page is visible
  gsap.from(hero.querySelectorAll('[data-fit]'), { yPercent: 60, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.08 });
  gsap.from(media, { '--card-x': '50%', duration: 1.4, ease: 'expo.out', delay: 0.1 });
  gsap.from(trio, { opacity: 0, y: 30, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.4 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: mobile ? '+=90%' : '+=140%',
      pin: true,
      scrub: mobile ? 0.4 : 0.8,
      anticipatePin: 1,
    },
  });
  tl.to(media, { '--card-t': '0%', '--card-b': '0%', '--card-x': '0%', duration: 1 }, 0)
    .to(vids, { scale: 1, duration: 1 }, 0)
    .to(brand, { yPercent: -60, scale: 1.08, opacity: 0, duration: 0.6 }, 0)
    .to(trio[0], { xPercent: -40, duration: 0.8 }, 0)
    .to(trio[2], { xPercent: 40, duration: 0.8 }, 0)
    .to(trio, { opacity: 0, duration: 0.3 }, 0.55)
    .to(shade, { opacity: 1, duration: 0.5 }, 0.4)
    .to(end, { autoAlpha: 1, duration: 0.01 }, 0.75)
    .from(end ? end.children : [], { y: 40, opacity: 0, duration: 0.25, stagger: 0.06 }, 0.75);
}

function heroVideos() {
  const vids = [...document.querySelectorAll<HTMLVideoElement>('[data-hero-vid]')];
  if (!vids.length) return;
  let i = 0;
  let visible = true;
  const play = (v: HTMLVideoElement) => {
    if (!reduced() && visible) v.play().catch(() => {});
  };
  // Cycle through the clips: when one ends, crossfade to the next.
  const next = () => {
    const cur = vids[i];
    i = (i + 1) % vids.length;
    const nxt = vids[i];
    nxt.currentTime = 0;
    play(nxt);
    nxt.classList.add('is-on');
    cur.classList.remove('is-on');
  };
  vids.forEach((v) => v.addEventListener('ended', next));
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? play(vids[i]) : vids[i].pause();
  });
  io.observe(vids[0].parentElement!);
  play(vids[0]);
  cleanups.push(() => {
    io.disconnect();
    vids.forEach((v) => v.removeEventListener('ended', next));
  });
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
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // Media wipes open
  gsap.utils.toArray<HTMLElement>('[data-reveal-media]').forEach((el) => {
    const img = el.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 92%' } });
    tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out' });
    if (img && !img.hasAttribute('data-parallax') && isDesktop()) tl.from(img, { scale: 1.2, duration: 1.5, ease: 'expo.out' }, 0);
  });

  // Parallax drift inside media frames (desktop only — too costly while thumb-scrolling)
  if (isDesktop() && !isTouch()) {
    gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((img) => {
      gsap.fromTo(
        img,
        { yPercent: -7, scale: 1.16 },
        {
          yPercent: 7,
          scale: 1.16,
          ease: 'none',
          scrollTrigger: { trigger: img.closest('.media') ?? img, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    });
  }

  gsap.utils.toArray<HTMLElement>('[data-fade]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      delay: Number(el.dataset.fade || 0),
      scrollTrigger: { trigger: el, start: 'top 92%' },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-words]').forEach((el) => {
    gsap.to(el.querySelectorAll('.w'), {
      opacity: 1,
      stagger: 0.08,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: true },
    });
  });

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
      scrollTrigger: { trigger: el, start: 'top 92%' },
      onUpdate: () => (el.textContent = raw.replace(m[0], obj.v.toFixed(decimals))),
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el) => {
    const dir = Number(el.dataset.drift || -1);
    gsap.fromTo(el, { xPercent: 0 }, {
      xPercent: 12 * dir,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* ── Scroll-reactive: marquees speed up with scroll and flip with direction ── */
function velocityMarquee() {
  const tracks = gsap.utils.toArray<HTMLElement>('.marquee__track');
  if (!tracks.length) return;
  const loops = tracks.map((t) => gsap.to(t, { xPercent: -50, ease: 'none', duration: 30, repeat: -1 }));
  let dir = 1;
  const st = ScrollTrigger.create({
    onUpdate: (self) => {
      const v = self.getVelocity();
      if (self.direction !== dir) dir = self.direction;
      const boost = gsap.utils.clamp(1, 7, 1 + Math.abs(v) / 300);
      loops.forEach((l) => {
        gsap.to(l, { timeScale: boost * dir, duration: 0.2, overwrite: true });
        gsap.to(l, { timeScale: dir, duration: 1.2, delay: 0.25, overwrite: false });
      });
    },
  });
  cleanups.push(() => {
    st.kill();
    loops.forEach((l) => l.kill());
  });
}

/* ── Scroll-reactive: images lean with scroll speed (desktop) ── */
function velocitySkew() {
  if (!isDesktop() || isTouch()) return;
  const targets = document.querySelectorAll('.past__card, .gallery__grid .media');
  if (!targets.length) return;
  const setSkew = gsap.quickTo(targets, 'skewY', { duration: 0.5, ease: 'power3' });
  const st = ScrollTrigger.create({
    onUpdate: (self) => setSkew(gsap.utils.clamp(-4, 4, self.getVelocity() / -400)),
  });
  cleanups.push(() => st.kill());
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

function magnetic() {
  if (!isDesktop() || isTouch()) return;
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
    const parts = ['d', 'h', 'm', 's'].map((k) => el.querySelector(`[data-${k}]`));
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const vals = [diff / 864e5, (diff / 36e5) % 24, (diff / 6e4) % 60, (diff / 1e3) % 60];
      parts.forEach((p, i) => p && (p.textContent = String(Math.floor(vals[i])).padStart(2, '0')));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    cleanups.push(() => window.clearInterval(id));
  });
}

export async function init() {
  const html = document.documentElement;
  // Always start a fresh load at the top, so the intro and pinned hero begin in the right place
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  html.classList.add('js');
  if (reduced()) html.classList.add('reduced');
  smoothScroll();
  navBehaviour();
  countdown();
  heroVideos();
  await document.fonts?.ready;
  fitText();
  await preloader();
  if (!reduced()) {
    heroScroll();
    reveals();
    horizontalScroll();
    velocityMarquee();
    velocitySkew();
    magnetic();
  }
  ScrollTrigger.refresh();
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

export function destroy() {
  cleanups.splice(0).forEach((fn) => fn());
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.clear();
  lenis?.destroy();
  lenis = null;
}
