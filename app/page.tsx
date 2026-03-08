import Link from "next/link";

import { HomeBrandStudio } from "@/components/home-brand-studio";
import { HomeRotatingValue } from "@/components/home-rotating-value";
import { RoomRavenBadge } from "@/components/roomraven-badge";
import { ScrollCta } from "@/components/scroll-cta";
import { buildPublicDemoHref, getDefaultDemoVariant, listPublicDemoCards } from "@/lib/demo-variants";
import { listTenants } from "@/lib/repository";

export const dynamic = "force-dynamic";

const roomTypes = [
  { label: "Bathroom", kind: "bathroom" },
  { label: "Kitchen", kind: "kitchen" },
  { label: "Living room", kind: "living-room" },
  { label: "Office", kind: "office" }
] as const;
const audienceGroups = ["Bathroom retailers", "Kitchen studios", "Interior showrooms", "Renovation specialists"];
const flowTiles = [
  { step: "01", label: "Upload", meta: "Current room", detail: "Photo of the existing space", icon: "camera", visual: "upload" },
  { step: "02", label: "Reference", meta: "Products + finishes", detail: "Objects, finishes, colors", icon: "swatches", visual: "reference" },
  { step: "03", label: "Keep", meta: "Best concepts", detail: "Save strong AI options", icon: "sparkles", visual: "keep" },
  { step: "04", label: "1v1", meta: "Winner stays", detail: "Compare until one wins", icon: "trophy", visual: "compare" }
];
const valueTiles = [
  { label: "Clients see the result", meta: "Easier to picture the outcome", icon: "eye" },
  { label: "Decisions happen faster", meta: "Less hesitation, clearer preference", icon: "bolt" },
  { label: "Higher-intent conversions", meta: "Better leads and stronger purchase intent", icon: "chart" }
];
const propositionTiles = [
  { label: "Embed on your website", meta: "Keep shoppers in your own journey", icon: "browser" },
  { label: "Or launch standalone", meta: "Use it for campaigns, showrooms, or consultations", icon: "storefront" },
  { label: "Matched to your branding", meta: "Logo, colors, and styling tailored to your brand", icon: "palette" }
];
const heroValueMessages = [
  "Help shoppers decide faster with visual room previews.",
  "Turn inspiration into higher-intent leads and purchases.",
  "Keep renovation planning on your own branded website.",
  "Show the result before the sale, not after it."
];

