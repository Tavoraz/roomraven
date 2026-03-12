import Image from "next/image";
import Link from "next/link";

import { AudienceMenu } from "@/components/audience-menu";
import { ConsumerPricingCard } from "@/components/consumer-pricing-card";
import { HomeRotatingValue } from "@/components/home-rotating-value";
import {
  buildFaqSchema,
  buildOrganizationSchema,
  buildPageMetadata,
  buildSoftwareApplicationSchema
} from "@/lib/seo";

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
const consumerHeroValueMessages = [
  "see a new look in your own room before you buy.",
  "test bathroom, kitchen, living room, and office ideas with less guesswork.",
  "compare a few directions and keep the one that feels right.",
  "feel more confident before spending on products or renovation work."
];
const pageTitle = "Free AI Room Planner for Homeowners | RoomRaven";
const pageDescription =
  "Upload your room photo, add inspiration, and generate one free AI room concept each day. Try bathroom, kitchen, living room, bedroom, and office ideas before you spend.";
const pageKeywords = [
  "free AI room planner",
  "room visualizer",
  "bathroom design app",
  "kitchen inspiration planner",
  "living room makeover tool",
  "interior design visualizer"
];
const consumerFeatures = [
  "Upload your own room photo",
  "Add finishes, furniture, or inspiration references",
  "Generate one free AI room concept per day",
  "Save your favorite concepts on this device",
  "Compare room ideas side by side"
];
const consumerFaqEntries = [
  {
    question: "How do I try RoomRaven for free?",
    answer:
      "Open the free planner, upload a room photo, add inspiration, and RoomRaven will generate one free concept each day on this device."
  },
  {
    question: "What rooms can I plan with RoomRaven?",
    answer:
      "People use RoomRaven for bathroom, kitchen, living room, bedroom, and home office ideas. The goal is to test a new look before spending on products or renovation work."
  },
  {
    question: "Do I need design experience to use it?",
    answer:
      "No. The workflow is made for homeowners and renovators who want to upload a room, add a few references, and quickly see a more realistic direction."
  },
  {
    question: "Can I compare different room ideas?",
    answer:
      "Yes. You can keep your favorite concepts and use RoomRaven's 1v1 comparison flow to narrow them down until one option wins."
  }
] as const;
const consumerStructuredData = [
  buildOrganizationSchema(),
  buildSoftwareApplicationSchema({
    name: "RoomRaven Free",
    path: "/consumers",
    description: pageDescription,
    applicationCategory: "DesignApplication",
    audienceType: "Homeowners and renovators",
    featureList: consumerFeatures,
    offer: {
      price: "0",
      priceCurrency: "USD"
    }
  }),
  buildFaqSchema([...consumerFaqEntries])
];

export const metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/consumers",
  keywords: pageKeywords
});

export default function ConsumersPage() {
  return (
    <main className="page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(consumerStructuredData) }} />
      <AudienceMenu current="consumer" />

      <section className="hero-grid consumer-hero-grid">
        <div className="panel home-hero-copy consumer-hero-copy">
          <span className="home-kicker">For consumers</span>
          <h1 className="headline">See your room before you spend money.</h1>
          <HomeRotatingValue messages={consumerHeroValueMessages} />
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
              <span className="home-scene-caption">Your room now</span>
            </article>
            <article className="consumer-scene-card">
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
              <span className="home-scene-caption">Inspiration</span>
            </article>
            <article className="consumer-scene-card">
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
              <span className="home-scene-caption">Your concept</span>
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

      <section className="panel faq-panel" style={{ marginTop: 18 }}>
        <div className="planner-section-header faq-section-header">
          <div className="stack faq-section-copy">
            <span className="home-kicker">Common questions</span>
            <h2 className="section-title faq-title">The basics people search for before trying a free room planner.</h2>
          </div>
          <span className="small-note faq-note">Clear answers help both search engines and AI assistants describe the product correctly.</span>
        </div>

        <div className="faq-grid">
          {consumerFaqEntries.map((entry) => (
            <details key={entry.question} className="faq-item" name="consumer-faq">
              <summary className="faq-question">{entry.question}</summary>
              <p className="small-note faq-answer">{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
