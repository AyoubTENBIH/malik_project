import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ChartComponent from "./ChartComponent";

function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "esp_data"), orderBy("timestamp", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(items);
    });

    return () => unsub();
  }, []);

  const latest = data[0] || {};

  const format = (value, unit = "") => {
    if (value === undefined) return "En attente...";
    return `${value} ${unit}`;
  };

  const isOnline = data.length > 0;

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1>⚡ Smart IoT Control Panel</h1>
        <div>
          <span className="dot"></span> LIVE
        </div>
      </div>

      {/* STATUS */}
      <div style={styles.status}>
        {isOnline ? "🟢 ESP32 connecté" : "🔴 ESP32 offline"}
      </div>

      {/* CARDS */}
      <div style={styles.grid}>
        <Card title="Température" value={format(latest.temperature, "°C")} alert={latest.temperature > 30}/>
        <Card title="Humidité" value={format(latest.humidity, "%")} />
        <Card title="Gaz" value={format(latest.gas, "ppm")} alert={latest.gas > 400}/>
        <Card title="Mouvement" value={latest.motion ? "Détecté" : "Aucun"} alert={latest.motion}/>
        <Card title="Axe X" value={format(latest.x)} />
        <Card title="Axe Y" value={format(latest.y)} />
        <Card title="Axe Z" value={format(latest.z)} />
      </div>

      {/* GRAPH */}
      <ChartComponent data={data} />
    </div>
  );
}

/* CARD COMPONENT */
function Card({ title, value, alert }) {
  return (
    <div className={`glass ${alert ? "alert" : ""}`} style={styles.card}>
      <h3>{title}</h3>
      <p style={{
        ...styles.value,
        color: alert ? "#ff4d4d" : "#00ffcc"
      }}>
        {value}
      </p>
    </div>
  );
}

const styles = {
  container: {
    padding: 30
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10
  },
  status: {
    marginBottom: 20,
    fontWeight: "bold"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
    marginBottom: 40
  },
  card: {
    padding: 20,
    textAlign: "center"
  },
  value: {
    fontSize: 26,
    fontWeight: "bold",
    textShadow: "0 0 10px rgba(0,255,200,0.7)"
  }
};

export default Dashboard;