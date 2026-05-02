import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

function ChartComponent({ data }) {
  if (data.length === 0) {
    return <p style={{ opacity: 0.7 }}>📡 En attente de données...</p>;
  }

  const chartData = data
    .slice()
    .reverse()
    .map(item => ({
      time: new Date(item.timestamp?.seconds * 1000).toLocaleTimeString(),
      temperature: item.temperature,
      humidity: item.humidity,
      gas: item.gas
    }));

  return (
    <div>
      <h2>📊 Données en temps réel</h2>

      <LineChart width={900} height={350} data={chartData}>
        <CartesianGrid stroke="#333" />
        <XAxis dataKey="time" stroke="#aaa" />
        <YAxis stroke="#aaa" />
        <Tooltip />
        <Legend />

        <Line type="monotone" dataKey="temperature" stroke="#ff4d4d" strokeWidth={2}/>
        <Line type="monotone" dataKey="humidity" stroke="#4da6ff" strokeWidth={2}/>
        <Line type="monotone" dataKey="gas" stroke="#00ff99" strokeWidth={2}/>
      </LineChart>
    </div>
  );
}

export default ChartComponent;