import Link from "next/link";

import { RoomRavenBadge } from "@/components/roomraven-badge";

export function AudienceMenu({ current }: { current: "consumer" | "enterprise" }) {
  return (
    <div className="audience-menu">
      <RoomRavenBadge compact />
      <nav className="audience-menu-links" aria-label="Audience navigation">
        <Link className={`audience-menu-link ${current === "consumer" ? "active" : ""}`} href="/consumers">
          For consumers
        </Link>
        <Link className={`audience-menu-link ${current === "enterprise" ? "active" : ""}`} href="/">
          For enterprise
        </Link>
      </nav>
    </div>
  );
}
