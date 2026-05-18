import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  ref,
  onValue,
  query,
  orderByKey,
  limitToLast
} from "firebase/database";
import { rtdb } from "../firebase";
import {
  normalizeSensorReading,
  sortReadingsNewestFirst,
  faultLabelDisplay
} from "../utils/sensorReading";

const DashboardDataContext = createContext(null);

export const CAPTEURS_PATH =
  process.env.REACT_APP_FIREBASE_CAPTEURS_PATH || "capteurs";

const MAX_POINTS = Math.min(
  500,
  Math.max(50, Number(process.env.REACT_APP_FIREBASE_MAX_POINTS) || 200)
);

export const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:3000";

export const METRICS = [
  { key: "tempMotorTop", title: "Moteur (haut)", unit: "°C", color: "#ef4444" },
  {
    key: "tempMotorBottom",
    title: "Moteur (bas)",
    unit: "°C",
    color: "#f97316"
  },
  { key: "gas", title: "Gaz MQ2", unit: "", color: "#10b981" },
  { key: "courant", title: "Courant", unit: "A", color: "#8b5cf6" },
  { key: "tension", title: "Tension", unit: "V", color: "#f59e0b" },
  {
    key: "piezoLeft",
    title: "Vibration gauche",
    unit: "",
    color: "#ec4899"
  },
  {
    key: "piezoRight",
    title: "Vibration droite",
    unit: "",
    color: "#d946ef"
  },
  { key: "nozzleTemp", title: "Buse", unit: "°C", color: "#dc2626" },
  { key: "bedTemp", title: "Plateau", unit: "°C", color: "#ea580c" },
  { key: "x", title: "Accéléro X", unit: "m/s²", color: "#06b6d4" },
  { key: "y", title: "Accéléro Y", unit: "m/s²", color: "#84cc16" },
  { key: "z", title: "Accéléro Z", unit: "m/s²", color: "#14b8a6" },
  { key: "gyroX", title: "Gyro X", unit: "rad/s", color: "#a855f7" },
  { key: "gyroY", title: "Gyro Y", unit: "rad/s", color: "#eab308" },
  { key: "gyroZ", title: "Gyro Z", unit: "rad/s", color: "#6366f1" }
];

const EMPTY_LATEST = {};

export function DashboardDataProvider({ children }) {
  const [data, setData] = useState([]);
  const [zone, setZone] = useState("printer");

  useEffect(() => {
    const capteursRef = query(
      ref(rtdb, CAPTEURS_PATH),
      orderByKey(),
      limitToLast(MAX_POINTS)
    );

    const unsub = onValue(capteursRef, snapshot => {
      const val = snapshot.val();
      if (!val || typeof val !== "object") {
        setData([]);
        return;
      }

      const items = Object.entries(val).map(([id, payload]) => ({
        id,
        ...normalizeSensorReading(payload)
      }));

      setData(sortReadingsNewestFirst(items));
    });

    return () => unsub();
  }, []);

  const dataChronological = useMemo(
    () =>
      data.slice().sort((a, b) => (a._timeMs || 0) - (b._timeMs || 0)),
    [data]
  );

  const latest = data[0] ?? EMPTY_LATEST;

  const format = useCallback((value, unit = "") => {
    if (value === undefined || value === null) return "—";
    if (typeof value === "boolean") return value ? "Oui" : "Non";
    return `${value} ${unit}`.trim();
  }, []);

  const isOnline = data.length > 0;

  const tempAlert =
    (latest.tempMotorTop != null && latest.tempMotorTop > 70) ||
    (latest.tempMotorBottom != null && latest.tempMotorBottom > 70);

  const gasAlert =
    latest.faultCode === 3 ||
    (latest.gas != null && latest.gas > 2500);
  const faultAlert = (latest.faultCode ?? 0) > 0;

  const faultLabelFr = faultLabelDisplay(latest.faultLabel);

  const lastUpdate =
    latest._timeMs != null
      ? new Date(latest._timeMs).toLocaleString()
      : "—";

  const downloadCsv = useCallback(kind => {
    const path =
      kind === "marlin"
        ? `${API_BASE}/api/export/marlin`
        : `${API_BASE}/api/export/dataset`;
    window.open(path, "_blank", "noopener,noreferrer");
  }, []);

  const value = useMemo(
    () => ({
      data,
      dataChronological,
      latest,
      format,
      isOnline,
      tempAlert,
      gasAlert,
      faultAlert,
      faultLabelFr,
      lastUpdate,
      zone,
      setZone,
      METRICS,
      maxPoints: MAX_POINTS,
      capteursPath: CAPTEURS_PATH,
      downloadCsv,
      apiBase: API_BASE
    }),
    [
      data,
      dataChronological,
      latest,
      format,
      isOnline,
      tempAlert,
      gasAlert,
      faultAlert,
      faultLabelFr,
      lastUpdate,
      zone,
      downloadCsv
    ]
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) {
    throw new Error("useDashboardData must be used within DashboardDataProvider");
  }
  return ctx;
}

const THEME_STORAGE_KEY = "iot-print-theme";

const AppThemeContext = createContext(null);

function readStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readStoredTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  }, []);

  const themeValue = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === "dark"
    }),
    [theme, toggleTheme]
  );

  return (
    <AppThemeContext.Provider value={themeValue}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
