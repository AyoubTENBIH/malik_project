import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";
import { formatChartTime } from "../utils/chartTime";

export default function CombinedOverviewChart({ data }) {
  /** `data` est déjà chronologique (trié dans Dashboard). */
  const chartData = useMemo(
    () =>
      data.map(item => ({
        time: formatChartTime(item),
        temperature: item.temperature,
        humidity: item.humidity,
        gas: item.gas
      })),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="combined-chart combined-chart--empty">
        <p>En attente de données Firebase…</p>
      </div>
    );
  }

  return (
    <div className="combined-chart">
      <div className="combined-chart__head">
        <h2 className="section-title">Vue synthèse</h2>
        <p className="section-sub">Température, humidité et gaz sur une même échelle temporelle</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <CartesianGrid stroke="var(--chart-grid)" />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            minTickGap={24}
          />
          <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "12px"
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature"
            name="Temp. °C"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            name="Humidité %"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="gas"
            name="Gaz ppm"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
