import type Database from "better-sqlite3";

import { ROOM_TEMPLATE } from "@/lib/constants";
import { nowIso } from "@/lib/utils";

function buildLogoDataUrl(label: string, primaryColor: string, secondaryColor: string) {
  const initials = label
    .split(" ")
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="72" viewBox="0 0 240 72">
      <rect width="240" height="72" rx="18" fill="${primaryColor}" />
      <circle cx="36" cy="36" r="18" fill="${secondaryColor}" />
      <text x="36" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#0f172a">${initials}</text>
      <text x="68" y="44" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff">${label}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function seedDatabase(db: Database.Database) {
  const templateCount = db.prepare("SELECT COUNT(*) as count FROM room_templates").get() as { count: number };

  if (templateCount.count === 0) {
    db.prepare(
      `
        INSERT INTO room_templates (
          id,
          room_type,
          name,
          rules_json,
          created_at
        ) VALUES (
          @id,
          @roomType,
          @name,
          @rulesJson,
          @createdAt
        )
      `
    ).run({
      id: ROOM_TEMPLATE.id,
      roomType: ROOM_TEMPLATE.roomType,
      name: ROOM_TEMPLATE.name,
      rulesJson: JSON.stringify(ROOM_TEMPLATE.rules),
      createdAt: nowIso()
    });
  }

  const insertTenant = db.prepare(`
    INSERT INTO tenants (
      id,
      name,
      slug,
      default_locale,
      supported_locales_json,
      enabled_room_types_json,
      category_links_json,
      logo_data_url,
      primary_color,
      secondary_color,
      accent_color,
      surface_color,
      font_family,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @name,
      @slug,
      @defaultLocale,
      @supportedLocalesJson,
      @enabledRoomTypesJson,
      @categoryLinksJson,
      @logoDataUrl,
      @primaryColor,
      @secondaryColor,
      @accentColor,
      @surfaceColor,
      @fontFamily,
      @createdAt,
      @updatedAt
    )
  `);

  const createdAt = nowIso();
  const seedTenants = [
    {
      id: "praxis-demo",
      name: "Praxis Demo",
      slug: "praxis-demo",
      defaultLocale: "en",
      supportedLocalesJson: JSON.stringify(["en", "nl"]),
      enabledRoomTypesJson: JSON.stringify(["bathroom"]),
      categoryLinksJson: JSON.stringify({
        toilet: "https://www.praxis.nl/badkamer-sanitair/toiletten",
        sink: "https://www.praxis.nl/badkamer-sanitair/wastafels",
        shower: "https://www.praxis.nl/badkamer-sanitair/douches",
        bath: "https://www.praxis.nl/badkamer-sanitair/baden"
      }),
      logoDataUrl: buildLogoDataUrl("Praxis", "#f97316", "#fde68a"),
      primaryColor: "#f97316",
      secondaryColor: "#082f49",
      accentColor: "#facc15",
      surfaceColor: "#fff7ed",
      fontFamily: "Space Grotesk, sans-serif",
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "hornbach-demo",
      name: "Hornbach Demo",
      slug: "hornbach-demo",
      defaultLocale: "en",
      supportedLocalesJson: JSON.stringify(["en", "nl"]),
      enabledRoomTypesJson: JSON.stringify(["bathroom"]),
      categoryLinksJson: JSON.stringify({
        toilet: "https://www.hornbach.nl/c/badkamer-sanitair/toiletten/S18622/",
        sink: "https://www.hornbach.nl/c/badkamer-sanitair/wastafels/S18637/",
        shower: "https://www.hornbach.nl/c/badkamer-sanitair/douches/S18630/",
        bath: "https://www.hornbach.nl/c/badkamer-sanitair/baden/S18624/"
      }),
      logoDataUrl: buildLogoDataUrl("Hornbach", "#f97316", "#111827"),
      primaryColor: "#ea580c",
      secondaryColor: "#111827",
      accentColor: "#fb923c",
      surfaceColor: "#fff7ed",
      fontFamily: "IBM Plex Sans, sans-serif",
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "ikea-demo",
      name: "Ikea-Style Demo",
      slug: "ikea-demo",
      defaultLocale: "en",
      supportedLocalesJson: JSON.stringify(["en", "nl"]),
      enabledRoomTypesJson: JSON.stringify(["bathroom"]),
      categoryLinksJson: JSON.stringify({
        toilet: "https://www.ikea.com/nl/en/cat/bathroom-toilets-49170/",
        sink: "https://www.ikea.com/nl/en/cat/bathroom-sinks-20724/",
        shower: "https://www.ikea.com/nl/en/cat/shower-accessories-20729/",
        bath: "https://www.ikea.com/nl/en/cat/bathroom-furniture-10464/"
      }),
      logoDataUrl: buildLogoDataUrl("Ikea", "#1d4ed8", "#facc15"),
      primaryColor: "#1d4ed8",
      secondaryColor: "#0f172a",
      accentColor: "#facc15",
      surfaceColor: "#eff6ff",
      fontFamily: "Avenir Next, sans-serif",
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "roomraven-consumer",
      name: "RoomRaven Free",
      slug: "roomraven-free",
      defaultLocale: "en",
      supportedLocalesJson: JSON.stringify(["en", "nl"]),
      enabledRoomTypesJson: JSON.stringify(["bathroom", "kitchen", "living-room", "office", "bedroom"]),
      categoryLinksJson: JSON.stringify({
        toilet: "https://www.roomraven.com/ideas/bathroom",
        sink: "https://www.roomraven.com/ideas/bathroom",
        shower: "https://www.roomraven.com/ideas/bathroom",
        bath: "https://www.roomraven.com/ideas/bathroom"
      }),
      logoDataUrl: null,
      primaryColor: "#0f172a",
      secondaryColor: "#1e293b",
      accentColor: "#f59e0b",
      surfaceColor: "#f8fafc",
      fontFamily: "Space Grotesk, sans-serif",
      createdAt,
      updatedAt: createdAt
    }
  ] as const;

  const insertCatalogImport = db.prepare(`
    INSERT INTO catalog_imports (
      id,
      tenant_id,
      name,
      raw_json,
      imported_at
    ) VALUES (
      @id,
      @tenantId,
      @name,
      @rawJson,
      @importedAt
    )
  `);

  const insertEvent = db.prepare(`
    INSERT INTO analytics_events (
      id,
      tenant_id,
      session_id,
      room_type,
      locale,
      event_type,
      metadata_json,
      created_at
    ) VALUES (
      @id,
      @tenantId,
      NULL,
      'bathroom',
      @locale,
      'seeded_demo',
      '{}',
      @createdAt
    )
  `);

  const existingTenantIds = new Set(
    (db.prepare("SELECT id FROM tenants").all() as Array<{ id: string }>).map((row) => row.id)
  );

  for (const tenant of seedTenants) {
    if (existingTenantIds.has(tenant.id)) {
      continue;
    }

    insertTenant.run(tenant);
    insertCatalogImport.run({
      id: `${tenant.id}-catalog`,
      tenantId: tenant.id,
      name: `${tenant.name} starter catalog`,
      rawJson: JSON.stringify({
        mappings: {
          toilet: {
            label: "Toilet package",
            categoryUrl: JSON.parse(tenant.categoryLinksJson).toilet,
            note: "Wall-hung or floorstanding toilet package."
          },
          sink: {
            label: "Vanity and sink set",
            categoryUrl: JSON.parse(tenant.categoryLinksJson).sink,
            note: "Vanity unit with sink and tap cut-out."
          },
          shower: {
            label: "Walk-in shower package",
            categoryUrl: JSON.parse(tenant.categoryLinksJson).shower,
            note: "Shower tray, enclosure, and mixer set."
          },
          bath: {
            label: "Bathtub package",
            categoryUrl: JSON.parse(tenant.categoryLinksJson).bath,
            note: "Bath shell with matching tapware options."
          }
        }
      }),
      importedAt: createdAt
    });
    insertEvent.run({
      id: `${tenant.id}-seeded`,
      tenantId: tenant.id,
      locale: tenant.defaultLocale,
      createdAt
    });
  }
}
