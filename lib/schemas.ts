import { z } from "zod";

const wallSchema = z.enum(["north", "east", "south", "west"]);
export const localeSchema = z.enum(["en", "nl"]);
export const roomTypeSchema = z.enum(["bathroom", "kitchen", "living-room", "office", "bedroom"]);
const layoutRoomTypeSchema = z.enum(["bathroom"]);

export const sessionInputSchema = z.object({
  tenantId: z.string().min(1),
  roomType: layoutRoomTypeSchema.default("bathroom"),
  locale: localeSchema.default("en"),
  widthCm: z.number().int().min(180).max(520),
  depthCm: z.number().int().min(180).max(520),
  door: z.object({
    wall: wallSchema,
    offsetCm: z.number().int().min(0).max(450),
    widthCm: z.number().int().min(70).max(120).default(90)
  }),
  window: z
    .object({
      wall: wallSchema,
      offsetCm: z.number().int().min(0).max(450),
      widthCm: z.number().int().min(50).max(200)
    })
    .nullable()
    .default(null),
  fixtures: z.array(z.enum(["toilet", "sink", "shower", "bath"])).min(1)
});

export const voteSchema = z.object({
  winnerOptionId: z.string().min(1)
});

export const saveProjectSchema = z.object({
  email: z.string().email().min(3)
});

export const tenantUpdateSchema = z.object({
  name: z.string().min(2),
  defaultLocale: localeSchema,
  supportedLocales: z.array(localeSchema).min(1),
  enabledRoomTypes: z.array(roomTypeSchema).min(1),
  brandTheme: z.object({
    logoDataUrl: z.string().nullable(),
    primaryColor: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i),
    secondaryColor: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i),
    accentColor: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i),
    surfaceColor: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i),
    fontFamily: z.string().min(3)
  }),
  categoryLinks: z.object({
    toilet: z.string().url(),
    sink: z.string().url(),
    shower: z.string().url(),
    bath: z.string().url()
  })
});

export const catalogImportSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(2),
  mappings: z.object({
    toilet: z.object({
      label: z.string().min(2),
      categoryUrl: z.string().url(),
      note: z.string().min(2)
    }),
    sink: z.object({
      label: z.string().min(2),
      categoryUrl: z.string().url(),
      note: z.string().min(2)
    }),
    shower: z.object({
      label: z.string().min(2),
      categoryUrl: z.string().url(),
      note: z.string().min(2)
    }),
    bath: z.object({
      label: z.string().min(2),
      categoryUrl: z.string().url(),
      note: z.string().min(2)
    })
  })
});

export const visualizationRequestSchema = z.object({
  tenantId: z.string().min(1),
  roomType: roomTypeSchema,
  locale: localeSchema.default("en"),
  currentRoomImageDataUrl: z.string().startsWith("data:image/"),
  inspirationImages: z.array(z.string().startsWith("data:image/")).min(1).max(6)
});
