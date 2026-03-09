import { DEFAULT_AI_MODEL, ROOM_TYPE_LABELS } from "@/lib/constants";
import type { Locale, RenderMode, RoomType, Tenant } from "@/lib/types";
import { makeId, nowIso, toDataUrl } from "@/lib/utils";

export interface VisualizationRequest {
  roomType: RoomType;
  locale: Locale;
  currentRoomImageDataUrl: string;
  inspirationImages: string[];
}

export interface VisualizationConcept {
  id: string;
  roomType: RoomType;
  prompt: string;
  renderMode: RenderMode;
  imageUrl: string | null;
  fallbackSvg: string;
  createdAt: string;
}

function roomLabel(roomType: RoomType, locale: Locale) {
  const dutchLabels: Record<RoomType, string> = {
    bathroom: "badkamer",
    kitchen: "keuken",
    "living-room": "woonkamer",
    office: "kantoor",
    bedroom: "slaapkamer"
  };

  return locale === "nl" ? dutchLabels[roomType] : ROOM_TYPE_LABELS[roomType].toLowerCase();
}

function buildVisualizationPrompt(tenant: Tenant, request: VisualizationRequest) {
  return [
    `Create one photorealistic redesign concept for this ${ROOM_TYPE_LABELS[request.roomType].toLowerCase()}.`,
    "Use the first image as the current room photo and the remaining images as inspiration references.",
    "Keep the room recognizable, preserve the rough proportions and viewpoint, and blend the references into one coherent interior concept.",
    `Style cues should feel appropriate for ${tenant.name} and use confident, premium-yet-realistic materials.`,
    "Do not create a split screen, mood board, collage, text overlay, or multiple variations.",
    "Return a single polished image only."
  ].join(" ");
}

