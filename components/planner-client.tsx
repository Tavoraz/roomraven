"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { RoomRavenBadge } from "@/components/roomraven-badge";
import { chooseWinner, startWinnerStaysTournament } from "@/lib/compare";
import { ROOM_TYPE_LABELS, ROOM_TYPES } from "@/lib/constants";
import type { Locale, RenderMode, RoomType, Tenant } from "@/lib/types";

type UploadedImage = {
  id: string;
  name: string;
  dataUrl: string;
};

type GeneratedConcept = {
  id: string;
  roomType: RoomType;
  prompt: string;
  renderMode: RenderMode;
  imageUrl: string | null;
  fallbackSvg: string;
  createdAt: string;
};

type VisualizationResponse = {
  concept: GeneratedConcept;
};

type BrandPreview = {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoDataUrl: string | null;
};

interface PlannerClientProps {
  tenant: Tenant;
  initialLocale: Locale;
  initialRoomType: RoomType;
  embed: boolean;
}

const MAX_INSPIRATIONS = 6;

const copy = {
  en: {
    title: "Show people what their room could become",
    intro:
      "Choose a room type, upload the space as it looks today, add inspiration, and generate a fresh concept in one clean flow.",
    roomType: "Room type",
    roomPhoto: "Current room photo",
    roomPhotoNote: "Upload one clear image of the room as it looks now.",
    inspirationTitle: "Inspiration images",
    inspirationNote: "Add up to 6 references for finishes, fixtures, furniture, colors, or styling.",
    uploadRoom: "Upload room photo",
    replaceRoom: "Replace photo",
    uploadInspiration: "Add inspiration images",
    inspirationExamples: "Examples: tiles, paint, taps, sink, chair, sofa, desk, lighting.",
    generate: "Generate concept",
    generating: "Generating concept...",
    latestResult: "Latest result",
    latestResultNote: "Review the concept, then keep it or discard it before generating the next one.",
    keepResult: "Keep result",
    discardResult: "Discard result",
    generateHint: "You need one room photo and at least one inspiration image to generate a concept.",
    roomReady: "Room photo ready",
    inspirationsReady: "references added",
    referencesShort: "refs",
    libraryTitle: "Concept library",
    libraryNote: "Keep the results you like. Select at least two from the library to compare them.",
    libraryEmpty: "No kept concepts yet. Generate a concept and keep the ones worth comparing.",
    selected: "selected",
    kept: "kept",
    select: "Select",
    compareCta: "1v1 compare",
    compareAgain: "Compare another set",
    clearSelection: "Clear selection",
    compareTitle: "1v1 compare",
    compareNote: "Pick the image you prefer each time. The winner stays, the next image enters.",
    compareBadge: "Winner stays",
    matchup: "Matchup",
    chooseThis: "Choose this image",
    winnerTitle: "Winner selected",
    winnerNote: "This concept won the run. Generate more ideas or compare a different set whenever you want.",
    compareReady: "Select at least two kept concepts to unlock compare mode.",
    remove: "Remove",
    aiRender: "AI render",
    conceptBoard: "Concept board",
    keptMessage: "Concept added to the library.",
    discardedMessage: "Concept discarded. Generate another one when you are ready.",
    maxInspirationMessage: "Only the first 6 inspiration images were added.",
    roomExamplesTitle: "Flow summary",
    roomExamplesNote: "Upload, generate, keep the good ones, then compare your shortlist.",
    emptyResult: "Your next generated concept will appear here."
  },
  nl: {
    title: "Laat mensen zien wat hun ruimte kan worden",
    intro:
      "Kies een kamertype, upload de huidige ruimte, voeg inspiratie toe en genereer in een eenvoudige flow een nieuw concept.",
    roomType: "Kamertype",
    roomPhoto: "Foto van de huidige ruimte",
    roomPhotoNote: "Upload een duidelijke foto van de ruimte zoals die nu is.",
    inspirationTitle: "Inspiratiebeelden",
    inspirationNote: "Voeg maximaal 6 referenties toe voor afwerking, meubels, kleuren, sanitair of styling.",
    uploadRoom: "Upload ruimtefoto",
    replaceRoom: "Vervang foto",
    uploadInspiration: "Voeg inspiratie toe",
    inspirationExamples: "Voorbeelden: tegels, verf, kranen, wastafel, stoel, bank, bureau, verlichting.",
    generate: "Genereer concept",
    generating: "Concept wordt gegenereerd...",
    latestResult: "Laatste resultaat",
    latestResultNote: "Bekijk het concept en kies daarna bewaren of weggooien voordat je de volgende maakt.",
    keepResult: "Bewaar resultaat",
    discardResult: "Weggooien",
    generateHint: "Je hebt een ruimtefoto en minimaal een inspiratiebeeld nodig om een concept te genereren.",
    roomReady: "Ruimtefoto klaar",
    inspirationsReady: "referenties toegevoegd",
    referencesShort: "refs",
    libraryTitle: "Conceptbibliotheek",
    libraryNote: "Bewaar de resultaten die je goed vindt. Selecteer er minimaal twee om te vergelijken.",
    libraryEmpty: "Nog geen bewaarde concepten. Genereer eerst een concept en bewaar de beste.",
    selected: "geselecteerd",
    kept: "bewaard",
    select: "Selecteer",
    compareCta: "1v1 vergelijken",
    compareAgain: "Vergelijk een andere set",
    clearSelection: "Selectie wissen",
    compareTitle: "1v1 vergelijken",
    compareNote: "Kies steeds het beeld dat je prefereert. De winnaar blijft staan en de volgende komt erbij.",
    compareBadge: "Winnaar blijft",
    matchup: "Vergelijking",
    chooseThis: "Kies dit beeld",
    winnerTitle: "Winnaar gekozen",
    winnerNote: "Dit concept heeft gewonnen. Genereer meer ideeën of vergelijk een andere selectie wanneer je wilt.",
    compareReady: "Selecteer minimaal twee bewaarde concepten om te vergelijken.",
    remove: "Verwijderen",
    aiRender: "AI render",
    conceptBoard: "Conceptboard",
    keptMessage: "Concept toegevoegd aan de bibliotheek.",
    discardedMessage: "Concept weggegooid. Genereer een nieuwe wanneer je wilt.",
    maxInspirationMessage: "Alleen de eerste 6 inspiratiebeelden zijn toegevoegd.",
    roomExamplesTitle: "Flow-overzicht",
    roomExamplesNote: "Upload, genereer, bewaar de goede opties en vergelijk daarna je shortlist.",
    emptyResult: "Je volgende gegenereerde concept verschijnt hier."
  }
} as const;

