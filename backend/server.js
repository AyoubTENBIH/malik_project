// ===================== CONFIG (.env en local) =====================
require("dotenv").config();

const mqtt = require("mqtt");
const { MongoClient } = require("mongodb");
const admin = require("firebase-admin");
const express = require("express");
const fs = require("fs");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");

const {
  parseMarlinLine,
  flattenSensorPayload,
  detectFault,
  datasetCsvLine,
  DATASET_HEADER
} = require("./lib/iotProcessing");

const PORT = Number(process.env.PORT) || 3000;
const mqttBroker = process.env.MQTT_BROKER_URL || "mqtt://broker.hivemq.com";
const topicCapteurs =
  process.env.MQTT_TOPIC_CAPTEURS || "malik/imprimante/ligne1/capteurs";
const topicMarlin =
  process.env.MQTT_TOPIC_MARLIN || "malik/imprimante/ligne1/marlin";
const mongoURL = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB_NAME || "iot_db";

const dataDir = process.env.DATA_DIR || path.join(__dirname, "..");
const datasetFile = path.join(dataDir, "dataset_labeled.csv");
const marlinFile = path.join(dataDir, "marlin_logs.csv");

function normalizeRtdbUrl(raw) {
  const s = String(raw || "").trim();
  if (!s) return s;
  try {
    const u = new URL(s);
    return `${u.protocol}//${u.host}`;
  } catch {
    return s.replace(/\/+$/, "");
  }
}

const databaseURL = normalizeRtdbUrl(
  process.env.FIREBASE_DATABASE_URL ||
    "https://iot-projet-97fb4-default-rtdb.europe-west1.firebasedatabase.app"
);

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw && String(raw).trim()) {
    return JSON.parse(raw);
  }
  const fromFile =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(__dirname, "firebaseKey.json");
  if (fs.existsSync(fromFile)) {
    return JSON.parse(fs.readFileSync(fromFile, "utf8"));
  }
  return null;
}

function ensureCsvFiles() {
  if (!fs.existsSync(datasetFile)) {
    fs.writeFileSync(datasetFile, DATASET_HEADER);
  }
  if (!fs.existsSync(marlinFile)) {
    fs.writeFileSync(marlinFile, "timestamp,raw_marlin\n");
  }
}

let mqttConnected = false;
let db;

const mqttClient = mqtt.connect(mqttBroker);

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    mongo: Boolean(db),
    firebase: Boolean(firebaseDB),
    mqttConnected,
    topics: { capteurs: topicCapteurs, marlin: topicMarlin }
  });
});

app.get("/api/export/dataset", (req, res) => {
  ensureCsvFiles();
  if (!fs.existsSync(datasetFile)) {
    return res.status(404).json({ error: "dataset_labeled.csv introuvable" });
  }
  res.download(datasetFile, "dataset_labeled.csv");
});

app.get("/api/export/marlin", (req, res) => {
  ensureCsvFiles();
  if (!fs.existsSync(marlinFile)) {
    return res.status(404).json({ error: "marlin_logs.csv introuvable" });
  }
  res.download(marlinFile, "marlin_logs.csv");
});

server.listen(PORT, () => {
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
  ensureCsvFiles();
});

let firebaseDB = null;
const serviceAccount = loadServiceAccount();
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL
  });
  firebaseDB = admin.database();
  console.log("✅ Firebase Admin connecté");
} else {
  console.log(
    "⚠️ Firebase Admin désactivé — placez firebaseKey.json dans backend/ " +
      "ou définissez FIREBASE_SERVICE_ACCOUNT_JSON (MQTT + CSV actifs)."
  );
}

function toRealtimePayload(data) {
  const { _id, ...rest } = data;
  const copy = { ...rest };
  if (copy.serverTime instanceof Date) {
    copy.serverTime = copy.serverTime.toISOString();
  }
  return copy;
}

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

mqttClient.on("connect", () => {
  mqttConnected = true;
  console.log(`✅ MQTT connecté → ${mqttBroker}`);
  mqttClient.subscribe([topicCapteurs, topicMarlin]);
  console.log(`   capteurs: ${topicCapteurs}`);
  console.log(`   marlin:   ${topicMarlin}`);
});

mqttClient.on("close", () => {
  mqttConnected = false;
});

mqttClient.on("error", err => {
  console.error("❌ MQTT:", err.message || err);
});

mqttClient.on("message", async (topicReceived, message) => {
  try {
    const payload = message.toString();

    if (topicReceived === topicMarlin) {
      const timestamp = new Date().toISOString();
      fs.appendFileSync(
        marlinFile,
        `"${timestamp}","${payload.replace(/"/g, '""')}"\n`
      );
      parseMarlinLine(payload);

      const marlinEntry = {
        raw_marlin: payload,
        serverTime: new Date(),
        timestamp
      };
      if (firebaseDB) {
        await firebaseDB.ref("marlin").push(toRealtimePayload(marlinEntry));
      }
      io.emit("marlin", marlinEntry);
      console.log("📟 Marlin:", payload.slice(0, 80));
      return;
    }

    if (topicReceived !== topicCapteurs) return;

    const parsed = JSON.parse(payload);
    const flat = flattenSensorPayload(parsed);
    const fault = detectFault(flat);

    const data = {
      ...flat,
      ...fault,
      serverTime: new Date()
    };

    fs.appendFileSync(datasetFile, datasetCsvLine(data) + "\n");

    const rtdbPayload = toRealtimePayload(data);
    if (firebaseDB) {
      await firebaseDB.ref("capteurs").push(rtdbPayload);
    }

    if (db) {
      await db.collection("capteurs").insertOne(data);
    }

    io.emit("data", data);
    console.log("📩 Capteurs:", fault.fault_label);
  } catch (err) {
    console.error("❌ Erreur:", err.message || err);
    if (err.code) console.error("   code:", err.code);
  }
});

initMongo();
