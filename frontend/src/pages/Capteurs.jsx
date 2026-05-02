import React from "react";
import { useDashboardData } from "../context/DashboardDataContext";

function SensorCard({ label, alert, children }) {
  return (
    <div className={`sensor-card${alert ? " sensor-card--alert" : ""}`}>
      <div className="sensor-card__label">{label}</div>
      <div className="sensor-card__value-row">{children}</div>
    </div>
  );
}

export default function Capteurs() {
  const { latest, format, tempAlert, gasAlert } = useDashboardData();

  return (
    <div className="page-inner">
      <section className="section-block">
        <div className="section-heading">
          <h2>État des capteurs</h2>
          <p className="section-subtitle">Dernières valeurs reçues</p>
        </div>

        <div className="sensor-grid">
          <SensorCard label="Température" alert={tempAlert}>
            {latest.temperature != null ? (
              <>
                <span
                  className={`sensor-card__num${tempAlert ? " sensor-card__num--alert" : ""}`}
                >
                  {Number(latest.temperature).toFixed(1)}
                </span>
                <span className="sensor-card__unit">°C</span>
              </>
            ) : (
              <span className="sensor-card__empty">—</span>
            )}
          </SensorCard>

          <SensorCard label="Humidité">
            {latest.humidity != null ? (
              <>
                <span className="sensor-card__num">
                  {Number(latest.humidity).toFixed(0)}
                </span>
                <span className="sensor-card__unit">%</span>
              </>
            ) : (
              <span className="sensor-card__empty">—</span>
            )}
          </SensorCard>

          <SensorCard label="Gaz" alert={gasAlert}>
            {latest.gas != null ? (
              <>
                <span
                  className={`sensor-card__num${gasAlert ? " sensor-card__num--alert" : ""}`}
                >
                  {Math.round(latest.gas)}
                </span>
                <span className="sensor-card__unit">ppm</span>
              </>
            ) : (
              <span className="sensor-card__empty">—</span>
            )}
          </SensorCard>

          <SensorCard label="Mouvement" alert={Boolean(latest.motion)}>
            {latest.motion === undefined ? (
              <span className="sensor-card__empty">—</span>
            ) : (
              <span
                className={`sensor-card__num${latest.motion ? " sensor-card__num--alert" : ""}`}
              >
                {latest.motion ? "Détecté" : "Aucun"}
              </span>
            )}
          </SensorCard>

          <SensorCard label="Accéléro X">
            {latest.x != null ? (
              <>
                <span className="sensor-card__num">
                  {Number(latest.x).toFixed(2)}
                </span>
                <span className="sensor-card__unit">m/s²</span>
              </>
            ) : (
              <span className="sensor-card__empty">—</span>
            )}
          </SensorCard>

          <SensorCard label="Accéléro Y">
            {latest.y != null ? (
              <>
                <span className="sensor-card__num">
                  {Number(latest.y).toFixed(2)}
                </span>
                <span className="sensor-card__unit">m/s²</span>
              </>
            ) : (
              <span className="sensor-card__empty">—</span>
            )}
          </SensorCard>

          <SensorCard label="Accéléro Z">
            {latest.z != null ? (
              <>
                <span className="sensor-card__num">
                  {Number(latest.z).toFixed(2)}
                </span>
                <span className="sensor-card__unit">m/s²</span>
              </>
            ) : (
              <span className="sensor-card__empty">—</span>
            )}
          </SensorCard>

          <SensorCard label="Gyro X">
            {latest.gyroX != null ? (
              <>
                <span className="sensor-card__num">
                  {Number(latest.gyroX).toFixed(2)}
                </span>
                <span className="sensor-card__unit">rad/s</span>
              </>
            ) : (
              <span className="sensor-card__empty">—</span>
            )}
          </SensorCard>

          <SensorCard label="Gyro Y">
            {latest.gyroY != null ? (
              <>
                <span className="sensor-card__num">
                  {Number(latest.gyroY).toFixed(2)}
                </span>
                <span className="sensor-card__unit">rad/s</span>
              </>
            ) : (
              <span className="sensor-card__empty">—</span>
            )}
          </SensorCard>

          <SensorCard label="Gyro Z">
            {latest.gyroZ != null ? (
              <>
                <span className="sensor-card__num">
                  {Number(latest.gyroZ).toFixed(2)}
                </span>
                <span className="sensor-card__unit">rad/s</span>
              </>
            ) : (
              <span className="sensor-card__empty">—</span>
            )}
          </SensorCard>

          <SensorCard label="Courant">
            {latest.courant != null ? (
              <>
                <span className="sensor-card__num">
                  {Number(latest.courant).toFixed(2)}
                </span>
                <span className="sensor-card__unit">A</span>
              </>
            ) : (
              <span className="sensor-card__empty">—</span>
            )}
          </SensorCard>

          <SensorCard label="Tension">
            {latest.tension != null ? (
              <>
                <span className="sensor-card__num">
                  {Number(latest.tension).toFixed(2)}
                </span>
                <span className="sensor-card__unit">V</span>
              </>
            ) : (
              <span className="sensor-card__empty">—</span>
            )}
          </SensorCard>

          <SensorCard label="Piezo">
            {latest.piezo === undefined || latest.piezo === null ? (
              <span className="sensor-card__empty">—</span>
            ) : (
              <span className="sensor-card__num">{format(latest.piezo)}</span>
            )}
          </SensorCard>
        </div>
      </section>
    </div>
  );
}