export default function HomePage() {
  const tenants = listTenants();
  const demos = listPublicDemoCards(tenants);
  const primaryDemo = demos[0] ?? { href: buildPublicDemoHref(getDefaultDemoVariant()) };

  return (
    <main className="page-shell">
      <section className="hero-grid">
        <div className="panel home-hero-copy">
          <RoomRavenBadge />
          <span className="home-kicker">For retailers, showrooms, and renovation brands</span>
          <h1 className="headline">Increase conversions with visual room planning.</h1>
          <HomeRotatingValue messages={heroValueMessages} />
          <div className="home-room-examples" aria-label="Example room types">
            <div className="home-room-examples-header">
              <span className="home-kicker">Example rooms</span>
              <span className="small-note">Bathroom, kitchen, living room, office, and more. These are examples, not filters.</span>
            </div>
            <div className="home-room-example-grid">
              {roomTypes.map((roomType) => (
                <article key={roomType.label} className="home-room-example-card">
                  <div className={`home-room-example-visual home-room-example-${roomType.kind}`} aria-hidden="true">
                    <RoomExampleVisual kind={roomType.kind} />
                  </div>
                  <span className="home-room-example-label">{roomType.label}</span>
                </article>
              ))}
            </div>
          </div>
          <div id="home-actions" className="cta-row raven-target">
            <Link className="cta cta-primary" href={primaryDemo.href}>
              Try the demo
            </Link>
            <ScrollCta className="cta cta-secondary" target="#brand-demos">
              For your brand
            </ScrollCta>
          </div>
        </div>

        <aside className="panel hero-visual home-visual-stage">
          <article className="home-scene-card home-scene-current">
            <span className="home-scene-kicker">Current room</span>
            <div className="home-room-scene home-room-scene-current">
              <div className="scene-wall" />
              <div className="scene-floor" />
              <div className="scene-object scene-vanity" />
              <div className="scene-object scene-window" />
              <div className="scene-object scene-bath" />
            </div>
          </article>

          <article className="home-scene-card home-scene-inspiration">
            <span className="home-scene-kicker">Inspiration</span>
            <InspirationBoard />
          </article>

          <article className="home-scene-card home-scene-generated">
            <span className="home-scene-kicker">Generated concept</span>
            <div className="home-room-scene home-room-scene-generated">
              <div className="scene-wall" />
              <div className="scene-floor" />
              <div className="scene-object scene-vanity scene-vanity-upgraded" />
              <div className="scene-object scene-window scene-window-glow" />
              <div className="scene-object scene-bath scene-bath-upgraded" />
              <div className="scene-object scene-plant" />
            </div>
          </article>

          <article className="home-scene-card home-scene-compare">
            <span className="home-scene-kicker">1v1 compare</span>
            <div className="home-compare-stage">
              <div className="home-compare-option home-compare-option-a" />
              <div className="home-compare-vs">VS</div>
              <div className="home-compare-option home-compare-option-b" />
            </div>
          </article>
        </aside>
      </section>

      <section id="home-fit" className="panel home-fit-panel raven-target" style={{ marginTop: 18 }}>
        <div className="planner-section-header">
          <div className="stack">
            <span className="home-kicker">Built for</span>
            <h2 className="section-title">Retailers and brands that help people redesign their space.</h2>
          </div>
          <span className="small-note">When shoppers can picture the result, they decide faster.</span>
        </div>

        <div className="chip-row home-audience-strip">
          {audienceGroups.map((group) => (
            <span key={group} className="chip">
              {group}
            </span>
          ))}
        </div>

        <div className="home-value-grid">
          {valueTiles.map((tile) => (
            <article key={tile.label} className="feature-card home-value-card">
              <span className="home-card-icon" aria-hidden="true">
                <HomeGlyph kind={tile.icon} />
              </span>
              <h3>{tile.label}</h3>
              <span className="small-note">{tile.meta}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel home-flow-panel" style={{ marginTop: 18 }}>
        <div className="home-flow-grid">
          {flowTiles.map((tile) => (
            <article key={tile.step} className="feature-card home-flow-tile">
              <div className={`home-flow-visual home-flow-visual-${tile.visual}`}>
                <span className="home-card-icon home-card-icon-strong" aria-hidden="true">
                  <HomeGlyph kind={tile.icon} />
                </span>
                <FlowVisual kind={tile.visual} />
              </div>
              <span className="home-flow-step">{tile.step}</span>
              <h3>{tile.label}</h3>
              <span className="small-note">{tile.meta}</span>
              <span className="home-flow-detail">{tile.detail}</span>
            </article>
          ))}
        </div>
      </section>

      <section id="brand-demos" className="panel raven-target home-brand-panel" style={{ marginTop: 18 }}>
        <div className="planner-section-header">
          <h2 className="section-title">For your brand</h2>
          <span className="small-note">Upload your logo, set your colors, and see the branded experience instantly.</span>
        </div>

        <div className="home-brand-proposition">
          {propositionTiles.map((tile) => (
            <article key={tile.label} className="feature-card home-brand-proposition-card">
              <span className="home-card-icon" aria-hidden="true">
                <HomeGlyph kind={tile.icon} />
              </span>
              <h3>{tile.label}</h3>
              <span className="small-note">{tile.meta}</span>
            </article>
          ))}
        </div>

        <HomeBrandStudio
          initialBrandName="Your brand"
          initialPrimaryColor={demos[0]?.tenant.brandTheme.primaryColor ?? "#d97706"}
          initialSecondaryColor={demos[0]?.tenant.brandTheme.secondaryColor ?? "#0f172a"}
        />

        <div className="home-brand-grid">
          {demos.map((demo) => {
            return (
              <Link
                key={demo.slug}
                className="feature-card home-brand-card"
                href={demo.href}
              >
                <div
                  className="home-brand-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${demo.tenant.brandTheme.primaryColor}, ${demo.tenant.brandTheme.secondaryColor})`
                  }}
                />
                <span className="home-brand-name">{demo.label}</span>
                <span className="small-note">{demo.note}</span>
                <span className="chip">Open demo</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function HomeGlyph({ kind }: { kind: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (kind) {
    case "camera":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 8.5h3l1.4-2h7.2l1.4 2H20a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 20 18.5H4A1.5 1.5 0 0 1 2.5 17v-7A1.5 1.5 0 0 1 4 8.5Z" />
          <circle {...common} cx="12" cy="13" r="3.25" />
        </svg>
      );
    case "swatches":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M5 4.5h6v6H5Z" />
          <path {...common} d="M13 4.5h6v6h-6Z" />
          <path {...common} d="M5 13.5h6V19H5Z" />
          <path {...common} d="M13 13.5h6V19h-6Z" />
        </svg>
      );
    case "sparkles":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1L6.5 8.5l4.1-1.4Z" />
          <path {...common} d="m18.5 14 0.8 2.2 2.2 0.8-2.2 0.8-0.8 2.2-0.8-2.2-2.2-0.8 2.2-0.8Z" />
          <path {...common} d="m5.5 14 0.9 2.5 2.6 0.9-2.6 0.9-0.9 2.5-0.9-2.5-2.6-0.9 2.6-0.9Z" />
        </svg>
      );
    case "trophy":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M8 4.5h8v3a4 4 0 0 1-8 0Z" />
          <path {...common} d="M8 6H5.5A1.5 1.5 0 0 0 4 7.5 3.5 3.5 0 0 0 7.5 11H8" />
          <path {...common} d="M16 6h2.5A1.5 1.5 0 0 1 20 7.5 3.5 3.5 0 0 1 16.5 11H16" />
          <path {...common} d="M12 11.5v4" />
          <path {...common} d="M9 19.5h6" />
        </svg>
      );
    case "eye":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
          <circle {...common} cx="12" cy="12" r="2.75" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M13.5 2.5 6.5 12h4l-0.5 9.5 7-10h-4Z" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 19.5h16" />
          <path {...common} d="m6 15 4-4 3 3 5-6" />
          <path {...common} d="M18 8h0.5v0.5" />
        </svg>
      );
    case "browser":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect {...common} x="3" y="5" width="18" height="14" rx="2" />
          <path {...common} d="M3 8.5h18" />
          <path {...common} d="M6 6.75h0.01" />
          <path {...common} d="M8.5 6.75h0.01" />
        </svg>
      );
    case "storefront":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 9.5 5.5 5h13L20 9.5" />
          <path {...common} d="M5 9.5h14v9H5Z" />
          <path {...common} d="M9 13.5h6v5H9Z" />
        </svg>
      );
    case "palette":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M12 3.5c-4.9 0-8.5 3.3-8.5 7.8 0 4 3.2 7.2 7.2 7.2h1.1a1.7 1.7 0 0 0 0-3.4h-0.6a1.4 1.4 0 0 1 0-2.8H12c4.7 0 8.5-3 8.5-7 0-4.3-3.9-7.8-8.5-7.8Z" />
          <path {...common} d="M8 9.5h0.01" />
          <path {...common} d="M11 7.5h0.01" />
          <path {...common} d="M15 8.5h0.01" />
          <path {...common} d="M16 12h0.01" />
        </svg>
      );
    default:
      return null;
  }
}

