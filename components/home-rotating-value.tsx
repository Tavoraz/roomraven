"use client";

import { useEffect, useState } from "react";

const ROTATION_MS = 2800;

type HomeRotatingValueProps = {
  messages: string[];
};

export function HomeRotatingValue({ messages }: HomeRotatingValueProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, ROTATION_MS);

    return () => window.clearInterval(intervalId);
  }, [messages]);

  return (
    <div className="home-hero-subtext" aria-live="polite">
      <span className="home-hero-rotator-label">RoomRaven helps you</span>
      <p className="lead home-hero-rotator-line">
        <span key={messages[index]} className="home-hero-rotator-text">
          {messages[index]}
        </span>
      </p>
    </div>
  );
}
