import React from "react";
import { Moon, Sun } from "lucide-react";
import { useDashboardData, useTheme } from "../context/DashboardDataContext";
import CombinedOverviewChart from "../components/CombinedOverviewChart";

export default function VueGenerale() {
  const {
    data,
    dataChronological,
    latest,
    tempAlert,
    gasAlert,
    nowLabel,
    lastUpdate,
    setZone
  } = useDashboardData();

  const { toggleTheme, isDark } = useTheme();

  const alertCount = (tempAlert ? 1 : 0) + (gasAlert ? 1 : 0);

  return (
    <div className="page-inner">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="section-subtitle-only">
            Surveillance imprimante 3D · données temps réel
          </p>
        </div>
        <div className="page-header__tools">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              isDark ? "Passer en mode clair" : "Passer en mode sombre"
            }
            title={isDark ? "Mode clair" : "Mode sombre"}
          >
            {isDark ? (
              <Sun size={18} strokeWidth={2} aria-hidden />
            ) : (
              <Moon size={18} strokeWidth={2} aria-hidden />
            )}
            <span className="theme-toggle__label">
              {isDark ? "Mode clair" : "Mode sombre"}
            </span>
          </button>
          <div className="zone-pills" role="tablist" aria-label="Zone">
            <button
              type="button"
              role="tab"
              aria-selected
              className="zone-pill zone-pill--active"
              onClick={() => setZone("printer")}
            >
              Imprimante 3D
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={false}
              className="zone-pill zone-pill--disabled"
              disabled
            >
              Ligne 2 (bientôt)
            </button>
          </div>
        </div>
      </header>

      <section className="section-block">
        <div className="vue-kpi-grid">
          <div className="vue-kpi-hero">
            <div className="vue-kpi-hero__date">{nowLabel}</div>
            <div className="vue-kpi-hero__temp">
              {latest.temperature != null ? (
                <>
                  {Number(latest.temperature).toFixed(1)}
                  <small> °C</small>
                </>
              ) : (
                <span className="sensor-card__empty">—</span>
              )}
            </div>
            <p className="vue-kpi-hero__caption">
              Température ambiante / caisson
            </p>
            <div className="vue-kpi-hero__chips">
              <span className="vue-kpi-chip">
                Gaz{" "}
                {latest.gas != null ? `${Math.round(latest.gas)} ppm` : "—"}
              </span>
              <span className="vue-kpi-chip">
                Humidité{" "}
                {latest.humidity != null
                  ? `${Number(latest.humidity).toFixed(0)} %`
                  : "—"}
              </span>
            </div>
          </div>

          <div className="vue-kpi-card">
            <div className="vue-kpi-card__label">Points en mémoire</div>
            <div className="vue-kpi-card__value">{data.length}</div>
          </div>

          <div className="vue-kpi-card">
            <div className="vue-kpi-card__label">Dernière mise à jour</div>
            <div
              className="vue-kpi-card__value"
              style={{ fontSize: "1rem", fontWeight: 700 }}
            >
              {lastUpdate}
            </div>
          </div>

          <div
            className={`vue-kpi-card${alertCount > 0 ? " vue-kpi-card--alerts" : ""}`}
          >
            <div className="vue-kpi-card__label">Alertes</div>
            <div
              className={`vue-kpi-card__value${alertCount > 0 ? " vue-kpi-card__value--alert" : ""}`}
            >
              {alertCount}
            </div>
            {alertCount > 0 ? (
              <div className="vue-kpi-card__alert-badge">
                <span className="vue-kpi-card__alert-dot" aria-hidden />
                Actives
              </div>
            ) : null}
          </div>
        </div>

        <CombinedOverviewChart data={dataChronological} />
      </section>
    </div>
  );
}
