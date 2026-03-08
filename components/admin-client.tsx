"use client";

import { useMemo, useState } from "react";

import { FONT_OPTIONS, ROOM_TYPE_LABELS, ROOM_TYPES } from "@/lib/constants";
import { formatPercent } from "@/lib/utils";
import type { AnalyticsSummary, CatalogImport, Tenant } from "@/lib/types";

interface AdminClientProps {
  tenants: Tenant[];
  tenant: Tenant;
  analytics: AnalyticsSummary;
  latestCatalogImport: CatalogImport | null;
  baseUrl: string;
}

function buildCatalogJson(importData: CatalogImport | null, tenant: Tenant) {
  return JSON.stringify(
    importData ?? {
      tenantId: tenant.id,
      name: `${tenant.name} catalog`,
      mappings: {
        toilet: {
          label: "Toilet package",
          categoryUrl: tenant.categoryLinks.toilet,
          note: "Generic toilet recommendation."
        },
        sink: {
          label: "Vanity and sink set",
          categoryUrl: tenant.categoryLinks.sink,
          note: "Generic vanity recommendation."
        },
        shower: {
          label: "Walk-in shower package",
          categoryUrl: tenant.categoryLinks.shower,
          note: "Generic shower recommendation."
        },
        bath: {
          label: "Bathtub package",
          categoryUrl: tenant.categoryLinks.bath,
          note: "Generic bath recommendation."
        }
      }
    },
    null,
    2
  );
}

function themeVars(tenant: Tenant) {
  return {
    "--tenant-primary": tenant.brandTheme.primaryColor,
    "--tenant-secondary": tenant.brandTheme.secondaryColor,
    "--tenant-accent": tenant.brandTheme.accentColor,
    "--tenant-surface": tenant.brandTheme.surfaceColor,
    fontFamily: tenant.brandTheme.fontFamily
  } as React.CSSProperties;
}

