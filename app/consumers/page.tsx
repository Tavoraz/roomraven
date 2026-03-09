import Image from "next/image";
import Link from "next/link";

import { AudienceMenu } from "@/components/audience-menu";
import { ConsumerPricingCard } from "@/components/consumer-pricing-card";

const consumerPlannerHref = "/planner?tenantId=roomraven-consumer&audience=consumer&locale=en&roomType=living-room";

const consumerBenefits = [
  {
    title: "Try ideas before you spend",
    note: "See a new look in your own room before you buy paint, tiles, furniture, or decor."
  },
  {
    title: "Use your own room photo",
    note: "Upload the space as it looks now, then add finishes, colors, or products you are considering."
  },
  {
    title: "One free concept every day",
    note: "Generate one concept per day for free, keep the ones you like, and compare favorites on this device."
  }
];

const consumerSteps = [
  {
    step: "01",
    title: "Upload your room",
    note: "Start with a photo of the room as it looks today.",
    image: "/home/CurrentRoom.png",
    alt: "An empty living room ready for redesign"
  },
  {
    step: "02",
    title: "Add inspiration",
    note: "Upload references like paint colors, tiles, a sofa, a chair, lighting, or a vanity.",
    image: "/home/Inspiration.png",
    alt: "A neutral inspiration board with finishes, tiles, and objects"
  },
  {
    step: "03",
    title: "Generate your concept",
    note: "RoomRaven turns your room photo and references into one clear visual direction.",
    image: "/home/GeneratedConcept.png",
    alt: "A generated living room concept"
  },
  {
    step: "04",
    title: "Keep and compare",
    note: "Save your favorites and run 1v1 comparisons until one design wins.",
    image: "/home/LivingRoom.png",
    alt: "A second living room concept for comparison"
  }
];

export default function ConsumersPage() {
  return (
    <main className="page-shell">
      <AudienceMenu current="consumer" />

      <section className="hero-grid consumer-hero-grid">
        <div className="panel home-hero-copy consumer-hero-copy">
          <span className="home-kicker">For consumers</span>
          <h1 className="headline">See your room before you spend money.</h1>
          <p className="lead consumer-lead">
            Upload your room, add inspiration, and generate one free concept each day to test ideas with more confidence.
          </p>
          <div className="chip-row">
            <span className="chip active">Free to use</span>
            <span className="chip">1 concept per day</span>
          </div>
          <div className="cta-row">
            <Link className="cta cta-primary" href={consumerPlannerHref}>
              Try it free
            </Link>
            <Link className="cta cta-secondary" href="#consumer-flow">
              See how it works
            </Link>
          </div>
          <p className="small-note consumer-note">
            Best for planning a bathroom, kitchen, living room, office, or bedroom before making real changes.
          </p>
        </div>

        <aside className="panel hero-visual consumer-hero-visual">
          <div className="consumer-hero-collage">
            <article className="consumer-scene-card consumer-scene-card-large">
              <span className="home-scene-kicker">Your room now</span>
              <div className="home-visual-frame consumer-scene-media">
                <Image
                  src="/home/CurrentRoom.png"
                  alt="An empty room photo before redesign"
                  fill
                  sizes="(max-width: 960px) 100vw, 36vw"
                  className="home-visual-image"
                  priority
                />
              </div>
            </article>
            <article className="consumer-scene-card">
              <span className="home-scene-kicker">Inspiration</span>
              <div className="home-visual-frame consumer-scene-media consumer-scene-media-tall">
                <Image
                  src="/home/Reference.png"
                  alt="Reference board with finishes and objects"
                  fill
                  sizes="(max-width: 960px) 100vw, 18vw"
                  className="home-visual-image"
                  priority
                />
              </div>
            </article>
            <article className="consumer-scene-card">
              <span className="home-scene-kicker">Your concept</span>
              <div className="home-visual-frame consumer-scene-media consumer-scene-media-tall">
                <Image
                  src="/home/GeneratedConcept.png"
                  alt="Generated room concept"
                  fill
                  sizes="(max-width: 960px) 100vw, 18vw"
                  className="home-visual-image"
                  priority
                />
              </div>
            </article>
          </div>
        </aside>
      </section>

      <ConsumerPricingCard plannerHref={consumerPlannerHref} />

      <section className="panel consumer-benefits-panel" style={{ marginTop: 18 }}>
        <div className="planner-section-header">
          <div className="stack">
            <span className="home-kicker">Why people use it</span>
            <h2 className="section-title">Make design decisions with less guesswork.</h2>
          </div>
          <span className="small-note">Useful when you want to test finishes, furniture, layout ideas, or a full new look.</span>
        </div>
        <div className="home-value-grid">
          {consumerBenefits.map((benefit) => (
            <article key={benefit.title} className="feature-card home-value-card consumer-benefit-card">
              <h3>{benefit.title}</h3>
              <span className="small-note">{benefit.note}</span>
            </article>
          ))}
        </div>
      </section>

      <section id="consumer-flow" className="panel consumer-flow-panel" style={{ marginTop: 18 }}>
        <div className="planner-section-header">
          <div className="stack">
            <span className="home-kicker">How it works</span>
            <h2 className="section-title">A simple free workflow for trying room ideas.</h2>
          </div>
          <span className="small-note">Keep the concepts you like on this device and compare them later.</span>
        </div>

        <div className="consumer-step-grid">
          {consumerSteps.map((step) => (
            <article key={step.step} className="feature-card consumer-step-card">
              <div className="home-visual-frame consumer-step-image">
                <Image src={step.image} alt={step.alt} fill sizes="(max-width: 960px) 100vw, 22vw" className="home-visual-image" />
              </div>
              <span className="home-flow-step">{step.step}</span>
              <h3>{step.title}</h3>
              <span className="small-note">{step.note}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel consumer-compare-panel" style={{ marginTop: 18 }}>
        <div className="consumer-compare-layout">
          <div className="stack">
            <span className="home-kicker">Compare favorites</span>
            <h2 className="section-title">When you have two or more ideas, pick the winner.</h2>
            <p className="lead">
              RoomRaven can show your saved concepts side by side in a winner-stays 1v1 flow so it is easier to land on the look you actually prefer.
            </p>
            <Link className="cta cta-primary" href={consumerPlannerHref}>
              Start with your free concept
            </Link>
          </div>

          <div className="home-compare-stage">
            <div className="home-visual-frame home-compare-option">
              <Image
                src="/home/GeneratedConcept.png"
                alt="Comparison option A"
                fill
                sizes="(max-width: 960px) 100vw, 20vw"
                className="home-visual-image"
              />
            </div>
            <div className="home-compare-vs">VS</div>
            <div className="home-visual-frame home-compare-option">
              <Image
                src="/home/LivingRoom.png"
                alt="Comparison option B"
                fill
                sizes="(max-width: 960px) 100vw, 20vw"
                className="home-visual-image"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