function FlowVisual({ kind }: { kind: string }) {
  switch (kind) {
    case "upload":
      return (
        <div className="flow-visual-upload" aria-hidden="true">
          <div className="flow-upload-frame">
            <div className="flow-upload-wall" />
            <div className="flow-upload-floor" />
            <div className="flow-upload-vanity" />
            <div className="flow-upload-window" />
          </div>
          <div className="flow-upload-corners" />
        </div>
      );
    case "reference":
      return <ReferenceBoard />;
    case "keep":
      return (
        <div className="flow-visual-keep" aria-hidden="true">
          <div className="flow-keep-card flow-keep-card-a" />
          <div className="flow-keep-card flow-keep-card-b" />
          <div className="flow-keep-card flow-keep-card-selected">
            <div className="flow-keep-badge">Keep</div>
          </div>
        </div>
      );
    case "compare":
      return (
        <div className="flow-visual-compare" aria-hidden="true">
          <div className="flow-compare-card flow-compare-card-a" />
          <div className="flow-compare-versus">VS</div>
          <div className="flow-compare-card flow-compare-card-b" />
        </div>
      );
    default:
      return null;
  }
}

function InspirationBoard() {
  return (
    <div className="home-inspiration-board" aria-hidden="true">
      <div className="home-inspiration-card home-inspiration-card-tiles">
        <div className="inspiration-card-label">Tiles</div>
        <div className="inspiration-tile-grid" />
        <div className="inspiration-tile-chip-row">
          <span className="inspiration-finish-chip inspiration-finish-chip-stone" />
          <span className="inspiration-finish-chip inspiration-finish-chip-oak" />
          <span className="inspiration-finish-chip inspiration-finish-chip-brass" />
        </div>
        <div className="inspiration-tile-ring" />
      </div>

      <div className="home-inspiration-card home-inspiration-card-fixtures">
        <div className="inspiration-card-label">Fixtures</div>
        <div className="inspiration-faucet-neck" />
        <div className="inspiration-faucet-spout" />
        <div className="inspiration-faucet-base" />
        <div className="inspiration-shower-rail" />
        <div className="inspiration-shower-head" />
      </div>

      <div className="home-inspiration-card home-inspiration-card-vanity">
        <div className="inspiration-card-label">Vanity + finish</div>
        <div className="inspiration-vanity-mirror" />
        <div className="inspiration-vanity-shelf" />
        <div className="inspiration-vanity-basin" />
        <div className="inspiration-folded-towel" />
        <div className="inspiration-finish-chip-row">
          <span className="inspiration-finish-chip inspiration-finish-chip-stone" />
          <span className="inspiration-finish-chip inspiration-finish-chip-oak" />
          <span className="inspiration-finish-chip inspiration-finish-chip-brass" />
        </div>
      </div>
    </div>
  );
}

