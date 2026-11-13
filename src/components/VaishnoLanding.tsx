// SOMNATH-AI: Vaishno Devi landing | ZONE: 0 | PURPOSE: Open Devi Mahatmya on the same temple door as Kanaka Durga | CONTRACT: The name is Vaishno Devi and the mantra is Om Aim Hrim Klim Chamundaye Vicche
import { useLayoutEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import hero from "@/assets/vaishno/temple-hero.jpg";
import leaf from "@/assets/vaishno/name-leaf.png";
import trishul from "@/assets/vaishno/trishul.png";
import plaque from "@/assets/vaishno/shaktipeeth-lions.png";
import "./vaishno-landing.css";

const sparks: Array<{ x: number; y: number; s: number; d: number; t: number }> = [
  { x: 1, y: 12, s: 8, d: 0, t: 4.6 },
  { x: 6, y: 46, s: 4, d: 2.6, t: 5.4 },
  { x: 9, y: 74, s: 5, d: 1.1, t: 5.2 },
  { x: 17, y: 24, s: 6, d: 2.3, t: 4.1 },
  { x: 26, y: 88, s: 7, d: 0.6, t: 5.8 },
  { x: 34, y: 8, s: 5, d: 3.1, t: 4.4 },
  { x: 43, y: 62, s: 8, d: 1.7, t: 5.5 },
  { x: 51, y: 22, s: 4, d: 2.8, t: 4.9 },
  { x: 59, y: 90, s: 6, d: 0.3, t: 6.2 },
  { x: 67, y: 12, s: 7, d: 3.7, t: 4.3 },
  { x: 75, y: 58, s: 5, d: 1.4, t: 5.1 },
  { x: 83, y: 26, s: 6, d: 2.1, t: 4.7 },
  { x: 91, y: 78, s: 8, d: 0.9, t: 5.9 },
  { x: 97, y: 38, s: 4, d: 4.2, t: 4.2 },
];

/** Sun disc in the shared temple painting (1600×912). The name stays above that disc. */
const HERO_SUN = { x0: 193, y0: 418, x1: 221, y1: 436, iw: 1600, ih: 912 };

export function VaishnoLanding() {
  const heroRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const frame = heroRef.current;
    if (!frame) return;
    const image = frame.querySelector(":scope > img");
    const sign = frame.querySelector(":scope > .vd-hero-text");
    const title = frame.querySelector(".vd-hero-top .vd-title");
    if (!(image instanceof HTMLImageElement) || !(sign instanceof HTMLElement)) return;
    const setPx = (name: string, value: number) => {
      const next = `${value.toFixed(1)}px`;
      if (frame.style.getPropertyValue(name) !== next) frame.style.setProperty(name, next);
    };
    let active = true;
    const place = () => {
      if (!active) return;
      if (title instanceof HTMLElement) {
        const length = title.getBoundingClientRect().width;
        if (length > 2) setPx("--title-span", length);
      }
      const frameBox = frame.getBoundingClientRect();
      if (frameBox.width < 2 || frameBox.height < 2) return;
      const portrait = frameBox.height >= frameBox.width * 0.9 || frameBox.width <= 640;
      const layout = portrait ? "portrait" : "wide";
      if (frame.dataset.layout !== layout) frame.dataset.layout = layout;
      if (portrait) {
        if (image.style.objectPosition) image.style.objectPosition = "";
        return;
      }
      const scale = Math.max(frameBox.width / HERO_SUN.iw, frameBox.height / HERO_SUN.ih);
      const visibleSrc = frameBox.width / scale;
      const maxSrcLeft = Math.max(0, HERO_SUN.iw - visibleSrc);
      const srcLeft = visibleSrc < 980 ? maxSrcLeft : Math.min(maxSrcLeft, Math.max(0, HERO_SUN.x0 - 80));
      const srcTop = Math.max(0, (HERO_SUN.ih - frameBox.height / scale) / 2);
      const posX = maxSrcLeft < 0.5 ? 50 : (srcLeft / maxSrcLeft) * 100;
      const maxSrcTop = Math.max(0, HERO_SUN.ih - frameBox.height / scale);
      const posY = maxSrcTop < 0.5 ? 50 : (srcTop / maxSrcTop) * 100;
      image.style.objectFit = "cover";
      image.style.objectPosition = `${posX}% ${posY}%`;
      const sunLeft = HERO_SUN.x0 * scale - srcLeft * scale;
      const sunTop = HERO_SUN.y0 * scale - srcTop * scale;
      const sunWidth = (HERO_SUN.x1 - HERO_SUN.x0) * scale;
      const sunHeight = (HERO_SUN.y1 - HERO_SUN.y0) * scale;
      const sunInView = sunLeft + sunWidth > 8 && sunLeft < frameBox.width - 8;
      const columnW = sunInView ? Math.min(340 * scale, frameBox.width * 0.46) : Math.min(frameBox.width * 0.62, 280);
      const sunCenter = sunLeft + sunWidth / 2;
      const columnLeft = sunInView
        ? Math.max(8, Math.min(sunCenter - columnW / 2, frameBox.width - columnW - 8))
        : Math.max(8, frameBox.width * 0.04);
      setPx("--sunrise-left", sunInView ? sunLeft : -999);
      setPx("--sunrise-top", sunTop);
      setPx("--sunrise-w", sunInView ? sunWidth : 0);
      setPx("--sunrise-h", sunInView ? sunHeight : 0);
      setPx("--axis-left", columnLeft);
      setPx("--column-w", columnW);
      setPx("--brand-bottom", sunInView ? frameBox.height - Math.max(0, sunTop - frameBox.height * 0.016) : frameBox.height * 0.58);
      setPx("--plaque-bottom", Math.max(16, frameBox.height * 0.018));
    };
    place();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(frame);
    observer?.observe(sign);
    if (title instanceof HTMLElement) observer?.observe(title);
    window.addEventListener("resize", place);
    void document.fonts?.ready.then(() => { if (active) place(); });
    image.addEventListener("load", place);
    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener("resize", place);
      image.removeEventListener("load", place);
    };
  }, []);

  return (
    <div className="vaishno-door">
      <div className="vd">
        <main className="vd-main">
          <section ref={heroRef} className="vd-hero" data-layout="wide">
            <img src={hero} alt="Temple golden sanctum" width={1600} height={912} />
            <div className="vd-sunrise" aria-hidden="true" />
            <header className="vd-hero-top">
              <div className="vd-brand">
                <span className="vd-mark">
                  <span className="vd-trishul" aria-hidden="true">
                    <img src={trishul} alt="" width={768} height={768} />
                  </span>
                </span>
                <h1 className="vd-title">
                  <span className="vd-leaf" aria-hidden="true"><img src={leaf} alt="" width={120} height={68} /></span>
                  VAISHNO DEVI
                </h1>
                <div className="vd-mantra-wrap">
                  <span className="vd-sparks" aria-hidden="true">
                    {sparks.map((spark, i) => (
                      <i
                        key={i}
                        className="vd-spark"
                        style={{ left: `${spark.x}%`, top: `${spark.y}%`, width: spark.s, height: spark.s, animationDelay: `${spark.d}s`, animationDuration: `${spark.t}s` }}
                      />
                    ))}
                  </span>
                  <p className="vd-mantra" aria-label="Om Aim Hrim Klim Chamundaye Vicche">
                    <span className="vd-mantra-line" aria-hidden="true">Om Aim Hrim Klim</span>
                    <span className="vd-mantra-line" aria-hidden="true">Chamundaye Vicche</span>
                  </p>
                </div>
              </div>
            </header>
            <div className="vd-hero-text">
              <div className="vd-paths">
                <div className="vd-plaque">
                  <svg width="0" height="0" aria-hidden="true" focusable="false">
                    <defs>
                      <radialGradient id="vd-lion-fade" cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0.2" stopColor="#fff" />
                        <stop offset="0.72" stopColor="#000" />
                      </radialGradient>
                      <mask id="vd-shaktipeeth-mask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
                        <ellipse cx="0.22" cy="0.58" rx="0.3" ry="0.42" fill="url(#vd-lion-fade)" />
                        <ellipse cx="0.78" cy="0.58" rx="0.3" ry="0.42" fill="url(#vd-lion-fade)" />
                        <rect x="0.115" y="0.02" width="0.77" height="0.68" fill="#fff" />
                      </mask>
                    </defs>
                  </svg>
                  <img src={plaque} alt="" width={1024} height={682} />
                  <Link className="vd-plaque-label" to="/study">SHAKTIPEETH</Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
