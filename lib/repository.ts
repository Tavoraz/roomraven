import type Database from "better-sqlite3";

import { getDb } from "@/lib/db";
import { initializeTournament, advanceTournament } from "@/lib/tournament";
import type {
  AnalyticsSummary,
  CatalogImport,
  ComparisonVote,
  FixtureType,
  LayoutOption,
  LayoutSession,
  Locale,
  RoomTemplate,
  RoomType,
  SavedProject,
  SessionInput,
  ShoppingListItem,
  Tenant
} from "@/lib/types";
import { makeId, nowIso, safeJsonParse } from "@/lib/utils";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  default_locale: Locale;
  supported_locales_json: string;
  enabled_room_types_json: string;
  category_links_json: string;
  logo_data_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  surface_color: string;
  font_family: string;
  created_at: string;
  updated_at: string;
};

type SessionRow = {
  id: string;
  tenant_id: string;
  room_type: RoomType;
  locale: Locale;
  input_json: string;
  option_ids_json: string;
  tournament_state_json: string;
  status: LayoutSession["status"];
  winner_option_id: string | null;
  created_at: string;
  updated_at: string;
};

type LayoutOptionRow = {
  id: string;
  session_id: string;
  rank_index: number;
  score: number;
  render_mode: LayoutOption["renderMode"];
  image_url: string | null;
  fallback_svg: string;
  prompt: string;
  layout_json: string;
  created_at: string;
};

type CatalogImportRow = {
  id: string;
  tenant_id: string;
  name: string;
  raw_json: string;
  imported_at: string;
};

type SavedProjectRow = {
  id: string;
  session_id: string;
  token: string;
  email: string;
  locale: Locale;
  shopping_list_json: string;
  created_at: string;
};

type VoteRow = {
  id: string;
  session_id: string;
  round: number;
  matchup_index: number;
  left_option_id: string;
  right_option_id: string;
  winner_option_id: string;
  loser_option_id: string;
  created_at: string;
};

type AnalyticsRow = {
  locale: Locale;
  room_type: RoomType;
  event_type: string;
  count: number;
};

