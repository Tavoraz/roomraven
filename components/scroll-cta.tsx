"use client";

import type { MouseEvent, ReactNode } from "react";

interface ScrollCtaProps {
  className?: string;
  target: string;
  children: ReactNode;
}

export function ScrollCta({ className, target, children }: ScrollCtaProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const element = document.querySelector(target);

    if (!(element instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();

    element.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    if (target.startsWith("#")) {
      window.history.replaceState({}, "", target);
    }
  }

  return (
    <a href={target} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
