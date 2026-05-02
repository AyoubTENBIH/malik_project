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

function OverviewLegend(props) {
  const payload = props.payload;
  if (!payload || !payload.length) return null;
  return (
    <ul className="overview-legend-pills">
      {payload.map(entry => (
        <li key={entry.dataKey ?? entry.value} className="overview-legend-pill">
          <span
            className="overview-legend-dot"
            style={{ background: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export default function CombinedOverviewChart({ data }) {
  /** `data` est déjà chronologique (trié côté provider). */
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
      <div className="combined-chart__head section-heading">
        <h2>Vue synthèse</h2>
        <p className="section-subtitle">
          Température, humidité et gaz sur une même échelle temporelle
        </p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--bg-border)"
          />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
            axisLine={{ stroke: "var(--bg-border)" }}
            tickLine={{ stroke: "var(--bg-border)" }}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
            axisLine={{ stroke: "var(--bg-border)" }}
            tickLine={{ stroke: "var(--bg-border)" }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--tooltip-bg)",
              border: "1px solid var(--tooltip-border)",
              borderRadius: "8px",
              color: "var(--text-primary)"
            }}
            labelStyle={{ color: "var(--text-primary)" }}
            itemStyle={{ color: "var(--text-primary)" }}
          />
          <Legend
            verticalAlign="bottom"
            content={legendProps => <OverviewLegend {...legendProps} />}
          />
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
