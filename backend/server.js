// ===================== CONFIG (.env en local) =====================
require("dotenv").config();

// ===================== IMPORTS =====================
const mqtt = require("mqtt");
const { MongoClient } = require("mongodb");
const admin = require("firebase-admin");
const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const PORT = Number(process.env.PORT) || 3000;
const mqttBroker = process.env.MQTT_BROKER_URL || "mqtt://broker.hivemq.com";
const topic = process.env.MQTT_TOPIC || "imprimante/ligne1/capteurs";
const mongoURL = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB_NAME || "iot_db";
const databaseURL =
  process.env.FIREBASE_DATABASE_URL ||
  "https://iot-projet-97fb4-default-rtdb.europe-west1.firebasedatabase.app/";

function loadServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json && String(json).trim()) {
    return JSON.parse(json);
  }
  return require(path.join(__dirname, "firebaseKey.json"));
}

let mqttConnected = false;
let db;

// ===================== MQTT (connexion tôt) =====================
const mqttClient = mqtt.connect(mqttBroker);

// ===================== WEB SERVER =====================
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    mongo: Boolean(db),
    mqttConnected
  });
});

server.listen(PORT, () => {
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
});

// ===================== FIREBASE =====================
admin.initializeApp({
  credential: admin.credential.cert(loadServiceAccount()),
  databaseURL
});

const firebaseDB = admin.database();

/** Payload sérialisable RTDB (pas d’ObjectId Mongo, dates en ISO). */
function toRealtimePayload(data) {
  const { _id, ...rest } = data;
  const copy = { ...rest };
  if (copy.serverTime instanceof Date) {
    copy.serverTime = copy.serverTime.toISOString();
  }
  return copy;
}

// ===================== INIT MONGO (optionnel) =====================
async function initMongo() {
  if (!mongoURL) {
    console.log(
      "⚠️ MONGODB_URI absent — Mongo désactivé (Firebase + MQTT actifs)."
    );
    return;
  }
  try {
    const client = new MongoClient(mongoURL);
    await client.connect();
    db = client.db(dbName);
    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.error("❌ MongoDB:", err.message || err);
  }
}

// ===================== MQTT CONNECT =====================
mqttClient.on("connect", () => {
  mqttConnected = true;
  console.log(`✅ MQTT connecté → ${mqttBroker} · topic « ${topic} »`);
  mqttClient.subscribe(topic);
});

mqttClient.on("close", () => {
  mqttConnected = false;
});

mqttClient.on("error", err => {
  console.error("❌ MQTT:", err.message || err);
});

// ===================== MQTT MESSAGE =====================
mqttClient.on("message", async (topicReceived, message) => {
  try {
    const data = JSON.parse(message.toString());

    data.serverTime = new Date();

    const rtdbPayload = toRealtimePayload(data);
    await firebaseDB.ref("capteurs").push(rtdbPayload);

    if (db) {
      await db.collection("capteurs").insertOne(data);
    }

    io.emit("data", data);

    console.log("📩 Data:", data);
  } catch (err) {
    console.error("❌ Erreur:", err.message || err);
    if (err.code) console.error("   code:", err.code);
  }
});

// ===================== START =====================
initMongo();
