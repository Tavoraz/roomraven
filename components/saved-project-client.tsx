"use client";

import { useEffect } from "react";

import type { LayoutOption, LayoutSession, SavedProject, Tenant } from "@/lib/types";

interface SavedProjectClientProps {
  project: SavedProject;
  session: LayoutSession;
  winner: LayoutOption;
  tenant: Tenant;
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

export function SavedProjectClient({ project, session, winner, tenant }: SavedProjectClientProps) {
  useEffect(() => {
    void fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tenantId: tenant.id,
        sessionId: session.id,
        roomType: session.roomType,
        locale: project.locale,
        eventType: "shopping_list_viewed",
        metadata: {
          token: project.token
        }
      })
    });
  }, [project.locale, project.token, session.id, session.roomType, tenant.id]);

  return (
    <div className="page-shell">
      <div className="tenant-shell" style={themeVars(tenant)}>
        <div className="saved-grid">
          <div className="stack">
            <span className="eyebrow">Saved project</span>
            <h1 className="section-title">Winning bathroom layout</h1>
            <p className="lead">This project can be reopened any time with the magic link. No account is required.</p>
            <img className="saved-image" src={winner.imageUrl ?? winner.fallbackSvg} alt="Winning bathroom layout" />
          </div>
          <div id="saved-shopping-list" className="panel stack raven-target">
            <h3 style={{ margin: 0 }}>Shopping list</h3>
            <p className="small-note" style={{ margin: 0 }}>Open the matching retailer category for each item to continue the renovation journey.</p>
            <div className="saved-list">
              {project.shoppingList.map((item) => (
                <article key={item.fixtureType} className="feature-card">
                  <strong>{item.label}</strong>
                  <span className="small-note">
                    Quantity {item.quantity} · {item.note}
                  </span>
                  <a
                    href={item.categoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      void fetch("/api/events", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                          tenantId: tenant.id,
                          sessionId: session.id,
                          roomType: session.roomType,
                          locale: project.locale,
                          eventType: "retailer_click",
                          metadata: {
                            categoryUrl: item.categoryUrl,
                            fixtureType: item.fixtureType
                          }
                        })
                      });
                    }}
                  >
                    Open retailer category
                  </a>
                </article>
              ))}
            </div>
            <div className="status-banner">
              Saved for {project.email} on {new Date(project.createdAt).toLocaleString()}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