function createVisualizationFallbackSvg(tenant: Tenant, request: VisualizationRequest) {
  const width = 1200;
  const height = 900;
  const currentRoomImage = request.currentRoomImageDataUrl;
  const inspirationCards = request.inspirationImages.slice(0, 4);
  const cardLayout = [
    { x: 820, y: 118, rotation: -6 },
    { x: 880, y: 304, rotation: 7 },
    { x: 756, y: 482, rotation: -8 },
    { x: 930, y: 560, rotation: 5 }
  ];

  const inspirationMarkup = inspirationCards
    .map((imageUrl, index) => {
      const card = cardLayout[index];

      return `
        <g transform="translate(${card.x} ${card.y}) rotate(${card.rotation})">
          <rect width="220" height="156" rx="24" fill="rgba(255,255,255,0.95)" />
          <image href="${imageUrl}" x="10" y="10" width="200" height="136" preserveAspectRatio="xMidYMid slice" clip-path="url(#inspiration-clip-${index})" />
          <rect width="220" height="156" rx="24" fill="none" stroke="rgba(15,23,42,0.08)" />
        </g>
      `;
    })
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="background-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${tenant.brandTheme.surfaceColor}" />
          <stop offset="100%" stop-color="#eef4ff" />
        </linearGradient>
        <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.88)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.68)" />
        </linearGradient>
        <clipPath id="main-room-clip">
          <rect x="76" y="96" width="640" height="640" rx="42" />
        </clipPath>
        ${inspirationCards
          .map(
            (_, index) =>
              `<clipPath id="inspiration-clip-${index}"><rect x="10" y="10" width="200" height="136" rx="18" /></clipPath>`
          )
          .join("")}
      </defs>

      <rect width="${width}" height="${height}" rx="42" fill="url(#background-gradient)" />
      <circle cx="1030" cy="138" r="160" fill="rgba(251,191,36,0.16)" />
      <circle cx="112" cy="812" r="180" fill="rgba(14,165,233,0.12)" />

      <rect x="60" y="80" width="672" height="672" rx="48" fill="rgba(255,255,255,0.34)" />
      <image href="${currentRoomImage}" x="76" y="96" width="640" height="640" preserveAspectRatio="xMidYMid slice" clip-path="url(#main-room-clip)" />
      <rect x="76" y="96" width="640" height="640" rx="42" fill="url(#glass-gradient)" opacity="0.16" />
      <rect x="76" y="96" width="640" height="640" rx="42" fill="none" stroke="rgba(15,23,42,0.08)" />

      <g transform="translate(110 632)">
        <rect width="478" height="114" rx="28" fill="rgba(255,255,255,0.84)" />
        <text x="28" y="40" fill="${tenant.brandTheme.secondaryColor}" font-family="Space Grotesk, Arial, sans-serif" font-size="18" font-weight="700">
          Concept preview
        </text>
        <text x="28" y="72" fill="#0f172a" font-family="Cormorant Garamond, Georgia, serif" font-size="40" font-weight="700">
          ${ROOM_TYPE_LABELS[request.roomType]}
        </text>
        <text x="28" y="97" fill="#516179" font-family="Space Grotesk, Arial, sans-serif" font-size="18">
          Inspired by ${request.inspirationImages.length} uploaded references
        </text>
      </g>

      <g transform="translate(788 82)">
        <rect width="346" height="110" rx="28" fill="rgba(255,255,255,0.84)" />
        <text x="24" y="42" fill="${tenant.brandTheme.secondaryColor}" font-family="Space Grotesk, Arial, sans-serif" font-size="18" font-weight="700">
          RoomRaven concept board
        </text>
        <text x="24" y="74" fill="#516179" font-family="Space Grotesk, Arial, sans-serif" font-size="17">
          ${roomLabel(request.roomType, request.locale)} refresh from your photo + inspiration
        </text>
      </g>

      ${inspirationMarkup}
    </svg>
  `.trim();

  return toDataUrl(svg);
}

function resolveImageUrl(data: unknown) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as {
    images?: Array<{ url?: string; b64_json?: string }>;
    choices?: Array<{
      message?: {
        images?: Array<{
          url?: string;
          b64_json?: string;
          image_url?: { url?: string };
          imageUrl?: { url?: string };
        }>;
      };
    }>;
  };

  const rootImage = payload.images?.[0];

  if (rootImage?.url) {
    return rootImage.url;
  }

  if (rootImage?.b64_json) {
    return `data:image/png;base64,${rootImage.b64_json}`;
  }

  const choiceImage = payload.choices?.[0]?.message?.images?.[0];

  if (!choiceImage) {
    return null;
  }

  return (
    choiceImage.image_url?.url ??
    choiceImage.imageUrl?.url ??
    choiceImage.url ??
    (choiceImage.b64_json ? `data:image/png;base64,${choiceImage.b64_json}` : null)
  );
}

export async function visualizeRoomConcept(
  tenant: Tenant,
  request: VisualizationRequest
): Promise<VisualizationConcept> {
  const prompt = buildVisualizationPrompt(tenant, request);
  const fallbackSvg = createVisualizationFallbackSvg(tenant, request);
  const createdAt = nowIso();
  const id = makeId("concept");
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      id,
      roomType: request.roomType,
      prompt,
      renderMode: "fallback",
      imageUrl: null,
      fallbackSvg,
      createdAt
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
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: request.currentRoomImageDataUrl
                }
              },
              ...request.inspirationImages.map((imageUrl) => ({
                type: "image_url" as const,
                image_url: {
                  url: imageUrl
                }
              }))
            ]
          }
        ],
        modalities: ["image", "text"],
        image_config: {
          aspect_ratio: "4:3",
          image_size: "1K"
        },
        stream: false
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter returned ${response.status}`);
    }

    const data = (await response.json()) as unknown;
    const imageUrl = resolveImageUrl(data);

    if (!imageUrl) {
      throw new Error("No image returned by OpenRouter.");
    }

    return {
      id,
      roomType: request.roomType,
      prompt,
      renderMode: "image",
      imageUrl,
      fallbackSvg,
      createdAt
    };
  } catch (error) {
    console.error("Room visualization fell back to SVG.", error);
    return {
      id,
      roomType: request.roomType,
      prompt,
      renderMode: "fallback",
      imageUrl: null,
      fallbackSvg,
      createdAt
    };
  }
}
