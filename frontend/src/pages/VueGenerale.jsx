import React from "react";
import { Download, Moon, Sun } from "lucide-react";
import { useDashboardData, useTheme } from "../context/DashboardDataContext";
import CombinedOverviewChart from "../components/CombinedOverviewChart";
import BedPositionViewer from "../components/bed3d/BedPositionViewer";

function PrinterMetric({ label, value, unit = "" }) {
  return (
    <div className="printer-metric">
      <span className="printer-metric__label">{label}</span>
      <span className="printer-metric__value">
        {value != null ? (
          <>
            {typeof value === "number" ? Number(value).toFixed(1) : value}
            {unit ? <small> {unit}</small> : null}
          </>
        ) : (
          "—"
        )}
      </span>
    </div>
  );
}

export default function VueGenerale() {
  const {
    data,
    dataChronological,
    latest,
    tempAlert,
    gasAlert,
    faultAlert,
    faultLabelFr,
    lastUpdate,
    setZone,
    downloadCsv
  } = useDashboardData();

  const { toggleTheme, isDark } = useTheme();

  const alertCount =
    (tempAlert ? 1 : 0) + (gasAlert ? 1 : 0) + (faultAlert ? 1 : 0);

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
            className="btn-export"
            onClick={() => downloadCsv("dataset")}
            title="Télécharger dataset_labeled.csv"
          >
            <Download size={16} strokeWidth={2} aria-hidden />
            CSV données
          </button>
          <button
            type="button"
            className="btn-export btn-export--secondary"
            onClick={() => downloadCsv("marlin")}
            title="Télécharger marlin_logs.csv"
          >
            <Download size={16} strokeWidth={2} aria-hidden />
            CSV Marlin
          </button>
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
            <div className="vue-kpi-hero__temp">
              {latest.tempMotorTop != null ? (
                <>
                  {Number(latest.tempMotorTop).toFixed(0)}
                  <small> °C</small>
                </>
              ) : (
                <span className="sensor-card__empty">—</span>
              )}
            </div>
            <p className="vue-kpi-hero__caption">Température moteur (haut)</p>
            <div className="vue-kpi-hero__chips">
              <span className="vue-kpi-chip">
                Moteur bas{" "}
                {latest.tempMotorBottom != null
                  ? `${Number(latest.tempMotorBottom).toFixed(0)} °C`
                  : "—"}
              </span>
              <span className="vue-kpi-chip">
                Gaz {latest.gas != null ? Math.round(latest.gas) : "—"}
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

      <BedPositionViewer />

      <section className="section-block panel-grid-2">
        <div className="info-panel">
          <div className="section-heading">
            <h2>Imprimante 3D</h2>
            <p className="section-subtitle">Données Marlin fusionnées</p>
          </div>
          <div className="printer-grid">
            <PrinterMetric
              label="Buse"
              value={latest.nozzleTemp}
              unit={`/ ${latest.nozzleTarget ?? "—"} °C`}
            />
            <PrinterMetric
              label="Plateau"
              value={latest.bedTemp}
              unit={`/ ${latest.bedTarget ?? "—"} °C`}
            />
            <PrinterMetric label="Puissance hotend" value={latest.hotendPower} />
            <PrinterMetric label="Puissance plateau" value={latest.bedPower} />
            <PrinterMetric label="X" value={latest.posX} unit="mm" />
            <PrinterMetric label="Y" value={latest.posY} unit="mm" />
            <PrinterMetric label="Z" value={latest.posZ} unit="mm" />
            <PrinterMetric label="E" value={latest.posE} unit="mm" />
          </div>
        </div>

        <div
          className={`info-panel info-panel--ai${faultAlert ? " info-panel--ai-alert" : ""}`}
        >
          <div className="section-heading">
            <h2>Diagnostics IA</h2>
            <p className="section-subtitle">
              Module IA à connecter — emplacements réservés
            </p>
          </div>
          <dl className="ai-labels">
            <div className="ai-labels__row">
              <dt>État</dt>
              <dd
                className={
                  faultAlert ? "ai-labels__value--alert" : "ai-labels__value"
                }
              >
                {faultLabelFr}
              </dd>
            </div>
            <div className="ai-labels__row">
              <dt>Code défaut</dt>
              <dd className="ai-labels__value">
                {latest.faultCode != null ? latest.faultCode : "—"}
              </dd>
            </div>
            <div className="ai-labels__row">
              <dt>Label brut</dt>
              <dd className="ai-labels__value ai-labels__value--mono">
                {latest.faultLabel || "NORMAL"}
              </dd>
            </div>
            <div className="ai-labels__row ai-labels__row--placeholder">
              <dt>Confiance IA</dt>
              <dd className="ai-labels__value ai-labels__placeholder">—</dd>
            </div>
            <div className="ai-labels__row ai-labels__row--placeholder">
              <dt>Recommandation</dt>
              <dd className="ai-labels__value ai-labels__placeholder">
                En attente du module IA
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
