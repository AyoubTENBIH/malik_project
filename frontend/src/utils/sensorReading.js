/**
 * Normalise les payloads ESP / MQTT / Node vers un schéma unique pour le dashboard.
 * Accepte les alias courants : temp/temperature, gaz/gas, accelX|ax|x, gyroX, etc.
 */

function num(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
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

  const temperature = num(raw.temperature ?? raw.temp);
  const humidity = num(raw.humidity ?? raw.hum);
  const gas = num(raw.gas ?? raw.gaz);
  const courant = num(raw.courant ?? raw.current ?? raw.amps);
  const tension = num(raw.tension ?? raw.voltage ?? raw.volts);
  const piezo = num(raw.piezo ?? raw.vibration);
  const x = num(raw.x ?? raw.ax ?? raw.accelX);
  const y = num(raw.y ?? raw.ay ?? raw.accelY);
  const z = num(raw.z ?? raw.az ?? raw.accelZ);

  const gyroX = num(raw.gyroX ?? raw.gx);
  const gyroY = num(raw.gyroY ?? raw.gy);
  const gyroZ = num(raw.gyroZ ?? raw.gz);

  const motion =
    typeof raw.motion === "boolean"
      ? raw.motion
      : raw.motion != null
        ? Boolean(Number(raw.motion))
        : undefined;

  const _timeMs = rawTimestampMs(raw) || Date.now();

  return {
    temperature,
    humidity,
    gas,
    motion,
    x,
    y,
    z,
    gyroX,
    gyroY,
    gyroZ,
    courant,
    tension,
    piezo,
    _timeMs
  };
}

export function sortReadingsNewestFirst(items) {
  return items.slice().sort((a, b) => (b._timeMs || 0) - (a._timeMs || 0));
}
