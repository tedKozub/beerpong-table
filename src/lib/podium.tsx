import React from "react";

/**
 * Centered podium badge for 1st (Gold), 2nd (Silver), and 3rd (Bronze) places.
 * Designed according to SPPDF Beerpong Design System with WCAG AAA contrast safety.
 * Functional in both light and dark modes.
 */
export function renderRank(idx: number) {
  if (idx === 0) {
    return (
      <span
        className="badge badge-warning text-warning-content font-black text-xs h-6 sm:h-7 min-w-[1.75rem] px-1 shadow-sm inline-flex items-center justify-center whitespace-nowrap"
        title="1. místo (Zlato)"
      >
        <span className="relative inline-flex items-center justify-center">
          <span className="tabular-nums">1</span>
          <span className="absolute left-full top-0 select-none">.</span>
        </span>
      </span>
    );
  }
  if (idx === 1) {
    return (
      <span
        className="badge badge-ghost bg-slate-300 text-slate-900 border-slate-300 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200 font-bold text-xs h-6 sm:h-7 min-w-[1.75rem] px-1 shadow-sm inline-flex items-center justify-center whitespace-nowrap"
        title="2. místo (Stříbro)"
      >
        <span className="relative inline-flex items-center justify-center">
          <span className="tabular-nums">2</span>
          <span className="absolute left-full top-0 select-none">.</span>
        </span>
      </span>
    );
  }
  if (idx === 2) {
    return (
      <span
        className="badge badge-ghost bg-amber-800 text-amber-100 border-amber-800 dark:bg-amber-700 dark:text-amber-50 dark:border-amber-600 font-bold text-xs h-6 sm:h-7 min-w-[1.75rem] px-1 shadow-sm inline-flex items-center justify-center whitespace-nowrap"
        title="3. místo (Bronz)"
      >
        <span className="relative inline-flex items-center justify-center">
          <span className="tabular-nums">3</span>
          <span className="absolute left-full top-0 select-none">.</span>
        </span>
      </span>
    );
  }
  return (
    <span className="text-base-content/80 font-medium pl-1 sm:pl-2 tabular-nums">
      {idx + 1}.
    </span>
  );
}

/**
 * Contrast-safe row background styling for podium positions in table views.
 * Subtle, distinct podium background tints with left accent borders for both light and dark modes.
 */
export function getPodiumRowStyle(idx: number) {
  if (idx === 0) {
    return "bg-warning/[0.08] font-bold hover:bg-warning/[0.15] dark:bg-warning/20 dark:hover:bg-warning/30 border-l-4 border-l-warning transition-colors";
  }
  if (idx === 1) {
    return "bg-slate-400/[0.08] font-semibold hover:bg-slate-400/[0.15] dark:bg-slate-400/15 dark:hover:bg-slate-400/25 border-l-4 border-l-slate-400 transition-colors";
  }
  if (idx === 2) {
    return "bg-amber-800/[0.08] font-semibold hover:bg-amber-800/[0.15] dark:bg-amber-800/25 dark:hover:bg-amber-800/35 border-l-4 border-l-amber-700 dark:border-l-amber-600 transition-colors";
  }
  return "border-l-4 border-l-transparent hover:bg-base-200/40 transition-colors";
}
