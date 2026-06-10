'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { markTourSeen } from '@/lib/actions/insights';

interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  body: string;
  placement: 'right' | 'top' | 'left';
}

const STEPS: TourStep[] = [
  {
    target: 'capture',
    title: '✎ Capture',
    body: 'Paste any URL, article, or note. AI reads it, extracts the key ideas, and builds your review cards automatically.',
    placement: 'right',
  },
  {
    target: 'library',
    title: '📚 Library',
    body: 'Every learning becomes a book on a shelf, grouped by topic. Click any book to read, quiz yourself, or teach it back.',
    placement: 'right',
  },
  {
    target: 'review',
    title: '🔁 Review',
    body: 'Spaced repetition shows you each card just before you\'d forget it — so a few minutes a day keeps everything fresh.',
    placement: 'right',
  },
  {
    target: 'express',
    title: '⚡ Express',
    body: 'Once you\'ve proved you know something, turn it into talking points, interview stories, or LinkedIn bullets in seconds.',
    placement: 'right',
  },
];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function DashboardTour() {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const currentStep = STEPS[step];

  const findTarget = useCallback((target: string): Element | null => {
    // Prefer sidebar (desktop), fall back to bottom nav (mobile)
    return document.querySelector(`[data-tour="${target}"]`);
  }, []);

  const updateRect = useCallback(() => {
    if (!currentStep) return;
    const el = findTarget(currentStep.target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [currentStep, findTarget]);

  // Mount + initial measurement
  useEffect(() => {
    setMounted(true);
    // Small delay so layout settles before we measure
    const t = setTimeout(() => {
      updateRect();
      setVisible(true);
    }, 400);
    return () => clearTimeout(t);
  }, [updateRect]);

  // Re-measure on step change
  useEffect(() => {
    if (!mounted) return;
    setVisible(false);
    const t = setTimeout(() => {
      updateRect();
      setVisible(true);
    }, 80);
    return () => clearTimeout(t);
  }, [step, mounted, updateRect]);

  // Re-measure on resize
  useEffect(() => {
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

  const dismiss = useCallback(async () => {
    setVisible(false);
    await markTourSeen();
  }, []);

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      await dismiss();
    }
  };

  if (!mounted || !rect) return null;

  const PAD = 8;
  const spotTop = rect.top - PAD;
  const spotLeft = rect.left - PAD;
  const spotW = rect.width + PAD * 2;
  const spotH = rect.height + PAD * 2;

  // Tooltip positioning
  const TIP_W = 280;
  const TIP_OFFSET = 16;
  let tipLeft = spotLeft + spotW + TIP_OFFSET;
  let tipTop = spotTop + spotH / 2 - 60; // vertically centred

  // If too close to right edge, flip left
  if (tipLeft + TIP_W > window.innerWidth - 16) {
    tipLeft = spotLeft - TIP_W - TIP_OFFSET;
  }
  // Clamp vertically
  tipTop = Math.max(16, Math.min(tipTop, window.innerHeight - 200));

  const progress = ((step + 1) / STEPS.length) * 100;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        pointerEvents: visible ? 'auto' : 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Dark backdrop with spotlight hole via box-shadow */}
      <div
        style={{
          position: 'fixed',
          top: spotTop,
          left: spotLeft,
          width: spotW,
          height: spotH,
          borderRadius: '10px',
          boxShadow: '0 0 0 9999px rgba(42,38,32,0.72)',
          pointerEvents: 'none',
          transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
        }}
      />

      {/* Tooltip card */}
      <div
        style={{
          position: 'fixed',
          top: tipTop,
          left: tipLeft,
          width: TIP_W,
          background: 'var(--color-card)',
          borderRadius: '16px',
          border: '1.5px solid var(--color-border)',
          boxShadow: '0 20px 48px -12px rgba(42,38,32,0.4)',
          padding: '20px',
          transition: 'top 0.25s ease, left 0.25s ease',
        }}
      >
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                height: '4px',
                flex: 1,
                borderRadius: '99px',
                background: i <= step ? '#b5462f' : 'var(--color-border)',
                transition: 'background 0.2s ease',
              }}
            />
          ))}
        </div>

        <h4
          style={{
            fontFamily: 'Spectral, Georgia, serif',
            fontWeight: 700,
            fontSize: '17px',
            color: 'var(--color-foreground)',
            marginBottom: '8px',
          }}
        >
          {currentStep.title}
        </h4>
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            lineHeight: '1.6',
            color: 'var(--color-muted-foreground)',
            marginBottom: '20px',
          }}
        >
          {currentStep.body}
        </p>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={dismiss}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '12px',
              color: 'var(--color-muted-foreground)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              background: '#b5462f',
              border: 'none',
              borderRadius: '10px',
              padding: '9px 20px',
              cursor: 'pointer',
              transition: 'transform 0.1s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {step < STEPS.length - 1 ? 'Next →' : 'Got it ✓'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
