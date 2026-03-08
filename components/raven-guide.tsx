"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type PlannerPhase = "setup" | "generating" | "result" | "library" | "compare" | "winner";

type PlannerGuideSnapshot = {
  phase: PlannerPhase;
  roomType: string;
  roomLabel: string;
  libraryCount: number;
  selectedCount: number;
  savedLink: string | null;
  error: string | null;
};

type RavenReaction = "idle" | "thinking" | "excited" | "alert";

declare global {
  interface WindowEventMap {
    "roomraven:planner-state": CustomEvent<PlannerGuideSnapshot>;
  }
}

function RavenGuideInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [reaction, setReaction] = useState<RavenReaction>("idle");
  const resetTimeoutRef = useRef<number | null>(null);
  const isEmbed = searchParams.get("embed") === "1";

  useEffect(() => {
    const clearReaction = () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };

    const triggerReaction = (nextReaction: RavenReaction, duration = 1200) => {
      clearReaction();
      setReaction(nextReaction);
      resetTimeoutRef.current = window.setTimeout(() => {
        setReaction("idle");
      }, duration);
    };

    const handlePlannerState = (event: WindowEventMap["roomraven:planner-state"]) => {
      const state = event.detail;

      if (state.error) {
        triggerReaction("alert", 1500);
        return;
      }

      if (state.phase === "generating") {
        triggerReaction("thinking", 1400);
        return;
      }

      if (state.phase === "result" || state.phase === "compare" || state.phase === "winner") {
        triggerReaction("excited", 1100);
      }
    };

    window.addEventListener("roomraven:planner-state", handlePlannerState);

    return () => {
      clearReaction();
      window.removeEventListener("roomraven:planner-state", handlePlannerState);
    };
  }, []);

  useEffect(() => {
    setReaction("idle");
    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, [pathname]);

  return (
    <div className="raven-guide" data-embed={isEmbed} data-reaction={reaction}>
      <button
        type="button"
        className="raven-toggle"
        aria-label="RoomRaven mascot"
        onClick={() => {
          if (resetTimeoutRef.current !== null) {
            window.clearTimeout(resetTimeoutRef.current);
          }
          setReaction("excited");
          resetTimeoutRef.current = window.setTimeout(() => {
            setReaction("idle");
          }, 900);
        }}
      >
        <span className="raven-orb" />
        <span className="raven-shadow" />
        <span className="raven-burst raven-burst-a" aria-hidden="true" />
        <span className="raven-burst raven-burst-b" aria-hidden="true" />
        <span className="raven-burst raven-burst-c" aria-hidden="true" />
        <svg className="raven-sprite" viewBox="0 0 220 220" aria-hidden="true">
          <defs>
            <radialGradient id="raven-body-core" cx="34%" cy="28%" r="82%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="45%" stopColor="#111827" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <linearGradient id="raven-head-sheen" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.78)" />
              <stop offset="35%" stopColor="rgba(255,255,255,0.16)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <linearGradient id="raven-left-wing" x1="14%" x2="90%" y1="18%" y2="88%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="48%" stopColor="#111827" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="raven-right-wing" x1="10%" x2="92%" y1="14%" y2="88%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="52%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="raven-feather-tip" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="raven-beak" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
            <radialGradient id="raven-eye" cx="44%" cy="34%" r="74%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <radialGradient id="raven-tail" cx="34%" cy="30%" r="88%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>
          <g className="raven-tail">
            <path d="M88 159c-16 18-35 29-59 34 23 6 46 2 69-13l16-25Z" fill="url(#raven-tail)" />
            <path d="M109 165c-9 19-25 34-49 43 22 2 43-5 60-20l10-25Z" fill="#1e293b" />
          </g>
          <g className="raven-wing raven-wing-left">
            <path d="M110 123C80 72 27 68 11 118c22 18 49 28 92 29Z" fill="url(#raven-left-wing)" />
            <path d="M89 103c-24-23-49-28-68-15 16 10 33 18 56 24Z" fill="rgba(255,255,255,0.11)" />
            <path d="M84 134c-18 16-40 27-64 31 25 8 52 2 77-12Z" fill="url(#raven-feather-tip)" />
          </g>
          <g className="raven-wing raven-wing-right">
            <path d="M112 123c32-54 87-48 100 1-20 18-49 29-94 29Z" fill="url(#raven-right-wing)" />
            <path d="M135 100c23-21 48-24 65-10-15 9-31 16-54 22Z" fill="rgba(255,255,255,0.08)" />
            <path d="M139 135c18 17 39 27 61 31-23 8-48 4-73-10Z" fill="url(#raven-feather-tip)" />
          </g>
          <path
            d="M68 142c0-38 28-66 66-66 21 0 40 8 54 23 12 13 19 31 19 50 0 40-31 67-77 67-37 0-62-28-62-74Z"
            fill="url(#raven-body-core)"
          />
          <path
            d="M90 114c13 11 28 16 44 16 18 0 34-8 47-22-5-29-27-45-55-45-31 0-54 20-60 50 8-3 16-3 24 1Z"
            fill="rgba(255,255,255,0.12)"
          />
          <path
            d="M103 170c15 12 31 18 50 18 18 0 35-6 48-18-10 24-32 38-58 38-21 0-38-8-52-23Z"
            fill="#050b16"
          />
          <path d="M118 70c0-28 23-50 50-50 25 0 46 19 49 43 2 20-7 37-24 47-10 6-22 9-35 9-23 0-40-18-40-49Z" fill="url(#raven-body-core)" />
          <path d="M138 38c12-10 27-14 43-11 13 2 24 9 31 20-15-4-30-3-47 2-8 2-16 5-24 10 0-7-1-14-3-21Z" fill="url(#raven-head-sheen)" opacity="0.86" />
          <path d="M177 86c19-4 34 4 40 17-16 6-31 9-47 10Z" fill="url(#raven-beak)" />
          <path d="M176 97c15 2 25 10 28 18-13 2-25 0-36-5Z" fill="#b45309" />
          <path d="M146 64c9-9 21-14 37-13 9 1 17 5 23 11-11-2-21-1-31 2-10 3-19 7-27 13 0-4-1-8-2-13Z" fill="rgba(255,255,255,0.12)" />
          <ellipse cx="171" cy="78" rx="12" ry="10" fill="#020617" />
          <circle className="raven-eye" cx="172" cy="78" r="6.8" fill="url(#raven-eye)" />
          <circle cx="174" cy="76" r="2.4" fill="#ffffff" className="raven-eye-glint" />
          <path d="M158 64c8-6 18-8 28-7 7 1 12 4 17 8-10 0-19 2-29 6-6 2-11 5-15 8 0-5-1-10-1-15Z" fill="rgba(2,6,23,0.9)" />
        </svg>
      </button>
    </div>
  );
}

export function RavenGuide() {
  return (
    <Suspense fallback={null}>
      <RavenGuideInner />
    </Suspense>
  );
}
