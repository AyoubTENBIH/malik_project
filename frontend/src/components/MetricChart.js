import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { formatChartTime } from "../utils/chartTime";

function MetricChart({
  data,
  dataKey,
  title,
  unit = "",
  color = "#6366f1",
  name
}) {
  const displayName = name || title;

  /** `data` est déjà trié chronologiquement par le parent (un seul tri global). */
  const chartData = useMemo(
    () =>
      (data || []).map(item => ({
        time: formatChartTime(item),
        value: item[dataKey]
      })),
    [data, dataKey]
  );

  const hasSeries = chartData.some(
    d => d.value != null && Number.isFinite(Number(d.value))
  );

  return (
    <div className="metric-chart-card">
      <div className="metric-chart-card__head">
        <h3 className="metric-chart-card__title">{title}</h3>
        {unit ? <span className="metric-chart-card__unit">{unit}</span> : null}
      </div>
      {!hasSeries || data.length === 0 ? (
        <div className="metric-chart-card__empty">
          <span className="metric-chart-card__empty-icon">📡</span>
          <p>Pas encore de données pour cette métrique</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
          >
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              minTickGap={16}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              width={44}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: 12
              }}
              formatter={v =>
                v != null && Number.isFinite(Number(v))
                  ? [`${Number(v).toFixed(2)} ${unit}`.trim(), displayName]
                  : ["—", displayName]
              }
              labelFormatter={label => label}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={displayName}
              stroke={color}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default React.memo(MetricChart);
