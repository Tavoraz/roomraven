import type { FixtureType, Locale } from "@/lib/types";

const translations = {
  en: {
    heroTitle: "RoomRaven",
    heroSubtitle: "AI-assisted room planning for retailers that want shoppers to choose faster and buy with more confidence.",
    launchDemo: "Open bathroom demo",
    adminConsole: "Open white-label admin",
    pricingBadge: "Managed pilot + annual license",
    plannerTitle: "Plan a bathroom in minutes",
    plannerIntro: "Set room dimensions, choose fixtures, compare design concepts, and save the winning layout.",
    dimensions: "Room dimensions",
    width: "Width",
    depth: "Depth",
    doorWall: "Door wall",
    doorOffset: "Door offset",
    windowWall: "Window wall",
    optionalWindow: "Optional window",
    fixtures: "Fixtures",
    generate: "Generate layouts",
    loading: "Generating concepts...",
    matchupTitle: "Pick your favorite",
    saveTitle: "Save your winning layout",
    saveDescription: "We will create a magic link to reopen the design and shopping list without an account.",
    email: "Email",
    createMagicLink: "Create magic link",
    shoppingList: "Shopping list",
    viewProject: "Open saved project",
    analytics: "Analytics",
    theme: "Brand theme",
    uploadCatalog: "Upload catalog mapping",
    updateTheme: "Update tenant settings",
    embedSnippet: "Embed snippet",
    optionCount: "8 generated options",
    fallbackNotice: "Rendered with 2D fallback"
  },
  nl: {
    heroTitle: "RoomRaven",
    heroSubtitle: "AI-ondersteunde ruimteplanning voor retailers die klanten sneller laten kiezen en zekerder laten kopen.",
    launchDemo: "Open badkamerdemo",
    adminConsole: "Open white-label beheer",
    pricingBadge: "Managed pilot + jaarlicentie",
    plannerTitle: "Plan een badkamer in minuten",
    plannerIntro: "Voer de afmetingen in, kies elementen, vergelijk ontwerpen en bewaar de winnaar.",
    dimensions: "Afmetingen",
    width: "Breedte",
    depth: "Diepte",
    doorWall: "Muur van de deur",
    doorOffset: "Deurpositie",
    windowWall: "Muur van het raam",
    optionalWindow: "Optioneel raam",
    fixtures: "Elementen",
    generate: "Genereer indelingen",
    loading: "Concepten worden gegenereerd...",
    matchupTitle: "Kies je favoriet",
    saveTitle: "Bewaar je winnende indeling",
    saveDescription: "We maken een magic link zodat het ontwerp en de shopping list later zonder account terug te openen zijn.",
    email: "E-mail",
    createMagicLink: "Maak magic link",
    shoppingList: "Shopping list",
    viewProject: "Open opgeslagen project",
    analytics: "Analytics",
    theme: "Brand theme",
    uploadCatalog: "Catalogusmapping uploaden",
    updateTheme: "Tenantinstellingen opslaan",
    embedSnippet: "Embed snippet",
    optionCount: "8 gegenereerde opties",
    fallbackNotice: "Gerenderd met 2D fallback"
  }
} satisfies Record<Locale, Record<string, string>>;

const fixtureLabels: Record<Locale, Record<FixtureType, string>> = {
  en: {
    toilet: "Toilet",
    sink: "Sink",
    shower: "Shower",
    bath: "Bath"
  },
  nl: {
    toilet: "Toilet",
    sink: "Wastafel",
    shower: "Douche",
    bath: "Bad"
  }
};

export function t(locale: Locale, key: keyof (typeof translations)["en"]) {
  return translations[locale][key] ?? translations.en[key];
}

export function fixtureLabel(locale: Locale, fixture: FixtureType) {
  return fixtureLabels[locale][fixture];
}
