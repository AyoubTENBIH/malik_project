/**
 * Parsing Marlin, aplatissement JSON capteurs, détection de défauts (aligné sur collector.js).
 */

let marlinState = {
  nozzle_temp: 0,
  nozzle_target: 0,
  bed_temp: 0,
  bed_target: 0,
  hotend_power: 0,
  bed_power: 0,
  posX: 0,
  posY: 0,
  posZ: 0,
  posE: 0
};

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseMarlinLine(line) {
  const tempRegex =
    /T:([\d.]+)\s*\/([\d.]+)\s*B:([\d.]+)\s*\/([\d.]+)\s*@:([\d.]+)\s*B@:([\d.]+)/;
  const tempMatch = line.match(tempRegex);
  if (tempMatch) {
    marlinState.nozzle_temp = parseFloat(tempMatch[1]);
    marlinState.nozzle_target = parseFloat(tempMatch[2]);
    marlinState.bed_temp = parseFloat(tempMatch[3]);
    marlinState.bed_target = parseFloat(tempMatch[4]);
    marlinState.hotend_power = parseFloat(tempMatch[5]);
    marlinState.bed_power = parseFloat(tempMatch[6]);
  }

  const posRegex =
    /X:([-\d.]+)\s*Y:([-\d.]+)\s*Z:([-\d.]+)\s*E:([-\d.]+)/;
  const posMatch = line.match(posRegex);
  if (posMatch) {
    marlinState.posX = parseFloat(posMatch[1]);
    marlinState.posY = parseFloat(posMatch[2]);
    marlinState.posZ = parseFloat(posMatch[3]);
    marlinState.posE = parseFloat(posMatch[4]);
  }
}

function getMarlinState() {
  return { ...marlinState };
}

function flattenSensorPayload(data) {
  return {
    timestamp: data.timestamp || new Date().toISOString(),

    voltage: num(data.electrical?.voltage ?? data.voltage ?? data.tension),
    current: num(data.electrical?.current ?? data.current ?? data.courant),

    temp_motor_bottom: num(
      data.thermal?.motor_bottom ?? data.temp_motor_bottom
    ),
    temp_motor_top: num(data.thermal?.motor_top ?? data.temp_motor_top),

    gas: num(data.gas?.mq2 ?? data.gas ?? data.gaz),

    vibration_left: num(
      data.vibration?.left_rms ?? data.vibration_left ?? data.piezo
    ),
    vibration_right: num(
      data.vibration?.right_rms ?? data.vibration_right ?? data.piezoRight
    ),

    accX: num(data.motion?.acceleration?.x ?? data.accX ?? data.x),
    accY: num(data.motion?.acceleration?.y ?? data.accY ?? data.y),
    accZ: num(data.motion?.acceleration?.z ?? data.accZ ?? data.z),

    gyroX: num(data.motion?.gyroscope?.x ?? data.gyroX),
    gyroY: num(data.motion?.gyroscope?.y ?? data.gyroY),
    gyroZ: num(data.motion?.gyroscope?.z ?? data.gyroZ),

    wifi_rssi: num(data.system?.wifi_rssi ?? data.wifi_rssi),
    heap: num(data.system?.heap ?? data.heap),

    nozzle_temp: num(marlinState.nozzle_temp ?? data.nozzle_temp),
    nozzle_target: num(marlinState.nozzle_target ?? data.nozzle_target),
    bed_temp: num(marlinState.bed_temp ?? data.bed_temp),
    bed_target: num(marlinState.bed_target ?? data.bed_target),
    hotend_power: num(marlinState.hotend_power ?? data.hotend_power),
    bed_power: num(marlinState.bed_power ?? data.bed_power),
    posX: num(marlinState.posX ?? data.posX),
    posY: num(marlinState.posY ?? data.posY),
    posZ: num(marlinState.posZ ?? data.posZ),
    posE: num(marlinState.posE ?? data.posE)
  };
}

function detectFault(row) {
  let label = "NORMAL";
  let code = 0;

  if (row.temp_motor_top > 70 || row.temp_motor_bottom > 70) {
    label = "SURCHAUFFE_MOTEUR";
    code = 1;
  } else if (row.vibration_left > 15000 || row.vibration_right > 15000) {
    label = "VIBRATION_ANORMALE";
    code = 2;
  } else if (row.gas > 2500) {
    label = "FUMEE_GAZ";
    code = 3;
  } else if (row.current > 8) {
    label = "SURCONSOMMATION";
    code = 4;
  } else if (row.voltage < 10) {
    label = "SOUS_TENSION";
    code = 5;
  } else if (row.nozzle_temp > row.nozzle_target + 15 && row.nozzle_target > 0) {
    label = "HOTEND_INSTABLE";
    code = 6;
  } else if (row.bed_temp > row.bed_target + 15 && row.bed_target > 0) {
    label = "BED_SURCHAUFFE";
    code = 7;
  }

  return { fault_label: label, fault_code: code };
}

function datasetCsvLine(row) {
  return [
    row.timestamp,
    row.voltage,
    row.current,
    row.temp_motor_bottom,
    row.temp_motor_top,
    row.gas,
    row.vibration_left,
    row.vibration_right,
    row.accX,
    row.accY,
    row.accZ,
    row.gyroX,
    row.gyroY,
    row.gyroZ,
    row.wifi_rssi,
    row.heap,
    row.nozzle_temp,
    row.nozzle_target,
    row.bed_temp,
    row.bed_target,
    row.hotend_power,
    row.bed_power,
    row.posX,
    row.posY,
    row.posZ,
    row.posE,
    row.fault_label,
    row.fault_code
  ].join(",");
}

const DATASET_HEADER =
  "timestamp,voltage,current,temp_motor_bottom,temp_motor_top,gas," +
  "vibration_left,vibration_right,accX,accY,accZ,gyroX,gyroY,gyroZ," +
  "wifi_rssi,heap,nozzle_temp,nozzle_target,bed_temp,bed_target," +
  "hotend_power,bed_power,posX,posY,posZ,posE,fault_label,fault_code\n";

module.exports = {
  parseMarlinLine,
  getMarlinState,
  flattenSensorPayload,
  detectFault,
  datasetCsvLine,
  DATASET_HEADER
};
