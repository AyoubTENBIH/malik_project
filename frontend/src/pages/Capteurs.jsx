import React from "react";
import { Download } from "lucide-react";
import { useDashboardData } from "../context/DashboardDataContext";

function SensorCard({ label, alert, children }) {
  return (
    <div className={`sensor-card${alert ? " sensor-card--alert" : ""}`}>
      <div className="sensor-card__label">{label}</div>
      <div className="sensor-card__value-row">{children}</div>
    </div>
  );
}

function NumValue({ value, unit, alert, decimals = 1 }) {
  if (value == null) return <span className="sensor-card__empty">—</span>;
  return (
    <>
      <span
        className={`sensor-card__num${alert ? " sensor-card__num--alert" : ""}`}
      >
        {decimals === 0
          ? Math.round(value)
          : Number(value).toFixed(decimals)}
      </span>
      {unit ? <span className="sensor-card__unit">{unit}</span> : null}
    </>
  );
}

export default function Capteurs() {
  const {
    latest,
    tempAlert,
    gasAlert,
    faultAlert,
    faultLabelFr,
    downloadCsv
  } = useDashboardData();

  return (
    <div className="page-inner">
      <header className="page-header page-header--compact">
        <div>
          <h1>Capteurs</h1>
          <p className="section-subtitle-only">Dernières valeurs reçues</p>
        </div>
        <button
          type="button"
          className="btn-export"
          onClick={() => downloadCsv("dataset")}
        >
          <Download size={16} strokeWidth={2} aria-hidden />
          Télécharger CSV
        </button>
      </header>

      <section className="section-block">
        <div className="section-heading">
          <h2>Capteurs embarqués</h2>
        </div>
        <div className="sensor-grid">
          <SensorCard label="Moteur (haut)" alert={tempAlert}>
            <NumValue value={latest.tempMotorTop} unit="°C" alert={tempAlert} />
          </SensorCard>

          <SensorCard label="Moteur (bas)" alert={tempAlert}>
            <NumValue
              value={latest.tempMotorBottom}
              unit="°C"
              alert={tempAlert}
            />
          </SensorCard>

          <SensorCard label="Gaz MQ2" alert={gasAlert}>
            <NumValue
              value={latest.gas}
              unit=""
              alert={gasAlert}
              decimals={0}
            />
          </SensorCard>

          <SensorCard label="Courant">
            <NumValue value={latest.courant} unit="A" decimals={2} />
          </SensorCard>

          <SensorCard label="Tension">
            <NumValue value={latest.tension} unit="V" decimals={2} />
          </SensorCard>

          <SensorCard label="Vibration gauche">
            <NumValue value={latest.piezoLeft} decimals={0} />
          </SensorCard>

          <SensorCard label="Vibration droite">
            <NumValue value={latest.piezoRight} decimals={0} />
          </SensorCard>

          <SensorCard label="Accéléro X">
            <NumValue value={latest.x} unit="m/s²" decimals={2} />
          </SensorCard>

          <SensorCard label="Accéléro Y">
            <NumValue value={latest.y} unit="m/s²" decimals={2} />
          </SensorCard>

          <SensorCard label="Accéléro Z">
            <NumValue value={latest.z} unit="m/s²" decimals={2} />
          </SensorCard>

          <SensorCard label="Gyro X">
            <NumValue value={latest.gyroX} unit="rad/s" decimals={2} />
          </SensorCard>

          <SensorCard label="Gyro Y">
            <NumValue value={latest.gyroY} unit="rad/s" decimals={2} />
          </SensorCard>

          <SensorCard label="Gyro Z">
            <NumValue value={latest.gyroZ} unit="rad/s" decimals={2} />
          </SensorCard>

          <SensorCard label="Wi-Fi RSSI">
            <NumValue value={latest.wifiRssi} unit="dBm" decimals={0} />
          </SensorCard>

          <SensorCard label="Heap ESP">
            <NumValue value={latest.heap} decimals={0} />
          </SensorCard>

          <SensorCard label="Temp. MPU6050">
            <NumValue value={latest.tempMpu} unit="°C" />
          </SensorCard>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Imprimante (Marlin)</h2>
        </div>
        <div className="sensor-grid">
          <SensorCard label="Buse">
            <NumValue value={latest.nozzleTemp} unit="°C" />
          </SensorCard>
          <SensorCard label="Cible buse">
            <NumValue value={latest.nozzleTarget} unit="°C" />
          </SensorCard>
          <SensorCard label="Plateau">
            <NumValue value={latest.bedTemp} unit="°C" />
          </SensorCard>
          <SensorCard label="Cible plateau">
            <NumValue value={latest.bedTarget} unit="°C" />
          </SensorCard>
          <SensorCard label="Puissance hotend">
            <NumValue value={latest.hotendPower} decimals={0} />
          </SensorCard>
          <SensorCard label="Puissance plateau">
            <NumValue value={latest.bedPower} decimals={0} />
          </SensorCard>
          <SensorCard label="Position X">
            <NumValue value={latest.posX} unit="mm" decimals={2} />
          </SensorCard>
          <SensorCard label="Position Y">
            <NumValue value={latest.posY} unit="mm" decimals={2} />
          </SensorCard>
          <SensorCard label="Position Z">
            <NumValue value={latest.posZ} unit="mm" decimals={2} />
          </SensorCard>
          <SensorCard label="Extrusion E">
            <NumValue value={latest.posE} unit="mm" decimals={2} />
          </SensorCard>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Diagnostics (règles / IA)</h2>
        </div>
        <div
          className={`info-panel info-panel--ai${faultAlert ? " info-panel--ai-alert" : ""}`}
        >
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
              <dt>Code</dt>
              <dd className="ai-labels__value">
                {latest.faultCode != null ? latest.faultCode : "—"}
              </dd>
            </div>
            <div className="ai-labels__row">
              <dt>Label</dt>
              <dd className="ai-labels__value ai-labels__value--mono">
                {latest.faultLabel || "NORMAL"}
              </dd>
            </div>
            <div className="ai-labels__row ai-labels__row--placeholder">
              <dt>Score IA</dt>
              <dd className="ai-labels__value ai-labels__placeholder">—</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
