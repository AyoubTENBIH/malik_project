import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ref,
  onValue,
  query,
  orderByKey,
  limitToLast
} from "firebase/database";
import { rtdb } from "../firebase";
import {
  normalizeSensorReading,
  sortReadingsNewestFirst
} from "../utils/sensorReading";
import CombinedOverviewChart from "./CombinedOverviewChart";
import MetricChart from "./MetricChart";
import "./Dashboard.css";

const CAPTEURS_PATH =
  process.env.REACT_APP_FIREBASE_CAPTEURS_PATH || "capteurs";

/** Limite les lectures RTDB + le travail des graphiques (évite le lag si l’historique grossit). */
const MAX_POINTS = Math.min(
  500,
  Math.max(
    50,
    Number(process.env.REACT_APP_FIREBASE_MAX_POINTS) || 200
  )
);

const METRICS = [
  { key: "temperature", title: "Température", unit: "°C", color: "#ef4444" },
  { key: "humidity", title: "Humidité", unit: "%", color: "#3b82f6" },
  { key: "gas", title: "Gaz", unit: "ppm", color: "#10b981" },
  { key: "courant", title: "Courant", unit: "A", color: "#8b5cf6" },
  { key: "tension", title: "Tension", unit: "V", color: "#f59e0b" },
  { key: "piezo", title: "Piezo / vibration", unit: "", color: "#ec4899" },
  { key: "x", title: "Accéléro X", unit: "m/s²", color: "#06b6d4" },
  { key: "y", title: "Accéléro Y", unit: "m/s²", color: "#84cc16" },
  { key: "z", title: "Accéléro Z", unit: "m/s²", color: "#f97316" },
  { key: "gyroX", title: "Gyro X", unit: "rad/s", color: "#14b8a6" },
  { key: "gyroY", title: "Gyro Y", unit: "rad/s", color: "#a855f7" },
  { key: "gyroZ", title: "Gyro Z", unit: "rad/s", color: "#eab308" }
];

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [activeNav, setActiveNav] = useState("overview");
  const [zone, setZone] = useState("printer");

  useEffect(() => {
    const capteursRef = query(
      ref(rtdb, CAPTEURS_PATH),
      orderByKey(),
      limitToLast(MAX_POINTS)
    );

    const unsub = onValue(capteursRef, snapshot => {
      const val = snapshot.val();
      if (!val || typeof val !== "object") {
        setData([]);
        return;
      }

      const items = Object.entries(val).map(([id, payload]) => ({
        id,
        ...normalizeSensorReading(payload)
      }));

      setData(sortReadingsNewestFirst(items));
    });

    return () => unsub();
  }, []);

  /** Ordre croissant du temps — un seul tri pour tous les graphiques (Recharts). */
  const dataChronological = useMemo(
    () =>
      data
        .slice()
        .sort((a, b) => (a._timeMs || 0) - (b._timeMs || 0)),
    [data]
  );

  const latest = data[0] || {};

  const format = (value, unit = "") => {
    if (value === undefined || value === null) return "—";
    if (typeof value === "boolean") return value ? "Oui" : "Non";
    return `${value} ${unit}`.trim();
  };

  const isOnline = data.length > 0;
  const tempAlert =
    latest.temperature != null && latest.temperature > 30;
  const gasAlert = latest.gas != null && latest.gas > 400;

  const nowLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const lastUpdate =
    latest._timeMs != null
      ? new Date(latest._timeMs).toLocaleString()
      : "—";

  const onNav = useCallback(section => {
    setActiveNav(section);
    if (section === "overview") scrollToId("section-overview");
    if (section === "kpis") scrollToId("section-kpis");
    if (section === "charts") scrollToId("section-charts");
  }, []);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar" aria-label="Navigation">
        <div className="dashboard-brand">
          <div className="dashboard-brand__logo">⚡</div>
          <div className="dashboard-brand__text">
            <strong>IoT Print</strong>
            <small>Maintenance prédictive</small>
          </div>
        </div>

        <nav className="dashboard-nav">
          <button
            type="button"
            className={activeNav === "overview" ? "is-active" : ""}
            onClick={() => onNav("overview")}
          >
            <IconLayout />
            Vue générale
          </button>
          <button
            type="button"
            className={activeNav === "kpis" ? "is-active" : ""}
            onClick={() => onNav("kpis")}
          >
            <IconGauge />
            Capteurs
          </button>
          <button
            type="button"
            className={activeNav === "charts" ? "is-active" : ""}
            onClick={() => onNav("charts")}
          >
            <IconChart />
            Graphiques
          </button>
        </nav>

        <div className="dashboard-sidebar__footer">
          Firebase RTDB · « {CAPTEURS_PATH} » · max {MAX_POINTS} points affichés
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1>Dashboard</h1>
            <p className="dashboard-topbar__subtitle">
              Surveillance imprimante 3D · données temps réel
            </p>
          </div>
          <div className="dashboard-topbar__right">
            <div
              className={`live-pill ${isOnline ? "is-live" : ""}`}
              title={isOnline ? "Flux Firebase actif" : "En attente"}
            >
              <span className="live-pill__dot" aria-hidden />
              {isOnline ? "Live" : "Hors ligne"}
            </div>
            <div className="user-chip">
              <div className="user-chip__avatar">3D</div>
              <div className="user-chip__meta">
                <strong>Atelier</strong>
                <small>Ligne 1</small>
              </div>
            </div>
          </div>
        </header>

        <div className="zone-pills" role="tablist" aria-label="Zone">
          <button
            type="button"
            className={zone === "printer" ? "is-active" : ""}
            onClick={() => setZone("printer")}
          >
            Imprimante 3D
          </button>
          <button
            type="button"
            className={zone === "line2" ? "is-active" : ""}
            onClick={() => setZone("line2")}
          >
            Ligne 2 (bientôt)
          </button>
        </div>

        <section id="section-overview" className="section-block">
          <div className="hero-grid">
            <div className="hero-card">
              <div className="hero-card__date">{nowLabel}</div>
              <div className="hero-card__temp">
                {latest.temperature != null
                  ? `${Number(latest.temperature).toFixed(1)}`
                  : "—"}
                <small> °C</small>
              </div>
              <p style={{ margin: 0, opacity: 0.88, fontSize: "0.95rem" }}>
                Température ambiante / caisson
              </p>
              <div className="hero-card__meta">
                <span>
                  Gaz :{" "}
                  {latest.gas != null ? `${Math.round(latest.gas)} ppm` : "—"}
                </span>
                <span>
                  Humidité :{" "}
                  {latest.humidity != null
                    ? `${Number(latest.humidity).toFixed(0)} %`
                    : "—"}
                </span>
              </div>
            </div>

            <div className="hero-stats">
              <div className="hero-stat-mini">
                <div className="hero-stat-mini__label">Points en mémoire</div>
                <div className="hero-stat-mini__value">{data.length}</div>
              </div>
              <div className="hero-stat-mini">
                <div className="hero-stat-mini__label">Dernière mise à jour</div>
                <div
                  className="hero-stat-mini__value"
                  style={{ fontSize: "0.95rem", fontWeight: 600 }}
                >
                  {lastUpdate}
                </div>
              </div>
              <div className="hero-stat-mini">
                <div className="hero-stat-mini__label">Alertes</div>
                <div className="hero-stat-mini__value">
                  {(tempAlert ? 1 : 0) + (gasAlert ? 1 : 0)}
                </div>
              </div>
            </div>
          </div>

          <CombinedOverviewChart data={dataChronological} />
        </section>

        <section id="section-kpis" className="section-block">
          <h2 className="section-title">État des capteurs</h2>
          <p className="section-sub">
            Dernières valeurs reçues (les champs non envoyés par l’ESP restent
            vides)
          </p>
          <div className="kpi-grid">
            <KpiCard
              label="Température"
              value={format(latest.temperature, "°C")}
              alert={tempAlert}
            />
            <KpiCard label="Humidité" value={format(latest.humidity, "%")} />
            <KpiCard
              label="Gaz"
              value={format(latest.gas, "ppm")}
              alert={gasAlert}
            />
            <KpiCard
              label="Mouvement"
              value={
                latest.motion === undefined
                  ? "—"
                  : latest.motion
                    ? "Détecté"
                    : "Aucun"
              }
              alert={Boolean(latest.motion)}
            />
            <KpiCard label="Accéléro X" value={format(latest.x, "m/s²")} />
            <KpiCard label="Accéléro Y" value={format(latest.y, "m/s²")} />
            <KpiCard label="Accéléro Z" value={format(latest.z, "m/s²")} />
            <KpiCard label="Gyro X" value={format(latest.gyroX, "rad/s")} />
            <KpiCard label="Gyro Y" value={format(latest.gyroY, "rad/s")} />
            <KpiCard label="Gyro Z" value={format(latest.gyroZ, "rad/s")} />
            <KpiCard label="Courant" value={format(latest.courant, "A")} />
            <KpiCard label="Tension" value={format(latest.tension, "V")} />
            <KpiCard label="Piezo" value={format(latest.piezo)} />
          </div>
        </section>

        <section id="section-charts" className="section-block">
          <h2 className="section-title">Historique par métrique</h2>
          <p className="section-sub">
            Un graphique par grandeur · même jeu de données Firebase
          </p>
          <div className="charts-grid">
            {METRICS.map(m => (
              <MetricChart
                key={m.key}
                data={dataChronological}
                dataKey={m.key}
                title={m.title}
                unit={m.unit}
                color={m.color}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function KpiCard({ label, value, alert }) {
  return (
    <div className={`kpi-card ${alert ? "is-alert" : ""}`}>
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value">{value}</div>
    </div>
  );
}

function IconLayout() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconGauge() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-6" />
    </svg>
  );
}
