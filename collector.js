const mqtt = require("mqtt");
const fs = require("fs");
const path = require("path");

const broker = process.env.MQTT_BROKER_URL || "mqtt://broker.hivemq.com";
const topicSensors =
  process.env.MQTT_TOPIC_CAPTEURS || "malik/imprimante/ligne1/capteurs";
const topicMarlin =
  process.env.MQTT_TOPIC_MARLIN || "malik/imprimante/ligne1/marlin";

const dataDir = process.env.COLLECTOR_DATA_DIR || __dirname;
const datasetFile = path.join(dataDir, "dataset_labeled.csv");
const marlinFile = path.join(dataDir, "marlin_logs.csv");

const {
  parseMarlinLine,
  flattenSensorPayload,
  detectFault,
  datasetCsvLine,
  DATASET_HEADER
} = require("./backend/lib/iotProcessing");

const client = mqtt.connect(broker);

if (!fs.existsSync(datasetFile)) {
  fs.writeFileSync(datasetFile, DATASET_HEADER);
}

if (!fs.existsSync(marlinFile)) {
  fs.writeFileSync(marlinFile, "timestamp,raw_marlin\n");
}

client.on("connect", () => {
  console.log("MQTT connecté");
  client.subscribe(topicSensors);
  client.subscribe(topicMarlin);
  console.log("Topics:", topicSensors, topicMarlin);
});

client.on("message", (topic, message) => {
  const payload = message.toString();

  if (topic === topicMarlin) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(
      marlinFile,
      `"${timestamp}","${payload.replace(/"/g, '""')}"\n`
    );
    parseMarlinLine(payload);
    console.log("MARLIN:", payload);
    return;
  }

  if (topic === topicSensors) {
    try {
      const data = JSON.parse(payload);
      const row = flattenSensorPayload(data);
      const fault = detectFault(row);
      Object.assign(row, fault);

      fs.appendFileSync(datasetFile, datasetCsvLine(row) + "\n");
      console.log("CSV:", fault.fault_label);
    } catch (err) {
      console.error("Erreur JSON capteurs:", err.message);
    }
  }
});
