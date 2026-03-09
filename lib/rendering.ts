import { DEFAULT_AI_MODEL, FIXTURE_SPECS } from "@/lib/constants";
import type { LayoutOption, Locale, SessionInput, Tenant } from "@/lib/types";
import { toDataUrl } from "@/lib/utils";

function wallLabel(locale: Locale, wall: SessionInput["door"]["wall"]) {
  const labels = {
    en: {
      north: "north wall",
      east: "east wall",
      south: "south wall",
      west: "west wall"
    },
    nl: {
      north: "noordmuur",
      east: "oostmuur",
      south: "zuidmuur",
      west: "westmuur"
    }
  };

  return labels[locale][wall];
}

export function buildRenderPrompt(
  tenant: Tenant,
  input: SessionInput,
  layout: LayoutOption["layout"],
  optionIndex: number
) {
  const fixtureSummary = layout.fixtures
    .map((fixture) => {
      const spec = FIXTURE_SPECS[fixture.fixtureType];
      return `${spec.renderLabel} on the ${wallLabel(input.locale, fixture.wall)}, positioned at ${fixture.x}cm x ${fixture.y}cm`;
    })
    .join("; ");

  const windowPart = input.window
    ? `A window sits on the ${wallLabel(input.locale, input.window.wall)} with ${input.window.widthCm}cm width.`
    : "There is no window in the room.";

  return [
    "Create a photorealistic interior rendering of a compact European bathroom renovation concept.",
    `Brand cues: ${tenant.name}, ${tenant.brandTheme.primaryColor} primary accent, ${tenant.brandTheme.secondaryColor} secondary accent.`,
    `Room size: ${input.widthCm}cm by ${input.depthCm}cm.`,
    `Door position: ${wallLabel(input.locale, input.door.wall)}, ${input.door.widthCm}cm wide, starting ${input.door.offsetCm}cm from the corner.`,
    windowPart,
    `Layout option ${optionIndex + 1}: ${fixtureSummary}.`,
    "Perspective: eye-level camera near the doorway looking into the room.",
    "Style: premium DIY retailer showroom, natural daylight, realistic materials, practical renovation-ready layout.",
    "Important: keep the composition faithful to the layout and show only the described fixtures."
  ].join(" ");
}

export function createFallbackSvg(layout: LayoutOption["layout"], tenant: Tenant) {
  const width = 640;
  const height = 480;
  const padding = 28;
  const scale = Math.min(
    (width - padding * 2) / layout.room.widthCm,
    (height - padding * 2) / layout.room.depthCm
  );

  const fixtureFill = {
    toilet: "#f59e0b",
    sink: "#38bdf8",
    shower: "#22c55e",
    bath: "#6366f1"
  } as const;

  const door = layout.door;
  const doorElements =
    door.wall === "north" || door.wall === "south"
      ? `<rect x="${padding + door.offsetCm * scale}" y="${
          door.wall === "north" ? padding : padding + layout.room.depthCm * scale - 8
        }" width="${door.widthCm * scale}" height="8" fill="${tenant.brandTheme.accentColor}" rx="4" />`
      : `<rect x="${
          door.wall === "west" ? padding : padding + layout.room.widthCm * scale - 8
        }" y="${padding + door.offsetCm * scale}" width="8" height="${door.widthCm * scale}" fill="${tenant.brandTheme.accentColor}" rx="4" />`;

  const fixtureElements = layout.fixtures
    .map((fixture) => {
      const label = FIXTURE_SPECS[fixture.fixtureType].label;
      return `
        <g>
          <rect
            x="${padding + fixture.x * scale}"
            y="${padding + fixture.y * scale}"
            width="${fixture.width * scale}"
            height="${fixture.depth * scale}"
            rx="14"
            fill="${fixtureFill[fixture.fixtureType]}"
            fill-opacity="0.82"
            stroke="#0f172a"
            stroke-width="2"
          />
          <text
            x="${padding + (fixture.x + fixture.width / 2) * scale}"
            y="${padding + (fixture.y + fixture.depth / 2) * scale}"
            text-anchor="middle"
            dominant-baseline="middle"
            font-family="Arial, sans-serif"
            font-size="16"
            font-weight="700"
            fill="#0f172a"
          >
            ${label}
          </text>
        </g>
      `;
    })
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${tenant.brandTheme.surfaceColor}" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="24" fill="url(#bg)" />
      <rect
        x="${padding}"
        y="${padding}"
        width="${layout.room.widthCm * scale}"
        height="${layout.room.depthCm * scale}"
        rx="26"
        fill="rgba(255,255,255,0.94)"
        stroke="${tenant.brandTheme.secondaryColor}"
        stroke-width="4"
      />
      ${doorElements}
      ${fixtureElements}
      <text x="${padding}" y="24" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${tenant.brandTheme.secondaryColor}">
        2D layout fallback
      </text>
    </svg>
  `.trim();

  return toDataUrl(svg);
}

export async function renderLayoutOption(
  tenant: Tenant,
  input: SessionInput,
  layout: LayoutOption["layout"],
  optionIndex: number
) {
  const prompt = buildRenderPrompt(tenant, input, layout, optionIndex);
  const fallbackSvg = createFallbackSvg(layout, tenant);
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      prompt,
      fallbackSvg,
      renderMode: "fallback" as const,
      imageUrl: null
    };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
        "X-Title": "RoomRaven"
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? DEFAULT_AI_MODEL,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"],
        image_config: {
          aspect_ratio: "4:3",
          image_size: "1K"
        },
        stream: false
      }),
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter returned ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          images?: Array<{
            image_url?: { url?: string };
            imageUrl?: { url?: string };
          }>;
        };
      }>;
    };

    const image = data.choices?.[0]?.message?.images?.[0];
    const imageUrl = image?.image_url?.url ?? image?.imageUrl?.url ?? null;

    if (!imageUrl) {
      throw new Error("No image returned by OpenRouter.");
    }

    return {
      prompt,
      fallbackSvg,
      renderMode: "image" as const,
      imageUrl
    };
  } catch (error) {
    console.error("Layout rendering fell back to SVG.", error);
    return {
      prompt,
      fallbackSvg,
      renderMode: "fallback" as const,
      imageUrl: null
    };
  }
}