function ReferenceBoard() {
  return (
    <div className="flow-visual-reference" aria-hidden="true">
      <div className="flow-reference-board">
        <div className="flow-reference-hero">
          <div className="flow-reference-hero-label">Reference board</div>
          <div className="flow-reference-hero-tiles" />
          <div className="flow-reference-hero-slab" />
          <div className="flow-reference-hero-ring" />
          <div className="flow-reference-chip-row">
            <span className="flow-reference-chip flow-reference-chip-stone" />
            <span className="flow-reference-chip flow-reference-chip-oak" />
            <span className="flow-reference-chip flow-reference-chip-brass" />
          </div>
        </div>

        <div className="flow-reference-side">
          <div className="flow-reference-mini flow-reference-mini-faucet">
            <div className="flow-reference-mini-label">Fixture</div>
            <div className="flow-reference-faucet-neck" />
            <div className="flow-reference-faucet-spout" />
            <div className="flow-reference-faucet-base" />
            <div className="flow-reference-shower-rail" />
            <div className="flow-reference-shower-head" />
          </div>

          <div className="flow-reference-mini flow-reference-mini-vanity">
            <div className="flow-reference-mini-label">Object</div>
            <div className="flow-reference-mirror" />
            <div className="flow-reference-vanity" />
            <div className="flow-reference-towel" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomExampleVisual({ kind }: { kind: string }) {
  switch (kind) {
    case "bathroom":
      return (
        <>
          <div className="room-example-wall" />
          <div className="room-example-floor" />
          <div className="room-example-bath" />
          <div className="room-example-vanity" />
        </>
      );
    case "kitchen":
      return (
        <>
          <div className="room-example-wall" />
          <div className="room-example-floor" />
          <div className="room-example-counter" />
          <div className="room-example-cabinet" />
          <div className="room-example-hob" />
        </>
      );
    case "living-room":
      return (
        <>
          <div className="room-example-wall" />
          <div className="room-example-floor" />
          <div className="room-example-sofa" />
          <div className="room-example-table" />
          <div className="room-example-lamp" />
        </>
      );
    case "office":
      return (
        <>
          <div className="room-example-wall" />
          <div className="room-example-floor" />
          <div className="room-example-desk" />
          <div className="room-example-screen" />
          <div className="room-example-chair" />
        </>
      );
    default:
      return null;
  }
}
