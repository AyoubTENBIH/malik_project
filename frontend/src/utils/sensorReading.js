/**
 * Normalise les payloads ESP / MQTT / Node vers un schéma unique pour le dashboard.
 * Compatible format imbriqué (collector) et champs plats historiques.
 */

function num(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function str(v) {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s || undefined;
}

export function rawTimestampMs(raw) {
  if (!raw || typeof raw !== "object") return 0;
  const st = raw.serverTime ?? raw.timestamp ?? raw.time ?? raw.date;
  if (st == null) return 0;
  if (typeof st === "number") {
    if (!Number.isFinite(st)) return 0;
    return st < 1e12 ? Math.round(st * 1000) : st;
  }
  if (typeof st === "string") {
    const ms = Date.parse(st);
    return Number.isFinite(ms) ? ms : 0;
  }
  if (typeof st.seconds === "number") {
    const ns = st.nanoseconds != null ? st.nanoseconds / 1e6 : 0;
    return Math.round(st.seconds * 1000 + ns);
  }
  if (st instanceof Date) return st.getTime();
  return 0;
}

export function normalizeSensorReading(raw) {
  if (!raw || typeof raw !== "object") {
    return { _timeMs: 0 };
  }

  const tempMotorTop = num(
    raw.thermal?.motor_top ??
      raw.temp_motor_top ??
      raw.tempMotorTop ??
      raw.temperature
  );
  const tempMotorBottom = num(
    raw.thermal?.motor_bottom ?? raw.temp_motor_bottom ?? raw.tempMotorBottom
  );

  const gas = num(raw.gas?.mq2 ?? raw.gas ?? raw.gaz);
  const courant = num(
    raw.electrical?.current ?? raw.current ?? raw.courant ?? raw.amps
  );
  const tension = num(
    raw.electrical?.voltage ?? raw.voltage ?? raw.tension ?? raw.volts
  );

  const piezoLeft = num(
    raw.vibration?.left_rms ?? raw.vibration_left ?? raw.piezoLeft ?? raw.piezo
  );
  const piezoRight = num(
    raw.vibration?.right_rms ?? raw.vibration_right ?? raw.piezoRight
  );

  const x = num(
    raw.motion?.acceleration?.x ?? raw.accX ?? raw.x ?? raw.ax ?? raw.accelX
  );
  const y = num(
    raw.motion?.acceleration?.y ?? raw.accY ?? raw.y ?? raw.ay ?? raw.accelY
  );
  const z = num(
    raw.motion?.acceleration?.z ?? raw.accZ ?? raw.z ?? raw.az ?? raw.accelZ
  );

  const gyroX = num(raw.motion?.gyroscope?.x ?? raw.gyroX ?? raw.gx);
  const gyroY = num(raw.motion?.gyroscope?.y ?? raw.gyroY ?? raw.gy);
  const gyroZ = num(raw.motion?.gyroscope?.z ?? raw.gyroZ ?? raw.gz);

  const wifiRssi = num(raw.system?.wifi_rssi ?? raw.wifi_rssi ?? raw.wifiRssi);
  const heap = num(raw.system?.heap ?? raw.heap);
  const tempMpu = num(raw.motion?.temp_mpu ?? raw.temp_mpu ?? raw.tempMpu);

  const nozzleTemp = num(raw.nozzle_temp ?? raw.nozzleTemp);
  const nozzleTarget = num(raw.nozzle_target ?? raw.nozzleTarget);
  const bedTemp = num(raw.bed_temp ?? raw.bedTemp);
  const bedTarget = num(raw.bed_target ?? raw.bedTarget);
  const hotendPower = num(raw.hotend_power ?? raw.hotendPower);
  const bedPower = num(raw.bed_power ?? raw.bedPower);
  const posX = num(raw.posX);
  const posY = num(raw.posY);
  const posZ = num(raw.posZ);
  const posE = num(raw.posE);

  const faultLabel = str(raw.fault_label ?? raw.faultLabel) || "NORMAL";
  const faultCode = num(raw.fault_code ?? raw.faultCode) ?? 0;

  const _timeMs = rawTimestampMs(raw) || Date.now();

  return {
    tempMotorTop,
    tempMotorBottom,
    gas,
    courant,
    tension,
    piezoLeft,
    piezoRight,
    x,
    y,
    z,
    gyroX,
    gyroY,
    gyroZ,
    wifiRssi,
    heap,
    tempMpu,
    nozzleTemp,
    nozzleTarget,
    bedTemp,
    bedTarget,
    hotendPower,
    bedPower,
    posX,
    posY,
    posZ,
    posE,
    faultLabel,
    faultCode,
    _timeMs
  };
}

export function sortReadingsNewestFirst(items) {
  return items.slice().sort((a, b) => (b._timeMs || 0) - (a._timeMs || 0));
}

/** Libellés français pour l’affichage UI (module IA à venir). */
export const FAULT_LABELS_FR = {
  NORMAL: "Normal",
  SURCHAUFFE_MOTEUR: "Surchauffe moteur",
  VIBRATION_ANORMALE: "Vibration anormale",
  FUMEE_GAZ: "Fumée / gaz",
  SURCONSOMMATION: "Surconsommation",
  SOUS_TENSION: "Sous-tension",
  HOTEND_INSTABLE: "Hotend instable",
  BED_SURCHAUFFE: "Plateau en surchauffe"
};

export function faultLabelDisplay(code) {
  return FAULT_LABELS_FR[code] || code || "—";
}
