import Image from "next/image";
import Link from "next/link";

import { HomeBrandStudio } from "@/components/home-brand-studio";
import { HomeRotatingValue } from "@/components/home-rotating-value";
import { RoomRavenBadge } from "@/components/roomraven-badge";
import { ScrollCta } from "@/components/scroll-cta";
import { buildPublicDemoHref, getDefaultDemoVariant } from "@/lib/demo-variants";

export const dynamic = "force-dynamic";

const roomTypes = [
  {
    label: "Bathroom",
    image: "/home/Bathroom.png",
    alt: "Soft neutral bathroom concept with a freestanding tub and light wood finishes"
  },
  {
    label: "Kitchen",
    image: "/home/Kitchen.png",
    alt: "Warm minimalist kitchen concept with rounded island edges and white cabinetry"
  },
  {
    label: "Living room",
    image: "/home/LivingRoom.png",
    alt: "Calm living room concept with a soft sofa, rounded table, and warm accents"
  },
  {
    label: "Office",
    image: "/home/Office.png",
    alt: "Minimal home office concept with a desk setup in a soft neutral palette"
  }
] as const;
const audienceGroups = ["Bathroom retailers", "Kitchen studios", "Interior showrooms", "Renovation specialists"];
const flowTiles = [
  {
    step: "01",
    label: "Upload",
    meta: "Current room",
    detail: "Photo of the existing space",
    icon: "camera",
    visual: "upload",
    image: "/home/Upload.png",
    alt: "A room photo framed as an upload preview inside a mobile camera interface"
  },
  {
    step: "02",
    label: "Reference",
    meta: "Products + finishes",
    detail: "Objects, finishes, colors",
    icon: "swatches",
    visual: "reference",
    image: "/home/Reference.png",
    alt: "A reference board with tiles, finishes, fixtures, and furniture choices"
  },
  {
    step: "03",
    label: "Keep",
    meta: "Best concepts",
    detail: "Save strong AI options",
    icon: "sparkles",
    visual: "keep",
    image: "/home/GeneratedConcept.png",
    alt: "A generated room concept showing the selected direction brought to life"
  },
  {
    step: "04",
    label: "1v1",
    meta: "Winner stays",
    detail: "Compare until one wins",
    icon: "trophy",
    visual: "compare",
    image: "/home/LivingRoom.png",
    alt: "Two saved concepts ready for a winner-stays comparison"
  }
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
  "turn inspiration into higher-intent conversions.",
  "shorten the path from idea to purchase.",
  "keep shoppers planning on your own website.",
  "make renovation decisions feel easier and safer."
];

export default function HomePage() {
  const primaryDemoHref = buildPublicDemoHref(getDefaultDemoVariant());

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
                  <HomeVisualFrame
                    className="home-room-example-visual"
                    src={roomType.image}
                    alt={roomType.alt}
                    sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 18vw"
                  />
                  <span className="home-room-example-label">{roomType.label}</span>
                </article>
              ))}
            </div>
          </div>
          <div id="home-actions" className="cta-row raven-target">
            <Link className="cta cta-primary" href={primaryDemoHref}>
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
            <HomeVisualFrame
              className="home-scene-media"
              src="/home/CurrentRoom.png"
              alt="Current room photo showing an empty soft-neutral space before redesign"
              sizes="(max-width: 960px) 100vw, 32vw"
              priority
            />
          </article>

          <article className="home-scene-card home-scene-inspiration">
            <span className="home-scene-kicker">Inspiration</span>
            <HomeVisualFrame
              className="home-scene-media"
              src="/home/Inspiration.png"
              alt="Inspiration board with tiles, wood samples, fittings, and material references"
              sizes="(max-width: 960px) 100vw, 26vw"
              priority
            />
          </article>

          <article className="home-scene-card home-scene-generated">
            <span className="home-scene-kicker">Generated concept</span>
            <HomeVisualFrame
              className="home-scene-media"
              src="/home/GeneratedConcept.png"
              alt="Generated concept showing a completed living room in soft natural tones"
              sizes="(max-width: 960px) 100vw, 32vw"
              priority
            />
          </article>

          <article className="home-scene-card home-scene-compare">
            <span className="home-scene-kicker">1v1 compare</span>
            <HomeComparePreview
              leftSrc="/home/GeneratedConcept.png"
              leftAlt="Generated concept option A"
              rightSrc="/home/LivingRoom.png"
              rightAlt="Generated concept option B"
              sizes="(max-width: 960px) 100vw, 24vw"
              priority
            />
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
                {tile.visual === "compare" ? (
                  <HomeComparePreview
                    compact
                    leftSrc="/home/GeneratedConcept.png"
                    leftAlt="Comparison option A"
                    rightSrc="/home/LivingRoom.png"
                    rightAlt="Comparison option B"
                    sizes="(max-width: 960px) 100vw, 18vw"
                  />
                ) : (
                  <HomeVisualFrame
                    className="home-flow-image"
                    src={tile.image}
                    alt={tile.alt}
                    sizes="(max-width: 960px) 100vw, 18vw"
                  />
                )}
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
          initialPrimaryColor="#d97706"
          initialSecondaryColor="#0f172a"
        />
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

function HomeVisualFrame({
  src,
  alt,
  className,
  sizes,
  priority = false
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className={["home-visual-frame", className].filter(Boolean).join(" ")}>
      <Image src={src} alt={alt} fill sizes={sizes} className="home-visual-image" priority={priority} />
    </div>
  );
}

function HomeComparePreview({
  leftSrc,
  leftAlt,
  rightSrc,
  rightAlt,
  sizes,
  priority = false,
  compact = false
}: {
  leftSrc: string;
  leftAlt: string;
  rightSrc: string;
  rightAlt: string;
  sizes: string;
  priority?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`home-compare-stage${compact ? " home-compare-stage-compact" : ""}`}>
      <HomeVisualFrame className="home-compare-option" src={leftSrc} alt={leftAlt} sizes={sizes} priority={priority} />
      <div className="home-compare-vs">VS</div>
      <HomeVisualFrame className="home-compare-option" src={rightSrc} alt={rightAlt} sizes={sizes} priority={priority} />
    </div>
  );
}
