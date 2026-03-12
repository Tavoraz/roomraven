import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://www.roomraven.com";
const DEFAULT_OG_IMAGE_PATH = "/home/GeneratedConcept.png";

export const siteName = "RoomRaven";
export const defaultTitle = "RoomRaven | AI Room Planning for Retailers and Homeowners";
export const defaultDescription =
  "RoomRaven helps people upload a room, add inspiration, and compare AI-generated concepts. Brands can launch it as a white-label room planner or embed it on their own website.";
export const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_BASE_URL);

function resolveSiteUrl(value: string | undefined) {
  if (!value) {
    return new URL(FALLBACK_SITE_URL);
  }

  try {
    return new URL(value);
  } catch {
    try {
      return new URL(`https://${value}`);
    } catch {
      return new URL(FALLBACK_SITE_URL);
    }
  }
}

function buildRobots(noIndex: boolean): Metadata["robots"] {
  if (noIndex) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true
      }
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  };
}

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  imagePath = DEFAULT_OG_IMAGE_PATH,
  noIndex = false
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  imagePath?: string;
  noIndex?: boolean;
}): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(imagePath);
  const metadata: Metadata = {
    title,
    description,
    keywords,
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    },
    robots: buildRobots(noIndex)
  };

  if (!noIndex) {
    metadata.alternates = {
      canonical
    };
    metadata.openGraph = {
      ...metadata.openGraph,
      url: canonical
    };
  }

  return metadata;
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/roomraven-logo.png"),
    description: defaultDescription
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: absoluteUrl("/"),
    description: defaultDescription,
    inLanguage: "en"
  };
}

export function buildSoftwareApplicationSchema({
  name = siteName,
  path,
  description,
  applicationCategory,
  audienceType,
  featureList,
  imagePath = DEFAULT_OG_IMAGE_PATH,
  offer
}: {
  name?: string;
  path: string;
  description: string;
  applicationCategory: string;
  audienceType?: string;
  featureList?: string[];
  imagePath?: string;
  offer?: {
    price: string;
    priceCurrency: string;
  };
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    url: absoluteUrl(path),
    description,
    applicationCategory,
    operatingSystem: "Web",
    image: absoluteUrl(imagePath),
    brand: {
      "@type": "Brand",
      name: siteName
    }
  };

  if (audienceType) {
    schema.audience = {
      "@type": "Audience",
      audienceType
    };
  }

  if (featureList?.length) {
    schema.featureList = featureList;
  }

  if (offer) {
    schema.offers = {
      "@type": "Offer",
      price: offer.price,
      priceCurrency: offer.priceCurrency,
      url: absoluteUrl(path)
    };
    schema.isAccessibleForFree = offer.price === "0";
  }

  return schema;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function buildFaqSchema(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer
      }
    }))
  };
}
