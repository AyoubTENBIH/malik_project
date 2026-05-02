import React from "react";
import { useDashboardData } from "../context/DashboardDataContext";
import MetricChart from "../components/MetricChart";

export default function Graphiques() {
  const { dataChronological, METRICS } = useDashboardData();

  return (
    <div className="page-inner">
      <section className="section-block">
        <div className="section-heading">
          <h2>Historique par métrique</h2>
          <p className="section-subtitle">
            Un graphique par grandeur · même jeu de données Firebase
          </p>
        </div>
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
    </div>
  );
}