export function AdminClient({ tenants, tenant, analytics, latestCatalogImport, baseUrl }: AdminClientProps) {
  const [form, setForm] = useState({
    name: tenant.name,
    defaultLocale: tenant.defaultLocale,
    supportedLocales: tenant.supportedLocales,
    enabledRoomTypes: tenant.enabledRoomTypes,
    brandTheme: tenant.brandTheme,
    categoryLinks: tenant.categoryLinks
  });
  const [catalogPayload, setCatalogPayload] = useState(buildCatalogJson(latestCatalogImport, tenant));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const embedSnippet = useMemo(
    () => `<script src="${baseUrl}/roomraven-embed.js"></script>
<div id="roomraven-root"></div>
<script>
  RoomRaven.init({
    tenantId: "${tenant.id}",
    locale: "${tenant.defaultLocale}",
    roomType: "${tenant.enabledRoomTypes[0] ?? "bathroom"}",
    mountTarget: "#roomraven-root"
  });
</script>`,
    [baseUrl, tenant.defaultLocale, tenant.enabledRoomTypes, tenant.id]
  );

  async function handleThemeUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);

    const response = await fetch(`/api/tenants/${tenant.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | { tenant?: Tenant } | null;

    if (!response.ok) {
      setStatusMessage(payload && "error" in payload ? payload.error ?? "Update failed." : "Update failed.");
      return;
    }

    setStatusMessage("Tenant settings updated.");
  }

  async function handleCatalogImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);

    try {
      const parsed = JSON.parse(catalogPayload) as {
        name?: string;
        mappings: Record<string, { label: string; categoryUrl: string; note: string }>;
      };

      const response = await fetch("/api/catalog-imports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tenantId: tenant.id,
          name: parsed.name ?? `${tenant.name} catalog`,
          mappings: parsed.mappings
        })
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Catalog import failed.");
      }

      setStatusMessage("Catalog mappings imported.");
    } catch (catalogError) {
      setStatusMessage(catalogError instanceof Error ? catalogError.message : "Catalog import failed.");
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Unable to read the selected file."));
      reader.readAsDataURL(file);
    });

    setForm((current) => ({
      ...current,
      brandTheme: {
        ...current.brandTheme,
        logoDataUrl: dataUrl
      }
    }));
  }

  return (
    <div className="page-shell">
      <div className="tenant-shell" style={themeVars(tenant)}>
        <div className="two-column">
          <div className="stack">
            <span className="eyebrow">White-label admin</span>
            <h1 className="section-title">Retailer configuration</h1>
            <p className="lead">Pick a tenant, tune the brand kit, update catalog links, and copy the embed snippet.</p>
            <div className="field">
              <label htmlFor="tenant-select">Tenant</label>
              <select
                id="tenant-select"
                value={tenant.id}
                onChange={(event) => {
                  window.location.href = `/admin?tenantId=${event.target.value}`;
                }}
              >
                {tenants.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="preview-card" style={themeVars({ ...tenant, brandTheme: form.brandTheme })}>
            <h3>Brand preview</h3>
            <p className="muted">This is the shopper-facing shell inside the embedded planner.</p>
            <div
              style={{
                minHeight: 180,
                padding: 18,
                borderRadius: 22,
                background:
                  "linear-gradient(140deg, color-mix(in srgb, var(--tenant-primary) 14%, white), rgba(255,255,255,0.92))",
                border: "1px solid rgba(15,23,42,0.08)"
              }}
            >
              {form.brandTheme.logoDataUrl ? (
                <img src={form.brandTheme.logoDataUrl} alt={`${form.name} logo`} style={{ height: 48, width: "auto" }} />
              ) : null}
              <h3 style={{ marginTop: 18 }}>Room visualizer</h3>
              <p className="small-note">Colors and logo update the planner instantly for this tenant.</p>
            </div>
          </div>
        </div>

        <div className="metrics-grid" style={{ marginTop: 18 }}>
          <article className="metric-card">
            <h3>Planner starts</h3>
            <p className="metric-value">{analytics.starts}</p>
            <span className="small-note">All generated sessions for this tenant.</span>
          </article>
          <article className="metric-card">
            <h3>Generation success</h3>
            <p className="metric-value">{formatPercent(analytics.generationSuccessRate)}</p>
            <span className="small-note">Successful layout generation vs session starts.</span>
          </article>
          <article className="metric-card">
            <h3>Matchup completion</h3>
            <p className="metric-value">{formatPercent(analytics.matchupCompletionRate)}</p>
            <span className="small-note">Sessions that reached a winning layout.</span>
          </article>
          <article className="metric-card">
            <h3>Saved projects</h3>
            <p className="metric-value">{analytics.savedProjects}</p>
            <span className="small-note">Magic-link saves.</span>
          </article>
          <article className="metric-card">
            <h3>Shopping list rate</h3>
            <p className="metric-value">{formatPercent(analytics.shoppingListRate)}</p>
            <span className="small-note">Saved pages opened at least once.</span>
          </article>
          <article className="metric-card">
            <h3>Retailer clicks</h3>
            <p className="metric-value">{analytics.retailerClicks}</p>
            <span className="small-note">Outbound clicks to category pages.</span>
          </article>
        </div>

        <div className="admin-grid" style={{ marginTop: 18 }}>
          <form id="tenant-settings" className="panel stack raven-target" onSubmit={handleThemeUpdate}>
            <h3 style={{ margin: 0 }}>Brand kit and tenant settings</h3>
            <p className="small-note" style={{ margin: 0 }}>Set the basics first. Everything below affects the embedded planner immediately.</p>
            <div className="field">
              <label htmlFor="tenant-name">Tenant name</label>
              <input
                id="tenant-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="field-row">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="default-locale">Default locale</label>
                <select
                  id="default-locale"
                  value={form.defaultLocale}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, defaultLocale: event.target.value as Tenant["defaultLocale"] }))
                  }
                >
                  <option value="en">English</option>
                  <option value="nl">Dutch</option>
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="font-family">Font</label>
                <select
                  id="font-family"
                  value={form.brandTheme.fontFamily}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      brandTheme: {
                        ...current.brandTheme,
                        fontFamily: event.target.value
                      }
                    }))
                  }
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field-row">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="primary-color">Primary color</label>
                <input
                  id="primary-color"
                  type="color"
                  value={form.brandTheme.primaryColor}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      brandTheme: {
                        ...current.brandTheme,
                        primaryColor: event.target.value
                      }
                    }))
                  }
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="secondary-color">Secondary color</label>
                <input
                  id="secondary-color"
                  type="color"
                  value={form.brandTheme.secondaryColor}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      brandTheme: {
                        ...current.brandTheme,
                        secondaryColor: event.target.value
                      }
                    }))
                  }
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="accent-color">Accent color</label>
                <input
                  id="accent-color"
                  type="color"
                  value={form.brandTheme.accentColor}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      brandTheme: {
                        ...current.brandTheme,
                        accentColor: event.target.value
                      }
                    }))
                  }
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="surface-color">Surface color</label>
                <input
                  id="surface-color"
                  type="color"
                  value={form.brandTheme.surfaceColor}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      brandTheme: {
                        ...current.brandTheme,
                        surfaceColor: event.target.value
                      }
                    }))
                  }
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="logo-upload">Logo upload</label>
              <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} />
            </div>
            <div className="field">
              <label htmlFor="supported-locales">Supported locales</label>
              <select
                id="supported-locales"
                multiple
                value={form.supportedLocales}
                onChange={(event) => {
                  const selected = Array.from(event.currentTarget.selectedOptions).map((option) => option.value) as Tenant["supportedLocales"];
                  setForm((current) => ({ ...current, supportedLocales: selected }));
                }}
              >
                <option value="en">English</option>
                <option value="nl">Dutch</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="enabled-room-types">Enabled room types</label>
              <select
                id="enabled-room-types"
                multiple
                value={form.enabledRoomTypes}
                onChange={(event) => {
                  const selected = Array.from(event.currentTarget.selectedOptions).map((option) => option.value) as Tenant["enabledRoomTypes"];
                  setForm((current) => ({ ...current, enabledRoomTypes: selected }));
                }}
              >
                {ROOM_TYPES.map((roomType) => (
                  <option key={roomType} value={roomType}>
                    {ROOM_TYPE_LABELS[roomType]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-grid">
              {(["toilet", "sink", "shower", "bath"] as const).map((fixtureType) => (
                <div className="field" key={fixtureType}>
                  <label htmlFor={`category-${fixtureType}`}>{fixtureType} category URL</label>
                  <input
                    id={`category-${fixtureType}`}
                    value={form.categoryLinks[fixtureType]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        categoryLinks: {
                          ...current.categoryLinks,
                          [fixtureType]: event.target.value
                        }
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            <button type="submit" className="cta cta-primary">
              Update tenant settings
            </button>
            {statusMessage ? <div className="status-banner">{statusMessage}</div> : null}
          </form>

          <div className="stack">
            <form id="catalog-mappings" className="panel stack raven-target" onSubmit={handleCatalogImport}>
              <h3 style={{ margin: 0 }}>Catalog mappings</h3>
              <p className="small-note">V1 uses generic item mappings and retailer category links instead of SKU-level integration.</p>
              <div className="field">
                <label htmlFor="catalog-json">Catalog import JSON</label>
                <textarea
                  id="catalog-json"
                  value={catalogPayload}
                  onChange={(event) => setCatalogPayload(event.target.value)}
                />
              </div>
              <button type="submit" className="cta cta-secondary">
                Import catalog mappings
              </button>
            </form>

            <div id="embed-snippet" className="panel stack raven-target">
              <h3 style={{ margin: 0 }}>Embed snippet</h3>
              <p className="small-note">Copy this into the retailer site once branding and category links are ready.</p>
              <pre className="code-block">{embedSnippet}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
