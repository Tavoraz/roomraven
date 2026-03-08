"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { buildPublicDemoHref, getDefaultDemoVariant } from "@/lib/demo-variants";

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

type GuideAction =
  | {
      kind: "href";
      label: string;
      target: string;
    }
  | {
      kind: "scroll";
      label: string;
      target: string;
      focusSelector?: string;
    };

type GuideHint = {
  title: string;
  message: string;
  badge: string;
  action?: GuideAction;
};

declare global {
  interface WindowEventMap {
    "roomraven:planner-state": CustomEvent<PlannerGuideSnapshot>;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildHints(pathname: string, plannerState: PlannerGuideSnapshot | null): GuideHint[] {
  if (pathname === "/planner") {
    if (plannerState?.error) {
      return [
        {
          badge: "Try again",
          title: "Use a clearer room photo",
          message: "One room image plus a few focused references works best.",
          action: {
            kind: "scroll",
            label: "Fix uploads",
            target: "#planner-setup"
          }
        }
      ];
    }

    switch (plannerState?.phase ?? "setup") {
      case "generating":
        return [
          {
            badge: "Generating",
            title: "Building the next concept",
            message: "Give it a second, then keep it or toss it.",
          }
        ];
      case "result":
        return [
          {
            badge: "New result",
            title: "Keep it or discard it",
            message: "Only save concepts that deserve a place in the shortlist.",
            action: {
              kind: "scroll",
              label: "Review result",
              target: "#planner-result"
            }
          }
        ];
      case "library":
        return [
          {
            badge: `${plannerState?.libraryCount ?? 0} kept`,
            title: "Build a shortlist",
            message: "Select at least two saved looks to start 1v1 compare.",
            action: {
              kind: "scroll",
              label: "Open library",
              target: "#planner-library"
            }
          },
        ];
      case "compare":
        return [
          {
            badge: "1v1 compare",
            title: "Pick the stronger image",
            message: "Trust quick reactions. The winner stays until one final favorite remains.",
            action: {
              kind: "scroll",
              label: "Go to compare",
              target: "#planner-compare"
            }
          }
        ];
      case "winner":
        return [
          {
            badge: "Winner found",
            title: "You have a favorite",
            message: "Generate more looks or keep this one as the front-runner.",
            action: {
              kind: "scroll",
              label: "See the winner",
              target: "#planner-compare"
            }
          }
        ];
      case "setup":
      default:
        return [
          {
            badge: plannerState?.roomLabel ?? "Room planner",
            title: "Start with one room and a few references",
            message: "Clear inputs create stronger concepts.",
            action: {
              kind: "scroll",
              label: "Jump to setup",
              target: "#planner-setup"
            }
          }
        ];
    }
  }

  if (pathname === "/admin") {
    return [
      {
        badge: "Brand setup",
        title: "Start with the brand kit",
        message: "Set logo, colors, and defaults before you copy the embed.",
        action: {
          kind: "scroll",
          label: "Open tenant settings",
          target: "#tenant-settings",
          focusSelector: "#tenant-name"
        }
      }
    ];
  }

  if (pathname.startsWith("/saved/")) {
    return [
      {
        badge: "Saved project",
        title: "Take the next step",
        message: "Use the shopping list to move from inspiration to products.",
        action: {
          kind: "scroll",
          label: "Open shopping list",
          target: "#saved-shopping-list"
        }
      }
    ];
  }

  return [
    {
      badge: "Live demo",
      title: "Open the live demo",
      message: "Upload a room, add references, and compare the best results.",
      action: {
        kind: "href",
        label: "Try the demo",
        target: buildPublicDemoHref(getDefaultDemoVariant())
      }
    }
  ];
}

function RavenGuideInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plannerState, setPlannerState] = useState<PlannerGuideSnapshot | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 160 });
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [reaction, setReaction] = useState<RavenReaction>("idle");
  const previousSignalRef = useRef<string>("");
  const isEmbed = searchParams.get("embed") === "1";
  const hints = useMemo(() => buildHints(pathname, plannerState), [pathname, plannerState]);
  const activeHint = hints[0];
  const alignLeft = position.x < 280;

  useEffect(() => {
    const handlePlannerState = (event: WindowEventMap["roomraven:planner-state"]) => {
      setPlannerState(event.detail);
    };

    window.addEventListener("roomraven:planner-state", handlePlannerState);
    return () => {
      window.removeEventListener("roomraven:planner-state", handlePlannerState);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/planner") {
      setPlannerState(null);
    }
  }, [pathname]);

  useEffect(() => {
    const signal = [
      pathname,
      plannerState?.phase ?? "none",
      plannerState?.error ?? "",
      plannerState?.savedLink ?? "",
      plannerState?.libraryCount ?? 0
    ].join("|");

    const isFirstRender = previousSignalRef.current === "";
    const hasChanged = previousSignalRef.current !== signal;
    previousSignalRef.current = signal;

    if (isFirstRender || !hasChanged) {
      return;
    }

    let nextReaction: RavenReaction = "idle";

    if (plannerState?.error) {
      nextReaction = "alert";
    } else if (plannerState?.phase === "generating") {
      nextReaction = "thinking";
    } else if (plannerState?.phase === "result" || plannerState?.phase === "winner" || plannerState?.phase === "compare") {
      nextReaction = "excited";
    }

    setReaction(nextReaction);

    const shouldOpen =
      pathname === "/planner" &&
      (plannerState?.phase === "generating" ||
        plannerState?.phase === "result" ||
        plannerState?.phase === "compare" ||
        plannerState?.phase === "winner" ||
        Boolean(plannerState?.error));

    if (shouldOpen) {
      setExpanded(true);
    }

    const resetReactionTimeoutId = window.setTimeout(() => {
      setReaction("idle");
    }, 1400);

    if (!shouldOpen) {
      return () => {
        window.clearTimeout(resetReactionTimeoutId);
      };
    }

    const collapseTimeoutId = window.setTimeout(() => {
      setExpanded(false);
    }, 3200);

    return () => {
      window.clearTimeout(resetReactionTimeoutId);
      window.clearTimeout(collapseTimeoutId);
    };
  }, [pathname, plannerState]);

  useEffect(() => {
    const placeRaven = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewportWidth(width);
      setPosition({
        x: clamp(width - (expanded ? 376 : 132), 12, Math.max(12, width - 132)),
        y: clamp(height - (isEmbed ? 198 : 228), 96, Math.max(96, height - 120))
      });
    };

    placeRaven();
    window.addEventListener("resize", placeRaven);

    return () => {
      window.removeEventListener("resize", placeRaven);
    };
  }, [expanded, isEmbed, pathname]);

  function handleAction() {
    const action = activeHint.action;

    if (!action) {
      return;
    }

    if (action.kind === "href") {
      if (action.target.startsWith("http")) {
        window.location.assign(action.target);
        return;
      }

      router.push(action.target);
      return;
    }

    const target = document.querySelector(action.target);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

    const focusSelector = action.focusSelector;

    if (focusSelector) {
      window.setTimeout(() => {
        const focusTarget = document.querySelector(focusSelector);
        if (focusTarget instanceof HTMLElement) {
          focusTarget.focus();
        }
      }, 360);
    }

    setReaction("excited");
    window.setTimeout(() => {
      setReaction("idle");
    }, 1200);
  }

  return (
    <div
      className="raven-guide"
      data-expanded={expanded}
      data-embed={isEmbed}
      data-reaction={reaction}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`
      }}
    >
      {expanded ? (
        <aside
          className={`raven-bubble ${alignLeft || viewportWidth < 860 ? "raven-bubble-left" : "raven-bubble-right"}`}
        >
          <span className="raven-badge">{activeHint.badge}</span>
          <h2>{activeHint.title}</h2>
          <p>{activeHint.message}</p>
          <div className="raven-actions">
            {activeHint.action ? (
              <button type="button" className="cta cta-primary raven-action-button" onClick={handleAction}>
                {activeHint.action.label}
              </button>
            ) : null}
          </div>
        </aside>
      ) : null}

      <div className="raven-perch-controls">
        <button
          type="button"
          className="raven-toggle"
          onClick={() => {
            setExpanded((current) => !current);
            setReaction("excited");
            window.setTimeout(() => {
              setReaction("idle");
            }, 900);
          }}
          aria-label={expanded ? "Hide RoomRaven helper" : "Show RoomRaven helper"}
        >
          <span className="raven-orb" />
          <span className="raven-shadow" />
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