function themeVars(tenant: Tenant) {
  return {
    "--tenant-primary": tenant.brandTheme.primaryColor,
    "--tenant-secondary": tenant.brandTheme.secondaryColor,
    "--tenant-accent": tenant.brandTheme.accentColor,
    "--tenant-surface": tenant.brandTheme.surfaceColor,
    fontFamily: tenant.brandTheme.fontFamily
  } as React.CSSProperties;
}

function makeClientId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.round(Math.random() * 1_000_000_000)}`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to process the selected image."));
    image.src = src;
  });
}

function getInitials(label: string) {
  const initials = label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "RR";
}

function createPreviewTenant(tenant: Tenant, preview: BrandPreview): Tenant {
  return {
    ...tenant,
    name: preview.name,
    brandTheme: {
      ...tenant.brandTheme,
      logoDataUrl: preview.logoDataUrl,
      primaryColor: preview.primaryColor,
      secondaryColor: preview.secondaryColor,
      accentColor: preview.primaryColor
    }
  };
}

async function normalizeImage(file: File): Promise<UploadedImage> {
  const dataUrl = await fileToDataUrl(file);

  try {
    const image = await loadImage(dataUrl);
    const maxEdge = 1600;
    const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);

    if (longestEdge <= maxEdge && file.size <= 1_200_000) {
      return {
        id: makeClientId("upload"),
        name: file.name,
        dataUrl
      };
    }

    const scale = maxEdge / longestEdge;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to process the selected image.");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return {
      id: makeClientId("upload"),
      name: file.name,
      dataUrl: canvas.toDataURL("image/jpeg", 0.86)
    };
  } catch {
    return {
      id: makeClientId("upload"),
      name: file.name,
      dataUrl
    };
  }
}

function conceptImage(concept: GeneratedConcept | null) {
  if (!concept) {
    return null;
  }

  return concept.imageUrl ?? concept.fallbackSvg;
}

function localizedRoomLabel(locale: Locale, roomType: RoomType) {
  if (locale === "nl") {
    return {
      bathroom: "Badkamer",
      kitchen: "Keuken",
      "living-room": "Woonkamer",
      office: "Kantoor",
      bedroom: "Slaapkamer"
    }[roomType];
  }

  return ROOM_TYPE_LABELS[roomType];
}

export function PlannerClient({ tenant, initialLocale, initialRoomType, embed }: PlannerClientProps) {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [roomType, setRoomType] = useState<RoomType>(initialRoomType);
  const [brandPreview, setBrandPreview] = useState<BrandPreview | null>(null);
  const [currentRoomImage, setCurrentRoomImage] = useState<UploadedImage | null>(null);
  const [inspirationImages, setInspirationImages] = useState<UploadedImage[]>([]);
  const [latestConcept, setLatestConcept] = useState<GeneratedConcept | null>(null);
  const [library, setLibrary] = useState<GeneratedConcept[]>([]);
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>([]);
  const [compareState, setCompareState] = useState<ReturnType<typeof startWinnerStaysTournament> | null>(null);
  const [status, setStatus] = useState<"idle" | "generating">("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const trackedWinnerIdRef = useRef<string | null>(null);

  const text = copy[locale];
  const roomLibrary = useMemo(() => library.filter((concept) => concept.roomType === roomType), [library, roomType]);
  const roomLibraryMap = useMemo(() => new Map(roomLibrary.map((concept) => [concept.id, concept])), [roomLibrary]);
  const orderedSelection = useMemo(
    () => roomLibrary.filter((concept) => selectedConceptIds.includes(concept.id)).map((concept) => concept.id),
    [roomLibrary, selectedConceptIds]
  );
  const displayTenant = brandPreview ? createPreviewTenant(tenant, brandPreview) : tenant;
  const selectedCount = orderedSelection.length;
  const compareChampion = compareState ? roomLibraryMap.get(compareState.championId) ?? null : null;
  const compareChallenger = compareState?.challengerId ? roomLibraryMap.get(compareState.challengerId) ?? null : null;
  const compareWinner = compareState?.winnerId ? roomLibraryMap.get(compareState.winnerId) ?? null : null;
  const currentStep = compareState ? 4 : latestConcept ? 2 : roomLibrary.length > 0 ? 3 : 1;
  const steps = [
    { index: 1, label: locale === "nl" ? "Upload" : "Upload" },
    { index: 2, label: locale === "nl" ? "Beoordeel" : "Review" },
    { index: 3, label: locale === "nl" ? "Bibliotheek" : "Library" },
    { index: 4, label: locale === "nl" ? "Vergelijk" : "Compare" }
  ];

  useEffect(() => {
    if (searchParams.get("previewBrand") !== "1") {
      setBrandPreview(null);
      return;
    }

    const raw = window.sessionStorage.getItem("roomraven:brand-preview");

    if (!raw) {
      setBrandPreview(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<BrandPreview>;

      if (
        typeof parsed.name === "string" &&
        typeof parsed.primaryColor === "string" &&
        typeof parsed.secondaryColor === "string" &&
        (typeof parsed.logoDataUrl === "string" || parsed.logoDataUrl === null)
      ) {
        setBrandPreview({
          name: parsed.name,
          primaryColor: parsed.primaryColor,
          secondaryColor: parsed.secondaryColor,
          logoDataUrl: parsed.logoDataUrl
        });
      } else {
        setBrandPreview(null);
      }
    } catch {
      setBrandPreview(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) {
      return;
    }

    const postHeight = () => {
      window.parent.postMessage(
        {
          type: "roomraven:height",
          height: document.documentElement.scrollHeight
        },
        "*"
      );
    };

    postHeight();
    const observer = new ResizeObserver(postHeight);
    observer.observe(document.body);
    window.addEventListener("resize", postHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", postHeight);
    };
  }, [compareState, embed, latestConcept, roomLibrary.length, selectedCount, status]);

  useEffect(() => {
    const validIds = new Set(roomLibrary.map((concept) => concept.id));
    setSelectedConceptIds((current) => current.filter((id) => validIds.has(id)));

    if (compareState && !compareState.selectedIds.every((id) => validIds.has(id))) {
      setCompareState(null);
    }
  }, [compareState, roomLibrary]);

  useEffect(() => {
    const phase =
      status === "generating"
        ? "generating"
        : compareState?.winnerId
          ? "winner"
          : compareState
            ? "compare"
            : latestConcept
              ? "result"
              : roomLibrary.length > 0
                ? "library"
                : "setup";

    window.dispatchEvent(
      new CustomEvent("roomraven:planner-state", {
        detail: {
          phase,
          roomType,
          roomLabel: localizedRoomLabel(locale, roomType),
          libraryCount: roomLibrary.length,
          selectedCount,
          savedLink: null,
          error
        }
      })
    );
  }, [compareState, error, latestConcept, locale, roomLibrary.length, roomType, selectedCount, status]);

  useEffect(() => {
    if (!compareState?.winnerId || compareState.winnerId === trackedWinnerIdRef.current) {
      return;
    }

    trackedWinnerIdRef.current = compareState.winnerId;

    void fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tenantId: tenant.id,
        sessionId: null,
        roomType,
        locale,
        eventType: "winner_selected",
        metadata: {
          comparedCount: compareState.selectedIds.length,
          flow: "visualizer"
        }
      })
    }).catch(() => null);
  }, [compareState, locale, roomType, tenant.id]);

  useEffect(() => {
    if (!compareState?.winnerId) {
      trackedWinnerIdRef.current = null;
    }
  }, [compareState?.winnerId]);

  function handleRoomTypeChange(nextRoomType: RoomType) {
    if (nextRoomType === roomType) {
      return;
    }

    setRoomType(nextRoomType);
    setLatestConcept(null);
    setSelectedConceptIds([]);
    setCompareState(null);
    setNotice(null);
    setError(null);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("roomType", nextRoomType);
      window.history.replaceState({}, "", url);
    }
  }

  async function handleCurrentRoomUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";

    if (files.length === 0) {
      return;
    }

    try {
      const image = await normalizeImage(files[0]);
      setCurrentRoomImage(image);
      setLatestConcept(null);
      setError(null);
      setNotice(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload the selected image.");
    }
  }

  async function handleInspirationUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";

    if (files.length === 0) {
      return;
    }

    try {
      const remainingSlots = MAX_INSPIRATIONS - inspirationImages.length;

      if (remainingSlots <= 0) {
        setNotice(text.maxInspirationMessage);
        return;
      }

      const nextImages = await Promise.all(files.slice(0, remainingSlots).map((file) => normalizeImage(file)));

      setInspirationImages((current) => [...current, ...nextImages]);
      setLatestConcept(null);
      setError(null);
      setNotice(files.length > remainingSlots ? text.maxInspirationMessage : null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload the selected images.");
    }
  }

  async function handleGenerate() {
    if (!currentRoomImage || inspirationImages.length === 0 || latestConcept) {
      return;
    }

    setStatus("generating");
    setError(null);
    setNotice(null);
    setCompareState(null);

    try {
      const response = await fetch("/api/visualize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tenantId: tenant.id,
          locale,
          roomType,
          currentRoomImageDataUrl: currentRoomImage.dataUrl,
          inspirationImages: inspirationImages.map((image) => image.dataUrl)
        })
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to generate a room concept.");
      }

      const payload = (await response.json()) as VisualizationResponse;
      setLatestConcept(payload.concept);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate a room concept.");
    } finally {
      setStatus("idle");
    }
  }

  function handleKeepResult() {
    if (!latestConcept) {
      return;
    }

    setLibrary((current) => [latestConcept, ...current.filter((concept) => concept.id !== latestConcept.id)].slice(0, 24));
    setSelectedConceptIds((current) => Array.from(new Set([latestConcept.id, ...current])));
    setLatestConcept(null);
    setNotice(text.keptMessage);
    setError(null);
  }

  function handleDiscardResult() {
    setLatestConcept(null);
    setNotice(text.discardedMessage);
    setError(null);
  }

  function handleToggleSelection(conceptId: string) {
    setCompareState(null);
    setSelectedConceptIds((current) =>
      current.includes(conceptId) ? current.filter((id) => id !== conceptId) : [...current, conceptId]
    );
  }

  function handleRemoveConcept(conceptId: string) {
    setLibrary((current) => current.filter((concept) => concept.id !== conceptId));
    setSelectedConceptIds((current) => current.filter((id) => id !== conceptId));
    setCompareState(null);
  }

  function handleStartCompare() {
    if (orderedSelection.length < 2) {
      return;
    }

    setCompareState(startWinnerStaysTournament(orderedSelection));
    setNotice(null);
    setError(null);
  }

  function handleCompareChoice(preferredId: string) {
    setCompareState((current) => (current ? chooseWinner(current, preferredId) : current));
  }

  return (
    <div className="page-shell">
      <div className="planner-shell" data-embed={embed} style={themeVars(displayTenant)}>
        <div className="two-column">
          <div className="stack">
            {brandPreview ? (
              <div className="planner-preview-brand">
                {brandPreview.logoDataUrl ? (
                  <img className="planner-preview-brand-logo" src={brandPreview.logoDataUrl} alt={`${brandPreview.name} logo`} />
                ) : (
                  <span className="planner-preview-brand-fallback">{getInitials(brandPreview.name)}</span>
                )}
                <span className="planner-preview-brand-name">{brandPreview.name}</span>
              </div>
            ) : (
              <RoomRavenBadge compact />
            )}
            <h1 className="section-title">{text.title}</h1>
            <p className="lead">{text.intro}</p>
            <div className="chip-row">
              {displayTenant.supportedLocales.map((supportedLocale) => (
                <button
                  key={supportedLocale}
                  type="button"
                  className={`chip ${locale === supportedLocale ? "active" : ""}`}
                  onClick={() => setLocale(supportedLocale)}
                >
                  {supportedLocale.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="planner-steps" aria-label="Planner progress">
              {steps.map((step) => (
                <div key={step.index} className={`planner-step ${currentStep >= step.index ? "active" : ""}`}>
                  <span className="planner-step-index">{step.index}</span>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="preview-card">
            <h3>{text.roomExamplesTitle}</h3>
            <p className="muted">{text.roomExamplesNote}</p>
            <div className="chip-row">
              <span className="chip active">{localizedRoomLabel(locale, roomType)}</span>
              <span className="chip">{currentRoomImage ? text.roomReady : text.roomPhoto}</span>
              <span className="chip">
                {inspirationImages.length} {text.inspirationsReady}
              </span>
              <span className="chip">
                {roomLibrary.length} {text.kept}
              </span>
            </div>
          </div>
        </div>

        <section id="planner-setup" className="panel raven-target" style={{ marginTop: 18 }}>
          <div className="stack">
            <div className="planner-section-header">
              <div>
                <h3 style={{ margin: 0 }}>1. {text.roomType}</h3>
                <p className="small-note">{text.generateHint}</p>
              </div>
              <div className="planner-summary">
                <span>{localizedRoomLabel(locale, roomType)}</span>
                <span>
                  {inspirationImages.length}/{MAX_INSPIRATIONS} {text.referencesShort}
                </span>
              </div>
            </div>

            <div className="check-grid room-type-grid">
              {ROOM_TYPES.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`check-chip ${roomType === option ? "active" : ""}`}
                  onClick={() => handleRoomTypeChange(option)}
                >
                  {localizedRoomLabel(locale, option)}
                </button>
              ))}
            </div>

            <div className="upload-grid">
              <div className="upload-panel">
                <div className="planner-section-header">
                  <div>
                    <h3 style={{ margin: 0 }}>2. {text.roomPhoto}</h3>
                    <p className="small-note">{text.roomPhotoNote}</p>
                  </div>
                </div>

                {currentRoomImage ? (
                  <div className="upload-preview-card">
                    <img src={currentRoomImage.dataUrl} alt={currentRoomImage.name} />
                    <div className="upload-preview-meta">
                      <strong>{currentRoomImage.name}</strong>
                      <div className="inline-actions">
                        <label className="cta cta-secondary upload-inline-action">
                          {text.replaceRoom}
                          <input type="file" accept="image/*" hidden onChange={handleCurrentRoomUpload} />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="upload-dropzone">
                    <input type="file" accept="image/*" hidden onChange={handleCurrentRoomUpload} />
                    <strong>{text.uploadRoom}</strong>
                    <span className="small-note">{text.roomPhotoNote}</span>
                  </label>
                )}
              </div>

              <div className="upload-panel">
                <div className="planner-section-header">
                  <div>
                    <h3 style={{ margin: 0 }}>3. {text.inspirationTitle}</h3>
                    <p className="small-note">{text.inspirationNote}</p>
                  </div>
                </div>

                <label className="upload-dropzone upload-dropzone-compact">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    multiple
                    onChange={handleInspirationUpload}
                    disabled={inspirationImages.length >= MAX_INSPIRATIONS}
                  />
                  <strong>{text.uploadInspiration}</strong>
                  <span className="small-note">{text.inspirationExamples}</span>
                </label>

                {inspirationImages.length > 0 ? (
                  <div className="upload-thumb-grid">
                    {inspirationImages.map((image) => (
                      <article key={image.id} className="upload-thumb">
                        <img src={image.dataUrl} alt={image.name} />
                        <div className="upload-thumb-meta">
                          <strong>{image.name}</strong>
                          <button
                            type="button"
                            className="chip upload-thumb-remove"
                            onClick={() => {
                              setInspirationImages((current) => current.filter((item) => item.id !== image.id));
                              setLatestConcept(null);
                            }}
                          >
                            {text.remove}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="upload-empty-state">
                    <p className="small-note">{text.inspirationExamples}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="inline-actions">
              <button
                type="button"
                className="cta cta-primary"
                disabled={!currentRoomImage || inspirationImages.length === 0 || status === "generating" || !!latestConcept}
                onClick={handleGenerate}
              >
                {status === "generating" ? text.generating : text.generate}
              </button>
              {latestConcept ? <span className="small-note">{text.latestResultNote}</span> : null}
            </div>
            {notice ? <div className="status-banner">{notice}</div> : null}
            {error ? <div className="status-banner">{error}</div> : null}
          </div>
        </section>

        <section id="planner-result" className="panel raven-target" style={{ marginTop: 18 }}>
          <div className="stack">
            <div className="planner-section-header">
              <div>
                <h3 style={{ margin: 0 }}>4. {text.latestResult}</h3>
                <p className="small-note">{text.latestResultNote}</p>
              </div>
              {latestConcept ? (
                <span className="comparison-badge">
                  {latestConcept.renderMode === "image" ? text.aiRender : text.conceptBoard}
                </span>
              ) : null}
            </div>

            {latestConcept ? (
              <div className="result-grid">
                <article className="option-card concept-focus-card">
                  <img
                    src={conceptImage(latestConcept) ?? undefined}
                    alt={`${localizedRoomLabel(locale, roomType)} concept`}
                  />
                  <div className="option-meta">
                    <strong>{localizedRoomLabel(locale, roomType)} concept</strong>
                    <span className="small-note">
                      {latestConcept.renderMode === "image" ? text.aiRender : text.conceptBoard}
                    </span>
                  </div>
                </article>

                <div className="preview-card result-actions-card">
                  <h3>{text.latestResult}</h3>
                  <p className="muted">{text.latestResultNote}</p>
                  <div className="stack">
                    <button type="button" className="cta cta-primary" onClick={handleKeepResult}>
                      {text.keepResult}
                    </button>
                    <button type="button" className="cta cta-ghost" onClick={handleDiscardResult}>
                      {text.discardResult}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="result-placeholder">
                <p className="small-note">{status === "generating" ? text.generating : text.emptyResult}</p>
              </div>
            )}
          </div>
        </section>

        <section id="planner-library" className="panel raven-target" style={{ marginTop: 18 }}>
          <div className="stack">
            <div className="planner-section-header">
              <div>
                <h3 style={{ margin: 0 }}>{text.libraryTitle}</h3>
                <p className="small-note">{text.libraryNote}</p>
              </div>
              <div className="planner-summary">
                <span>
                  {roomLibrary.length} {text.kept}
                </span>
                <span>
                  {selectedCount} {text.selected}
                </span>
              </div>
            </div>

            {roomLibrary.length === 0 ? (
              <div className="upload-empty-state">
                <p className="small-note">{text.libraryEmpty}</p>
              </div>
            ) : (
              <>
                <div className="library-grid">
                  {roomLibrary.map((concept, index) => {
                    const active = selectedConceptIds.includes(concept.id);

                    return (
                      <article key={concept.id} className={`option-card concept-library-card ${active ? "selected" : ""}`}>
                        <button type="button" className="concept-select" onClick={() => handleToggleSelection(concept.id)}>
                          <img
                            src={conceptImage(concept) ?? undefined}
                            alt={`${localizedRoomLabel(locale, roomType)} idea ${index + 1}`}
                          />
                        </button>
                        <div className="option-meta">
                          <strong>
                            {localizedRoomLabel(locale, roomType)} idea {index + 1}
                          </strong>
                          <span className="small-note">
                            {concept.renderMode === "image" ? text.aiRender : text.conceptBoard}
                          </span>
                        </div>
                        <div className="inline-actions concept-card-actions">
                          <button
                            type="button"
                            className={`chip ${active ? "active" : ""}`}
                            onClick={() => handleToggleSelection(concept.id)}
                          >
                            {active ? `${text.selected}` : text.select}
                          </button>
                          <button type="button" className="chip" onClick={() => handleRemoveConcept(concept.id)}>
                            {text.remove}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="inline-actions">
                  <button
                    type="button"
                    className="cta cta-primary"
                    disabled={selectedCount < 2}
                    onClick={handleStartCompare}
                  >
                    {text.compareCta}
                  </button>
                  {selectedCount > 0 ? (
                    <button type="button" className="cta cta-ghost" onClick={() => setSelectedConceptIds([])}>
                      {text.clearSelection}
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </section>

        <section id="planner-compare" className="panel raven-target" style={{ marginTop: 18 }}>
          <div className="stack">
            <div className="planner-section-header">
              <div>
                <h3 style={{ margin: 0 }}>{text.compareTitle}</h3>
                <p className="small-note">{text.compareNote}</p>
              </div>
              <span className="comparison-badge">{text.compareBadge}</span>
            </div>

            {!compareState ? (
              <div className="upload-empty-state">
                <p className="small-note">{text.compareReady}</p>
              </div>
            ) : compareWinner ? (
              <div className="result-grid">
                <article className="option-card concept-focus-card">
                  <img
                    src={conceptImage(compareWinner) ?? undefined}
                    alt={`${localizedRoomLabel(locale, roomType)} comparison winner`}
                  />
                  <div className="option-meta">
                    <strong>{text.winnerTitle}</strong>
                    <span className="small-note">
                      {compareWinner.renderMode === "image" ? text.aiRender : text.conceptBoard}
                    </span>
                  </div>
                </article>

                <div className="preview-card result-actions-card">
                  <h3>{text.winnerTitle}</h3>
                  <p className="muted">{text.winnerNote}</p>
                  <div className="stack">
                    <button type="button" className="cta cta-primary" onClick={() => setCompareState(null)}>
                      {text.compareAgain}
                    </button>
                    <button type="button" className="cta cta-ghost" onClick={() => setSelectedConceptIds([])}>
                      {text.clearSelection}
                    </button>
                  </div>
                </div>
              </div>
            ) : compareChampion && compareChallenger ? (
              <>
                <div className="planner-summary">
                  <span>
                    {text.matchup} {compareState.challengerIndex} / {compareState.selectedIds.length - 1}
                  </span>
                </div>
                <div className="matchup-grid">
                  {[compareChampion, compareChallenger].map((concept) => (
                    <button
                      key={concept.id}
                      type="button"
                      className="matchup-card"
                      onClick={() => handleCompareChoice(concept.id)}
                    >
                      <img
                        src={conceptImage(concept) ?? undefined}
                        alt={`${localizedRoomLabel(locale, roomType)} comparison option`}
                      />
                      <div className="matchup-meta">
                        <strong>{text.chooseThis}</strong>
                        <span className="small-note">
                          {concept.renderMode === "image" ? text.aiRender : text.conceptBoard}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
