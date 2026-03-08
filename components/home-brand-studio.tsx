"use client";

import type { ChangeEvent, CSSProperties } from "react";
import { useState } from "react";

interface HomeBrandStudioProps {
  initialBrandName: string;
  initialPrimaryColor: string;
  initialSecondaryColor: string;
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

export function HomeBrandStudio({
  initialBrandName,
  initialPrimaryColor,
  initialSecondaryColor
}: HomeBrandStudioProps) {
  const [brandName, setBrandName] = useState(initialBrandName);
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const normalizedBrandName = brandName.trim() || "Your brand";
  const previewTheme = {
    "--brand-preview-primary": primaryColor,
    "--brand-preview-secondary": secondaryColor
  } as CSSProperties;

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Unable to read the selected logo."));
        reader.readAsDataURL(file);
      });

      setLogoDataUrl(dataUrl);
      setUploadError(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to read the selected logo.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="home-brand-studio" style={previewTheme}>
      <div className="feature-card home-brand-customizer">
        <div className="stack">
          <span className="home-kicker">Live preview</span>
          <h3>Try your own brand kit</h3>
          <span className="small-note">Adjust the colors, upload a logo, and see the experience update instantly.</span>
        </div>

        <div className="field">
          <label htmlFor="home-brand-name">Brand name</label>
          <input
            id="home-brand-name"
            value={brandName}
            onChange={(event) => setBrandName(event.target.value)}
            placeholder="Your brand"
          />
        </div>

        <div className="field-grid home-brand-input-grid">
          <div className="field">
            <label htmlFor="home-brand-primary">Primary color</label>
            <div className="home-brand-color-row">
              <input
                id="home-brand-primary"
                className="home-brand-color-picker"
                type="color"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
              />
              <span className="home-brand-color-code">{primaryColor.toUpperCase()}</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="home-brand-secondary">Secondary color</label>
            <div className="home-brand-color-row">
              <input
                id="home-brand-secondary"
                className="home-brand-color-picker"
                type="color"
                value={secondaryColor}
                onChange={(event) => setSecondaryColor(event.target.value)}
              />
              <span className="home-brand-color-code">{secondaryColor.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="home-brand-logo">Logo</label>
          <div className="home-brand-logo-tools">
            <input
              id="home-brand-logo"
              className="home-brand-upload-input"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
            />
            <label className="cta cta-secondary home-brand-upload-button" htmlFor="home-brand-logo">
              Upload logo
            </label>
            {logoDataUrl ? (
              <button className="cta cta-ghost" type="button" onClick={() => setLogoDataUrl(null)}>
                Remove logo
              </button>
            ) : null}
          </div>
          <span className="small-note">{uploadError ?? "PNG, JPG, or SVG. If no logo is uploaded, the preview uses your brand name."}</span>
        </div>

        <div className="home-brand-logo-preview">
          <BrandSignature brandName={normalizedBrandName} logoDataUrl={logoDataUrl} />
        </div>
      </div>

      <div className="feature-card home-brand-preview-card">
        <div className="home-brand-preview-shell">
          <div className="home-brand-preview-header">
            <BrandSignature brandName={normalizedBrandName} logoDataUrl={logoDataUrl} compact />
            <span className="home-brand-preview-badge">Embedded or standalone</span>
          </div>

          <div className="home-brand-preview-stage">
            <div className="home-brand-preview-copy">
              <span className="home-brand-preview-kicker">Your branded experience</span>
              <h3>Let shoppers see the result in your own look and feel.</h3>
              <p>Logo, colors, and call-to-action styling update live so clients can picture RoomRaven on your site.</p>
              <span className="home-brand-preview-cta">Start designing</span>
            </div>

            <div className="home-brand-preview-showcase">
              <div className="home-brand-preview-room">
                <div className="home-brand-preview-wall" />
                <div className="home-brand-preview-floor" />
                <div className="home-brand-preview-vanity" />
                <div className="home-brand-preview-window" />
                <div className="home-brand-preview-bath" />
              </div>

              <div className="home-brand-preview-swatches">
                <span className="home-brand-preview-swatch home-brand-preview-swatch-primary" />
                <span className="home-brand-preview-swatch home-brand-preview-swatch-secondary" />
                <span className="home-brand-preview-swatch home-brand-preview-swatch-neutral" />
              </div>
            </div>
          </div>

          <div className="home-brand-preview-footer">
            <div className="home-brand-preview-strip">
              <span className="home-brand-preview-strip-label">On-site planner</span>
              <div className="home-brand-preview-strip-bar">
                <span className="home-brand-preview-strip-fill" />
              </div>
              <span className="home-brand-preview-strip-note">Shoppers stay inside your branded journey.</span>
            </div>

            <div className="home-brand-preview-compare">
              <span className="home-brand-preview-strip-label">1v1 compare</span>
              <div className="home-brand-preview-compare-cards">
                <span className="home-brand-preview-compare-card home-brand-preview-compare-card-primary" />
                <span className="home-brand-preview-compare-versus">VS</span>
                <span className="home-brand-preview-compare-card home-brand-preview-compare-card-secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandSignature({
  brandName,
  logoDataUrl,
  compact = false
}: {
  brandName: string;
  logoDataUrl: string | null;
  compact?: boolean;
}) {
  return (
    <div className={`home-brand-signature${compact ? " compact" : ""}`}>
      {logoDataUrl ? (
        <img className="home-brand-signature-logo" src={logoDataUrl} alt={`${brandName} logo`} />
      ) : (
        <span className="home-brand-signature-fallback">{getInitials(brandName)}</span>
      )}
      <div className="home-brand-signature-copy">
        <strong>{brandName}</strong>
        {!compact ? <span className="small-note">Brand preview</span> : null}
      </div>
    </div>
  );
}
