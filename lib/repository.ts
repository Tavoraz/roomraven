import { getDb } from "@/lib/db";
import { advanceTournament, initializeTournament } from "@/lib/tournament";
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

type SqlParam = string | number | null;

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

type RoomTemplateRow = {
  id: string;
  room_type: RoomType;
  name: string;
  rules_json: string;
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
  count: number | string;
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
      toilet: { label: "", categoryUrl: "", note: "" },
      sink: { label: "", categoryUrl: "", note: "" },
      shower: { label: "", categoryUrl: "", note: "" },
      bath: { label: "", categoryUrl: "", note: "" }
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

async function firstRow<T>(sql: string, params: SqlParam[] = []) {
  const db = await getDb();
  return (await db.prepare(sql).bind(...params).first<T>()) ?? null;
}

async function allRows<T>(sql: string, params: SqlParam[] = []) {
  const db = await getDb();
  const result = await db.prepare(sql).bind(...params).all<T>();
  return result.results ?? [];
}

async function run(sql: string, params: SqlParam[] = []) {
  const db = await getDb();
  await db.prepare(sql).bind(...params).run();
}

async function batch(
  statements: Array<{
    sql: string;
    params?: SqlParam[];
  }>
) {
  const db = await getDb();
  await db.batch(statements.map(({ sql, params = [] }) => db.prepare(sql).bind(...params)));
}

export async function listTenants() {
  const rows = await allRows<TenantRow>("SELECT * FROM tenants ORDER BY name ASC");
  return rows.map(mapTenant);
}

export async function getTenant(tenantId: string) {
  const row = await firstRow<TenantRow>("SELECT * FROM tenants WHERE id = ?", [tenantId]);
  return row ? mapTenant(row) : null;
}

export async function updateTenant(
  tenantId: string,
  tenant: Omit<Tenant, "id" | "slug" | "createdAt" | "updatedAt">
) {
  const existing = await getTenant(tenantId);

  if (!existing) {
    throw new Error("Tenant not found.");
  }

  const updatedAt = nowIso();
  await run(
    `
      UPDATE tenants
      SET
        name = ?,
        default_locale = ?,
        supported_locales_json = ?,
        enabled_room_types_json = ?,
        category_links_json = ?,
        logo_data_url = ?,
        primary_color = ?,
        secondary_color = ?,
        accent_color = ?,
        surface_color = ?,
        font_family = ?,
        updated_at = ?
      WHERE id = ?
    `,
    [
      tenant.name,
      tenant.defaultLocale,
      JSON.stringify(tenant.supportedLocales),
      JSON.stringify(tenant.enabledRoomTypes),
      JSON.stringify(tenant.categoryLinks),
      tenant.brandTheme.logoDataUrl,
      tenant.brandTheme.primaryColor,
      tenant.brandTheme.secondaryColor,
      tenant.brandTheme.accentColor,
      tenant.brandTheme.surfaceColor,
      tenant.brandTheme.fontFamily,
      updatedAt,
      tenantId
    ]
  );

  return getTenant(tenantId);
}

export async function getRoomTemplate(roomType: RoomType): Promise<RoomTemplate | null> {
  const row = await firstRow<RoomTemplateRow>(
    "SELECT * FROM room_templates WHERE room_type = ? LIMIT 1",
    [roomType]
  );

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
  };
}