function mapTenant(row: TenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    defaultLocale: row.default_locale,
    supportedLocales: safeJsonParse(row.supported_locales_json, ["en"]),
    enabledRoomTypes: safeJsonParse(row.enabled_room_types_json, ["bathroom"]),
    categoryLinks: safeJsonParse<Record<FixtureType, string>>(row.category_links_json, {
      toilet: "",
      sink: "",
      shower: "",
      bath: ""
    }),
    brandTheme: {
      logoDataUrl: row.logo_data_url,
      primaryColor: row.primary_color,
      secondaryColor: row.secondary_color,
      accentColor: row.accent_color,
      surfaceColor: row.surface_color,
      fontFamily: row.font_family
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSession(row: SessionRow): LayoutSession {
  const parsedState = safeJsonParse(row.tournament_state_json, initializeTournament([]));

  return {
    id: row.id,
    tenantId: row.tenant_id,
    roomType: row.room_type,
    locale: row.locale,
    input: safeJsonParse(row.input_json, null as never),
    optionIds: safeJsonParse(row.option_ids_json, []),
    tournamentState: {
      ...parsedState,
      roundWinners: parsedState.roundWinners ?? []
    },
    status: row.status,
    winnerOptionId: row.winner_option_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapLayoutOption(row: LayoutOptionRow): LayoutOption {
  return {
    id: row.id,
    sessionId: row.session_id,
    rankIndex: row.rank_index,
    score: row.score,
    renderMode: row.render_mode,
    imageUrl: row.image_url,
    fallbackSvg: row.fallback_svg,
    prompt: row.prompt,
    layout: safeJsonParse(row.layout_json, null as never),
    createdAt: row.created_at
  };
}

function mapCatalogImport(row: CatalogImportRow): CatalogImport {
  const raw = safeJsonParse<{
    mappings: Record<
      FixtureType,
      {
        label: string;
        categoryUrl: string;
        note: string;
      }
    >;
  }>(row.raw_json, {
    mappings: {
      toilet: {
        label: "",
        categoryUrl: "",
        note: ""
      },
      sink: {
        label: "",
        categoryUrl: "",
        note: ""
      },
      shower: {
        label: "",
        categoryUrl: "",
        note: ""
      },
      bath: {
        label: "",
        categoryUrl: "",
        note: ""
      }
    }
  });
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    mappings: raw.mappings,
    importedAt: row.imported_at
  };
}

function mapSavedProject(row: SavedProjectRow): SavedProject {
  return {
    id: row.id,
    sessionId: row.session_id,
    token: row.token,
    email: row.email,
    locale: row.locale,
    shoppingList: safeJsonParse<ShoppingListItem[]>(row.shopping_list_json, []),
    createdAt: row.created_at
  };
}

function db() {
  return getDb();
}

export function listTenants() {
  const rows = db()
    .prepare("SELECT * FROM tenants ORDER BY name ASC")
    .all() as TenantRow[];
  return rows.map(mapTenant);
}

export function getTenant(tenantId: string) {
  const row = db().prepare("SELECT * FROM tenants WHERE id = ?").get(tenantId) as TenantRow | undefined;
  return row ? mapTenant(row) : null;
}

export function updateTenant(tenantId: string, tenant: Omit<Tenant, "id" | "slug" | "createdAt" | "updatedAt">) {
  const existing = getTenant(tenantId);

  if (!existing) {
    throw new Error("Tenant not found.");
  }

  const updatedAt = nowIso();
  db()
    .prepare(
      `
        UPDATE tenants
        SET
          name = @name,
          default_locale = @defaultLocale,
          supported_locales_json = @supportedLocalesJson,
          enabled_room_types_json = @enabledRoomTypesJson,
          category_links_json = @categoryLinksJson,
          logo_data_url = @logoDataUrl,
          primary_color = @primaryColor,
          secondary_color = @secondaryColor,
          accent_color = @accentColor,
          surface_color = @surfaceColor,
          font_family = @fontFamily,
          updated_at = @updatedAt
        WHERE id = @id
      `
    )
    .run({
      id: tenantId,
      name: tenant.name,
      defaultLocale: tenant.defaultLocale,
      supportedLocalesJson: JSON.stringify(tenant.supportedLocales),
      enabledRoomTypesJson: JSON.stringify(tenant.enabledRoomTypes),
      categoryLinksJson: JSON.stringify(tenant.categoryLinks),
      logoDataUrl: tenant.brandTheme.logoDataUrl,
      primaryColor: tenant.brandTheme.primaryColor,
      secondaryColor: tenant.brandTheme.secondaryColor,
      accentColor: tenant.brandTheme.accentColor,
      surfaceColor: tenant.brandTheme.surfaceColor,
      fontFamily: tenant.brandTheme.fontFamily,
      updatedAt
    });

  return getTenant(tenantId);
}

export function getRoomTemplate(roomType: RoomType): RoomTemplate | null {
  const row = db()
    .prepare("SELECT * FROM room_templates WHERE room_type = ? LIMIT 1")
    .get(roomType) as
    | {
        id: string;
        room_type: RoomType;
        name: string;
        rules_json: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    roomType: row.room_type,
    name: row.name,
    rules: safeJsonParse<RoomTemplate["rules"]>(row.rules_json, {
      minimumWidthCm: 180,
      minimumDepthCm: 180,
      maximumWidthCm: 520,
      maximumDepthCm: 520,
      targetOptionCount: 8
    })
  } as RoomTemplate;
}

export function createSession(tenantId: string, input: SessionInput) {
  const createdAt = nowIso();
  const id = makeId("session");
  const tournamentState = initializeTournament([]);

  db()
    .prepare(
      `
        INSERT INTO layout_sessions (
          id,
          tenant_id,
          room_type,
          locale,
          input_json,
          option_ids_json,
          tournament_state_json,
          status,
          winner_option_id,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @tenantId,
          @roomType,
          @locale,
          @inputJson,
          @optionIdsJson,
          @tournamentStateJson,
          'draft',
          NULL,
          @createdAt,
          @updatedAt
        )
      `
    )
    .run({
      id,
      tenantId,
      roomType: input.roomType,
      locale: input.locale,
      inputJson: JSON.stringify(input),
      optionIdsJson: JSON.stringify([]),
      tournamentStateJson: JSON.stringify(tournamentState),
      createdAt,
      updatedAt: createdAt
    });

  trackEvent({
    tenantId,
    sessionId: id,
    roomType: input.roomType,
    locale: input.locale,
    eventType: "session_started",
    metadata: { fixtures: input.fixtures }
  });

  return getSession(id);
}

export function getSession(sessionId: string) {
  const row = db()
    .prepare("SELECT * FROM layout_sessions WHERE id = ?")
    .get(sessionId) as SessionRow | undefined;
  return row ? mapSession(row) : null;
}

export function listSessionOptions(sessionId: string) {
  const rows = db()
    .prepare("SELECT * FROM layout_options WHERE session_id = ? ORDER BY rank_index ASC")
    .all(sessionId) as LayoutOptionRow[];
  return rows.map(mapLayoutOption);
}

export function getLayoutOption(optionId: string) {
  const row = db()
    .prepare("SELECT * FROM layout_options WHERE id = ?")
    .get(optionId) as LayoutOptionRow | undefined;
  return row ? mapLayoutOption(row) : null;
}

export function storeGeneratedOptions(
  sessionId: string,
  generatedOptions: Array<
    Omit<LayoutOption, "id" | "sessionId" | "createdAt"> & {
      id: string;
      createdAt: string;
    }
  >
) {
  const database = db();
  const removeExisting = database.prepare("DELETE FROM layout_options WHERE session_id = ?");
  const insertOption = database.prepare(
    `
      INSERT INTO layout_options (
        id,
        session_id,
        rank_index,
        score,
        render_mode,
        image_url,
        fallback_svg,
        prompt,
        layout_json,
        created_at
      ) VALUES (
        @id,
        @sessionId,
        @rankIndex,
        @score,
        @renderMode,
        @imageUrl,
        @fallbackSvg,
        @prompt,
        @layoutJson,
        @createdAt
      )
    `
  );

  const optionIds = generatedOptions.map((option) => option.id);
  const tournamentState = initializeTournament(optionIds);
  const updatedAt = nowIso();

  const transaction = database.transaction(() => {
    removeExisting.run(sessionId);
    for (const option of generatedOptions) {
      insertOption.run({
        id: option.id,
        sessionId,
        rankIndex: option.rankIndex,
        score: option.score,
        renderMode: option.renderMode,
        imageUrl: option.imageUrl,
        fallbackSvg: option.fallbackSvg,
        prompt: option.prompt,
        layoutJson: JSON.stringify(option.layout),
        createdAt: option.createdAt
      });
    }
    database
      .prepare(
        `
          UPDATE layout_sessions
          SET option_ids_json = ?, tournament_state_json = ?, status = 'generated', updated_at = ?
          WHERE id = ?
        `
      )
      .run(JSON.stringify(optionIds), JSON.stringify(tournamentState), updatedAt, sessionId);
  });

  transaction();

  const session = getSession(sessionId);

  if (!session) {
    throw new Error("Session not found after generating options.");
  }

  trackEvent({
    tenantId: session.tenantId,
    sessionId,
    roomType: session.roomType,
    locale: session.locale,
    eventType: "generation_completed",
    metadata: { optionCount: generatedOptions.length }
  });

  return session;
}

export function submitVote(sessionId: string, winnerOptionId: string) {
  const session = getSession(sessionId);

  if (!session) {
    throw new Error("Session not found.");
  }

  const currentPair = session.tournamentState.currentPair;

  if (!currentPair) {
    throw new Error("The tournament is already finished.");
  }

  const { nextState, round, matchupIndex, loserOptionId } = advanceTournament(session.tournamentState, winnerOptionId);
  const voteId = makeId("vote");
  const createdAt = nowIso();

  const database = db();
  const transaction = database.transaction(() => {
    database
      .prepare(
        `
          INSERT INTO comparison_votes (
            id,
            session_id,
            round,
            matchup_index,
            left_option_id,
            right_option_id,
            winner_option_id,
            loser_option_id,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        voteId,
        sessionId,
        round,
        matchupIndex,
        currentPair[0],
        currentPair[1],
        winnerOptionId,
        loserOptionId,
        createdAt
      );

    database
      .prepare(
        `
          UPDATE layout_sessions
          SET
            tournament_state_json = ?,
            winner_option_id = ?,
            status = ?,
            updated_at = ?
          WHERE id = ?
        `
      )
      .run(
        JSON.stringify(nextState),
        nextState.winnerOptionId,
        nextState.winnerOptionId ? "completed" : "generated",
        createdAt,
        sessionId
      );
  });

  transaction();

  trackEvent({
    tenantId: session.tenantId,
    sessionId,
    roomType: session.roomType,
    locale: session.locale,
    eventType: "matchup_voted",
    metadata: {
      round,
      matchupIndex,
      winnerOptionId
    }
  });

  if (nextState.winnerOptionId) {
    trackEvent({
      tenantId: session.tenantId,
      sessionId,
      roomType: session.roomType,
      locale: session.locale,
      eventType: "winner_selected",
      metadata: { winnerOptionId: nextState.winnerOptionId }
    });
  }

  return {
    session: getSession(sessionId),
    votes: listVotes(sessionId)
  };
}

export function listVotes(sessionId: string) {
  const rows = db()
    .prepare("SELECT * FROM comparison_votes WHERE session_id = ? ORDER BY round ASC, matchup_index ASC")
    .all(sessionId) as VoteRow[];

  return rows.map<ComparisonVote>((row) => ({
    id: row.id,
    sessionId: row.session_id,
    round: row.round,
    matchupIndex: row.matchup_index,
    leftOptionId: row.left_option_id,
    rightOptionId: row.right_option_id,
    winnerOptionId: row.winner_option_id,
    loserOptionId: row.loser_option_id,
    createdAt: row.created_at
  }));
}

export function getLatestCatalogImport(tenantId: string) {
  const row = db()
    .prepare("SELECT * FROM catalog_imports WHERE tenant_id = ? ORDER BY imported_at DESC LIMIT 1")
    .get(tenantId) as CatalogImportRow | undefined;
  return row ? mapCatalogImport(row) : null;
}

export function importCatalog(
  tenantId: string,
  name: string,
  mappings: CatalogImport["mappings"]
) {
  const id = makeId("catalog");
  const importedAt = nowIso();

  db()
    .prepare(
      `
        INSERT INTO catalog_imports (id, tenant_id, name, raw_json, imported_at)
        VALUES (?, ?, ?, ?, ?)
      `
    )
    .run(id, tenantId, name, JSON.stringify({ mappings }), importedAt);

  const tenant = getTenant(tenantId);

  if (tenant) {
    updateTenant(tenantId, {
      name: tenant.name,
      defaultLocale: tenant.defaultLocale,
      supportedLocales: tenant.supportedLocales,
      enabledRoomTypes: tenant.enabledRoomTypes,
      brandTheme: tenant.brandTheme,
      categoryLinks: {
        toilet: mappings.toilet.categoryUrl,
        sink: mappings.sink.categoryUrl,
        shower: mappings.shower.categoryUrl,
        bath: mappings.bath.categoryUrl
      }
    });
  }

  return getLatestCatalogImport(tenantId);
}

export function createSavedProject(
  sessionId: string,
  email: string,
  locale: Locale,
  shoppingList: ShoppingListItem[]
) {
  const session = getSession(sessionId);

  if (!session) {
    throw new Error("Session not found.");
  }

  const id = makeId("project");
  const token = makeId("magic");
  const createdAt = nowIso();

  db()
    .prepare(
      `
        INSERT INTO saved_projects (
          id,
          session_id,
          token,
          email,
          locale,
          shopping_list_json,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(id, sessionId, token, email, locale, JSON.stringify(shoppingList), createdAt);

  trackEvent({
    tenantId: session.tenantId,
    sessionId,
    roomType: session.roomType,
    locale,
    eventType: "project_saved",
    metadata: { email }
  });

  return getSavedProject(token);
}

export function getSavedProject(token: string) {
  const row = db()
    .prepare("SELECT * FROM saved_projects WHERE token = ?")
    .get(token) as SavedProjectRow | undefined;

  if (!row) {
    return null;
  }

  const project = mapSavedProject(row);
  const session = getSession(project.sessionId);

  if (!session) {
    return null;
  }

  const winner = session.winnerOptionId ? getLayoutOption(session.winnerOptionId) : null;
  const tenant = getTenant(session.tenantId);

  return {
    project,
    session,
    winner,
    tenant
  };
}

export function trackEvent({
  tenantId,
  sessionId,
  roomType,
  locale,
  eventType,
  metadata
}: {
  tenantId: string;
  sessionId: string | null;
  roomType: RoomType;
  locale: Locale;
  eventType: string;
  metadata: Record<string, unknown>;
}) {
  db()
    .prepare(
      `
        INSERT INTO analytics_events (
          id,
          tenant_id,
          session_id,
          room_type,
          locale,
          event_type,
          metadata_json,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(makeId("event"), tenantId, sessionId, roomType, locale, eventType, JSON.stringify(metadata), nowIso());
}

export function getAnalyticsSummary(tenantId: string): AnalyticsSummary {
  const rows = db()
    .prepare(
      `
        SELECT locale, room_type, event_type, COUNT(*) as count
        FROM analytics_events
        WHERE tenant_id = ?
        GROUP BY locale, room_type, event_type
      `
    )
    .all(tenantId) as AnalyticsRow[];

  const total = (eventType: string) =>
    rows.filter((row) => row.event_type === eventType).reduce((sum, row) => sum + row.count, 0);
  const starts = total("session_started");
  const generations = total("generation_completed");
  const completedMatchups = total("winner_selected");
  const savedProjects = total("project_saved");
  const shoppingListViews = total("shopping_list_viewed");
  const retailerClicks = total("retailer_click");

  const locales = [...new Set(rows.map((row) => row.locale))];
  const roomTypes = [...new Set(rows.map((row) => row.room_type))];

  return {
    starts,
    generations,
    completedMatchups,
    savedProjects,
    shoppingListViews,
    retailerClicks,
    generationSuccessRate: starts ? (generations / starts) * 100 : 0,
    matchupCompletionRate: starts ? (completedMatchups / starts) * 100 : 0,
    savedProjectRate: starts ? (savedProjects / starts) * 100 : 0,
    shoppingListRate: starts ? (shoppingListViews / starts) * 100 : 0,
    byLocale: locales.map((locale) => ({
      locale,
      starts: rows
        .filter((row) => row.locale === locale && row.event_type === "session_started")
        .reduce((sum, row) => sum + row.count, 0),
      savedProjects: rows
        .filter((row) => row.locale === locale && row.event_type === "project_saved")
        .reduce((sum, row) => sum + row.count, 0)
    })),
    byRoomType: roomTypes.map((roomType) => ({
      roomType,
      starts: rows
        .filter((row) => row.room_type === roomType && row.event_type === "session_started")
        .reduce((sum, row) => sum + row.count, 0),
      completions: rows
        .filter((row) => row.room_type === roomType && row.event_type === "winner_selected")
        .reduce((sum, row) => sum + row.count, 0)
    }))
  };
}
