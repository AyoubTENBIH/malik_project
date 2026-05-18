/** Volume d’impression (mm) — surchargeable via .env */
export const BED_SIZE = {
  x: Number(process.env.REACT_APP_BED_SIZE_X) || 220,
  y: Number(process.env.REACT_APP_BED_SIZE_Y) || 220,
  z: Number(process.env.REACT_APP_BED_SIZE_Z) || 250
};

/** 1 unité Three.js = 10 mm */
export const MM = 0.1;

export function marlinToScene(xMm, yMm, zMm) {
  const x = Number(xMm) || 0;
  const y = Number(yMm) || 0;
  const z = Number(zMm) || 0;
  return {
    x: x * MM,
    y: z * MM + 0.12,
    z: -y * MM
  };
}

export function hasValidPosition(reading) {
  if (!reading) return false;
  const { posX, posY, posZ } = reading;
  return [posX, posY, posZ].some(v => v != null && Number.isFinite(Number(v)));
}

export function bedHeatColor(bedTemp, bedTarget) {
  const t = Number(bedTemp) || 0;
  const target = Number(bedTarget) || 60;
  const ratio = Math.min(1, Math.max(0, t / Math.max(target, 1)));
  const cold = { r: 0.22, g: 0.24, b: 0.28 };
  const hot = { r: 0.95, g: 0.35, b: 0.12 };
  return {
    r: cold.r + (hot.r - cold.r) * ratio,
    g: cold.g + (hot.g - cold.g) * ratio,
    b: cold.b + (hot.b - cold.b) * ratio
  };
}
