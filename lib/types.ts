export type Locale = "en" | "nl";
export type Audience = "consumer" | "enterprise";
export type RoomType = "bathroom" | "kitchen" | "living-room" | "office" | "bedroom";
export type FixtureType = "toilet" | "sink" | "shower" | "bath";
export type Wall = "north" | "east" | "south" | "west";
export type RenderMode = "image" | "fallback";
export type SessionStatus = "draft" | "generated" | "completed";

export interface BrandTheme {
  logoDataUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  surfaceColor: string;
  fontFamily: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  defaultLocale: Locale;
  supportedLocales: Locale[];
  enabledRoomTypes: RoomType[];
  categoryLinks: Record<FixtureType, string>;
  brandTheme: BrandTheme;
  createdAt: string;
  updatedAt: string;
}

export interface RoomTemplate {
  id: string;
  roomType: RoomType;
  name: string;
  rules: {
    minimumWidthCm: number;
    minimumDepthCm: number;
    maximumWidthCm: number;
    maximumDepthCm: number;
    targetOptionCount: number;
  };
}

export interface DoorSpec {
  wall: Wall;
  offsetCm: number;
  widthCm: number;
}

export interface WindowSpec {
  wall: Wall;
  offsetCm: number;
  widthCm: number;
}

export interface SessionInput {
  roomType: RoomType;
  locale: Locale;
  widthCm: number;
  depthCm: number;
  door: DoorSpec;
  window: WindowSpec | null;
  fixtures: FixtureType[];
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  depth: number;
}

export interface LayoutPlacement extends Rect {
  fixtureType: FixtureType;
  wall: Wall;
  rotation: 0 | 90 | 180 | 270;
  clearance: Rect;
}

export interface LayoutOption {
  id: string;
  sessionId: string;
  rankIndex: number;
  score: number;
  renderMode: RenderMode;
  imageUrl: string | null;
  fallbackSvg: string;
  prompt: string;
  layout: {
    room: {
      widthCm: number;
      depthCm: number;
    };
    door: DoorSpec;
    window: WindowSpec | null;
    fixtures: LayoutPlacement[];
  };
  createdAt: string;
}

export interface TournamentState {
  round: number;
  matchupIndex: number;
  remainingOptionIds: string[];
  roundWinners: string[];
  currentPair: [string, string] | null;
  winnerOptionId: string | null;
}

export interface LayoutSession {
  id: string;
  tenantId: string;
  roomType: RoomType;
  locale: Locale;
  input: SessionInput;
  optionIds: string[];
  tournamentState: TournamentState;
  status: SessionStatus;
  winnerOptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonVote {
  id: string;
  sessionId: string;
  round: number;
  matchupIndex: number;
  leftOptionId: string;
  rightOptionId: string;
  winnerOptionId: string;
  loserOptionId: string;
  createdAt: string;
}

export interface ShoppingListItem {
  fixtureType: FixtureType;
  label: string;
  quantity: number;
  categoryUrl: string;
  note: string;
}

export interface SavedProject {
  id: string;
  sessionId: string;
  token: string;
  email: string;
  locale: Locale;
  shoppingList: ShoppingListItem[];
  createdAt: string;
}

export interface CatalogImport {
  id: string;
  tenantId: string;
  name: string;
  mappings: Record<
    FixtureType,
    {
      label: string;
      categoryUrl: string;
      note: string;
    }
  >;
  importedAt: string;
}

export interface AnalyticsSummary {
  starts: number;
  generations: number;
  completedMatchups: number;
  savedProjects: number;
  shoppingListViews: number;
  retailerClicks: number;
  generationSuccessRate: number;
  matchupCompletionRate: number;
  savedProjectRate: number;
  shoppingListRate: number;
  byLocale: Array<{
    locale: Locale;
    starts: number;
    savedProjects: number;
  }>;
  byRoomType: Array<{
    roomType: RoomType;
    starts: number;
    completions: number;
  }>;
}

export interface ApiError {
  error: string;
}
