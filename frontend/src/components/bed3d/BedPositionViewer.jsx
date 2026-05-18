import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useDashboardData } from "../../context/DashboardDataContext";
import { BED_SIZE, hasValidPosition } from "../../utils/printerBed";
import Bed3DErrorBoundary from "./Bed3DErrorBoundary";
import PrinterBedScene from "./PrinterBedScene";
import "../../styles/bed3d.css";

function CoordBadge({ label, value, unit = "mm" }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { scale: 1.12, opacity: 0.7 },
      { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }
    );
  }, [value]);

  return (
    <div className="bed3d-coord">
      <span className="bed3d-coord__label">{label}</span>
      <span ref={ref} className="bed3d-coord__value">
        {value != null ? Number(value).toFixed(2) : "—"}
        <small>{unit}</small>
      </span>
    </div>
  );
}

export default function BedPositionViewer() {
  const headRef = useRef();
  const [mount3d, setMount3d] = useState(false);
  const { latest, dataChronological, isOnline } = useDashboardData();

  const hasPos = hasValidPosition(latest);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMount3d(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!headRef.current) return;
    gsap.fromTo(
      headRef.current,
      { y: 16 },
      { y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, []);

  return (
    <section className="bed3d-panel section-block">
      <div ref={headRef} className="bed3d-panel__head section-heading">
        <div>
          <h2>Plateau & position temps réel</h2>
          <p className="section-subtitle">
            Visualisation 3D · tête X/Y/Z (Marlin M114) · volume{" "}
            {BED_SIZE.x}×{BED_SIZE.y}×{BED_SIZE.z} mm
          </p>
        </div>
        <span
          className={`bed3d-live${isOnline && hasPos ? " bed3d-live--on" : ""}`}
        >
          <span className="bed3d-live__dot" aria-hidden />
          {isOnline && hasPos ? "Live" : "En attente"}
        </span>
      </div>

      <div className="bed3d-layout">
        <div className="bed3d-canvas-wrap">
          <Bed3DErrorBoundary>
            {mount3d ? (
              <PrinterBedScene
                posX={latest.posX ?? 0}
                posY={latest.posY ?? 0}
                posZ={latest.posZ ?? 0}
                bedTemp={latest.bedTemp}
                bedTarget={latest.bedTarget}
                nozzleTemp={latest.nozzleTemp}
                trailReadings={dataChronological}
              />
            ) : (
              <div className="bed3d-canvas-fallback">Chargement 3D…</div>
            )}
          </Bed3DErrorBoundary>
        </div>

        <aside className="bed3d-sidebar">
          <div className="bed3d-coords">
            <CoordBadge label="X" value={latest.posX} />
            <CoordBadge label="Y" value={latest.posY} />
            <CoordBadge label="Z" value={latest.posZ} />
            <CoordBadge label="E" value={latest.posE} />
          </div>
          <div className="bed3d-temps">
            <div className="bed3d-temp-row">
              <span>Plateau</span>
              <strong>
                {latest.bedTemp != null ? `${latest.bedTemp.toFixed(1)}` : "—"}
                <small>
                  {" "}
                  / {latest.bedTarget != null ? latest.bedTarget : "—"} °C
                </small>
              </strong>
            </div>
            <div className="bed3d-temp-row">
              <span>Buse</span>
              <strong>
                {latest.nozzleTemp != null
                  ? `${latest.nozzleTemp.toFixed(1)}`
                  : "—"}
                <small>
                  {" "}
                  /{" "}
                  {latest.nozzleTarget != null ? latest.nozzleTarget : "—"} °C
                </small>
              </strong>
            </div>
          </div>
          <p className="bed3d-hint">
            Faites glisser pour pivoter · molette pour zoomer. La trajectoire
            violette suit les dernières positions reçues.
          </p>
        </aside>
      </div>
    </section>
  );
}
