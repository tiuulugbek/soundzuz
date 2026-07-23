"use client";

import { useEffect, useRef } from "react";

type WaveCanvasProps = {
  className?: string;
  /** Chiziqlar ranglari (pastdan yuqoriga qatlamlar) */
  colors?: string[];
  /** Balandlik nisbati (0..1) — to'lqin amplitudasi */
  amplitude?: number;
};

/**
 * Hero uchun jonli tovush to'lqini. Canvas'da 3 qatlamli silliq sinus
 * to'lqinlar oqadi; kursor yaqinlashgan joyda to'lqin "jonlanadi".
 * Optimallashtirish: devicePixelRatio cheklangan (<=2), viewport'dan
 * chiqqanda yoki tab yashiringanida rAF butunlay to'xtaydi,
 * reduced-motion'da bitta statik kadr chiziladi.
 */
export function WaveCanvas({ className = "", colors = ["#ff820122", "#ff820155", "#ff8201"], amplitude = 0.32 }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -1, active: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let time = Math.PI * 1.7;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawLayer(phase: number, freq: number, amp: number, color: string, lineWidth: number) {
      const mid = height / 2;
      const px = pointer.current.x * width;
      ctx!.beginPath();
      const step = Math.max(4, Math.floor(width / 160));
      for (let x = 0; x <= width + step; x += step) {
        // Kursor atrofida lokal kuchaytirish (gauss)
        const dist = pointer.current.x >= 0 ? Math.abs(x - px) : Infinity;
        const boost = 1 + pointer.current.active * 1.6 * Math.exp(-(dist * dist) / (2 * 130 * 130));
        const envelope = Math.sin((x / width) * Math.PI); // chetlarda so'nadi
        const y =
          mid +
          Math.sin(x * freq + phase) * amp * envelope * boost +
          Math.sin(x * freq * 0.37 + phase * 1.6) * amp * 0.45 * envelope * boost;
        if (x === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = "round";
      ctx!.stroke();
    }

    function frame() {
      ctx!.clearRect(0, 0, width, height);
      const amp = height * amplitude;
      drawLayer(time * 0.7, 0.011, amp * 0.55, colors[0] ?? "#ff820122", 2);
      drawLayer(time * 1.0, 0.016, amp * 0.8, colors[1] ?? "#ff820155", 2);
      drawLayer(time * 1.35, 0.021, amp, colors[2] ?? "#ff8201", 2.5);
      // Kursor faolligi yumshoq so'nadi
      pointer.current.active += ((pointer.current.x >= 0 ? 1 : 0) - pointer.current.active) * 0.06;
      time += 0.035;
      if (running) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    if (reduced) { frame(); } else { start(); }

    const resizeObserver = new ResizeObserver(() => { resize(); if (reduced) frame(); });
    resizeObserver.observe(canvas);

    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current.x = (event.clientX - rect.left) / rect.width;
      if (pointer.current.x < 0 || pointer.current.x > 1) pointer.current.x = -1;
    };
    const onLeave = () => { pointer.current.x = -1; };
    const host = canvas.parentElement ?? canvas;
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      resizeObserver.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [colors, amplitude]);

  return <canvas ref={canvasRef} className={`sz-wave ${className}`.trim()} aria-hidden />;
}
