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
  const chartData = useMemo(
    () =>
      data.map(item => ({
        time: formatChartTime(item),
        tempMotorTop: item.tempMotorTop,
        tempMotorBottom: item.tempMotorBottom,
        gas: item.gas,
        nozzleTemp: item.nozzleTemp
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
          Températures moteurs, gaz et buse sur la même échelle temporelle
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
            dataKey="tempMotorTop"
            name="Moteur haut °C"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="tempMotorBottom"
            name="Moteur bas °C"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="gas"
            name="Gaz"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="nozzleTemp"
            name="Buse °C"
            stroke="#dc2626"
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
