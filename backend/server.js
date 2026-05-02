// ===================== IMPORTS =====================
const mqtt = require("mqtt");
const { MongoClient } = require("mongodb");
const admin = require("firebase-admin");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

// ===================== WEB SERVER =====================
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

server.listen(3000, () => {
  console.log("🌐 Dashboard: http://localhost:3000");
});

// ===================== MQTT =====================
const mqttClient = mqtt.connect("mqtt://broker.hivemq.com");
const topic = "imprimante/ligne1/capteurs";

// ===================== MONGODB =====================
const mongoURL = "mongodb://127.0.0.1:27017";
const dbName = "iot_db";
let db;

// ===================== FIREBASE =====================
const serviceAccount = require("./firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://iot-projet-97fb4-default-rtdb.europe-west1.firebasedatabase.app/"
});

const firebaseDB = admin.database();

// ===================== INIT MONGO =====================
async function initMongo() {
  const client = new MongoClient(mongoURL);
  await client.connect();
  db = client.db(dbName);
  console.log("✅ MongoDB connecté");
}

// ===================== MQTT CONNECT =====================
mqttClient.on("connect", () => {
  console.log("✅ MQTT connecté");
  mqttClient.subscribe(topic);
});

// ===================== MQTT MESSAGE =====================
mqttClient.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    data.serverTime = new Date();

    // MongoDB
    await db.collection("capteurs").insertOne(data);

    // Firebase
    firebaseDB.ref("capteurs").push(data);

    // Dashboard live
    io.emit("data", data);

    console.log("📩 Data:", data);

  } catch (err) {
    console.error("❌ Erreur:", err);
  }
});

// ===================== START =====================
initMongo();