export async function createSession(tenantId: string, input: SessionInput) {
  const createdAt = nowIso();
  const id = makeId("session");
  const tournamentState = initializeTournament([]);

  await run(
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', NULL, ?, ?)
    `,
    [
      id,
      tenantId,
      input.roomType,
      input.locale,
      JSON.stringify(input),
      JSON.stringify([]),
      JSON.stringify(tournamentState),
      createdAt,
      createdAt
    ]
  );

  await trackEvent({
    tenantId,
    sessionId: id,
    roomType: input.roomType,
    locale: input.locale,
    eventType: "session_started",
    metadata: { fixtures: input.fixtures }
  });

  return getSession(id);
}

export async function getSession(sessionId: string) {
  const row = await firstRow<SessionRow>("SELECT * FROM layout_sessions WHERE id = ?", [sessionId]);
  return row ? mapSession(row) : null;
}

export async function listSessionOptions(sessionId: string) {
  const rows = await allRows<LayoutOptionRow>(
    "SELECT * FROM layout_options WHERE session_id = ? ORDER BY rank_index ASC",
    [sessionId]
  );
  return rows.map(mapLayoutOption);
}

export async function getLayoutOption(optionId: string) {
  const row = await firstRow<LayoutOptionRow>("SELECT * FROM layout_options WHERE id = ?", [optionId]);
  return row ? mapLayoutOption(row) : null;
}

export async function storeGeneratedOptions(
  sessionId: string,
  generatedOptions: Array<
    Omit<LayoutOption, "id" | "sessionId" | "createdAt"> & {
      id: string;
      createdAt: string;
    }
  >
) {
  const optionIds = generatedOptions.map((option) => option.id);
  const tournamentState = initializeTournament(optionIds);
  const updatedAt = nowIso();

  await batch([
    {
      sql: "DELETE FROM layout_options WHERE session_id = ?",
      params: [sessionId]
    },
    ...generatedOptions.map((option) => ({
      sql: `
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        option.id,
        sessionId,
        option.rankIndex,
        option.score,
        option.renderMode,
        option.imageUrl,
        option.fallbackSvg,
        option.prompt,
        JSON.stringify(option.layout),
        option.createdAt
      ]
    })),
    {
      sql: `
        UPDATE layout_sessions
        SET option_ids_json = ?, tournament_state_json = ?, status = 'generated', updated_at = ?
        WHERE id = ?
      `,
      params: [JSON.stringify(optionIds), JSON.stringify(tournamentState), updatedAt, sessionId]
    }
  ]);

  const session = await getSession(sessionId);

  if (!session) {
    throw new Error("Session not found after generating options.");
  }

  await trackEvent({
    tenantId: session.tenantId,
    sessionId,
    roomType: session.roomType,
    locale: session.locale,
    eventType: "generation_completed",
    metadata: { optionCount: generatedOptions.length }
  });

  return session;
}

export async function submitVote(sessionId: string, winnerOptionId: string) {
  const session = await getSession(sessionId);

  if (!session) {
    throw new Error("Session not found.");
  }

  const currentPair = session.tournamentState.currentPair;

  if (!currentPair) {
    throw new Error("The tournament is already finished.");
  }

  const { nextState, round, matchupIndex, loserOptionId } = advanceTournament(
    session.tournamentState,
    winnerOptionId
  );
  const voteId = makeId("vote");
  const createdAt = nowIso();

  await batch([
    {
      sql: `
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
      `,
      params: [
        voteId,
        sessionId,
        round,
        matchupIndex,
        currentPair[0],
        currentPair[1],
        winnerOptionId,
        loserOptionId,
        createdAt
      ]
    },
    {
      sql: `
        UPDATE layout_sessions
        SET
          tournament_state_json = ?,
          winner_option_id = ?,
          status = ?,
          updated_at = ?
        WHERE id = ?
      `,
      params: [
        JSON.stringify(nextState),
        nextState.winnerOptionId,
        nextState.winnerOptionId ? "completed" : "generated",
        createdAt,
        sessionId
      ]
    }
  ]);

  await trackEvent({
    tenantId: session.tenantId,
    sessionId,
    roomType: session.roomType,
    locale: session.locale,
    eventType: "matchup_voted",
    metadata: { round, matchupIndex, winnerOptionId }
  });

  if (nextState.winnerOptionId) {
    await trackEvent({
      tenantId: session.tenantId,
      sessionId,
      roomType: session.roomType,
      locale: session.locale,
      eventType: "winner_selected",
      metadata: { winnerOptionId: nextState.winnerOptionId }
    });
  }

  return {
    session: await getSession(sessionId),
    votes: await listVotes(sessionId)
  };
}

