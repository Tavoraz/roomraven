type RoomRavenBadgeProps = {
  compact?: boolean;
};

export function RoomRavenBadge({ compact = false }: RoomRavenBadgeProps) {
  return (
    <div className={`roomraven-badge${compact ? " compact" : ""}`}>
      <img className="roomraven-badge-logo" src="/roomraven-logo.png" alt="" aria-hidden="true" />
      <span className="roomraven-badge-name">RoomRaven</span>
    </div>
  );
}