export async function listVotes(sessionId: string) {
  const rows = await allRows<VoteRow>(
    "SELECT * FROM comparison_votes WHERE session_id = ? ORDER BY round ASC, matchup_index ASC",
    [sessionId]
  );

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

export async function getLatestCatalogImport(tenantId: string) {
  const row = await firstRow<CatalogImportRow>(
    "SELECT * FROM catalog_imports WHERE tenant_id = ? ORDER BY imported_at DESC LIMIT 1",
    [tenantId]
  );
  return row ? mapCatalogImport(row) : null;
}

export async function importCatalog(
  tenantId: string,
  name: string,
  mappings: CatalogImport["mappings"]
) {
  const id = makeId("catalog");
  const importedAt = nowIso();
  const tenant = await getTenant(tenantId);
  const updatedAt = nowIso();

  await batch([
    {
      sql: `
        INSERT INTO catalog_imports (id, tenant_id, name, raw_json, imported_at)
        VALUES (?, ?, ?, ?, ?)
      `,
      params: [id, tenantId, name, JSON.stringify({ mappings }), importedAt]
    },
    ...(tenant
      ? [
          {
            sql: `
              UPDATE tenants
              SET
                name = ?,
                default_locale = ?,
                supported_locales_json = ?,
                enabled_room_types_json = ?,
                category_links_json = ?,
                logo_data_url = ?,
                primary_color = ?,
                secondary_color = ?,
                accent_color = ?,
                surface_color = ?,
                font_family = ?,
                updated_at = ?
              WHERE id = ?
            `,
            params: [
              tenant.name,
              tenant.defaultLocale,
              JSON.stringify(tenant.supportedLocales),
              JSON.stringify(tenant.enabledRoomTypes),
              JSON.stringify({
                toilet: mappings.toilet.categoryUrl,
                sink: mappings.sink.categoryUrl,
                shower: mappings.shower.categoryUrl,
                bath: mappings.bath.categoryUrl
              }),
              tenant.brandTheme.logoDataUrl,
              tenant.brandTheme.primaryColor,
              tenant.brandTheme.secondaryColor,
              tenant.brandTheme.accentColor,
              tenant.brandTheme.surfaceColor,
              tenant.brandTheme.fontFamily,
              updatedAt,
              tenantId
            ]
          }
        ]
      : [])
  ]);

  return getLatestCatalogImport(tenantId);
}

export async function createSavedProject(
  sessionId: string,
  email: string,
  locale: Locale,
  shoppingList: ShoppingListItem[]
) {
  const session = await getSession(sessionId);

  if (!session) {
    throw new Error("Session not found.");
  }

  const id = makeId("project");
  const token = makeId("magic");
  const createdAt = nowIso();

  await run(
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
    `,
    [id, sessionId, token, email, locale, JSON.stringify(shoppingList), createdAt]
  );

  await trackEvent({
    tenantId: session.tenantId,
    sessionId,
    roomType: session.roomType,
    locale,
    eventType: "project_saved",
    metadata: { email }
  });

  return getSavedProject(token);
}

export async function getSavedProject(token: string) {
  const row = await firstRow<SavedProjectRow>("SELECT * FROM saved_projects WHERE token = ?", [token]);

  if (!row) {
    return null;
  }

  const project = mapSavedProject(row);
  const session = await getSession(project.sessionId);

  if (!session) {
    return null;
  }

  const [winner, tenant] = await Promise.all([
    session.winnerOptionId ? getLayoutOption(session.winnerOptionId) : Promise.resolve(null),
    getTenant(session.tenantId)
  ]);

  return {
    project,
    session,
    winner,
    tenant
  };
}

export async function trackEvent({
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
  await run(
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
    `,
    [makeId("event"), tenantId, sessionId, roomType, locale, eventType, JSON.stringify(metadata), nowIso()]
  );
}

export async function getAnalyticsSummary(tenantId: string): Promise<AnalyticsSummary> {
  const rows = await allRows<AnalyticsRow>(
    `
      SELECT locale, room_type, event_type, COUNT(*) as count
      FROM analytics_events
      WHERE tenant_id = ?
      GROUP BY locale, room_type, event_type
    `,
    [tenantId]
  );

  const total = (eventType: string) =>
    rows
      .filter((row) => row.event_type === eventType)
      .reduce((sum, row) => sum + Number(row.count), 0);
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
        .reduce((sum, row) => sum + Number(row.count), 0),
      savedProjects: rows
        .filter((row) => row.locale === locale && row.event_type === "project_saved")
        .reduce((sum, row) => sum + Number(row.count), 0)
    })),
    byRoomType: roomTypes.map((roomType) => ({
      roomType,
      starts: rows
        .filter((row) => row.room_type === roomType && row.event_type === "session_started")
        .reduce((sum, row) => sum + Number(row.count), 0),
      completions: rows
        .filter((row) => row.room_type === roomType && row.event_type === "winner_selected")
        .reduce((sum, row) => sum + Number(row.count), 0)
    }))
  };
}
