import type { SensorData, Alert } from "./types";
import { v4 as uuid } from "uuid";

type Thresholds = {
  droughtSoilPct: number;
  highTempC: number;
  floodRainMmDay: number;
};

export const DEFAULT_THRESHOLDS: Thresholds = {
  droughtSoilPct: 12,
  highTempC: 32,
  floodRainMmDay: 40,
};

export function detectAlerts(
  rows: SensorData[],
  t: Thresholds = DEFAULT_THRESHOLDS
): Alert[] {
  const alerts: Alert[] = [];
  const byFarm: Record<string, SensorData[]> = {};

  for (const r of rows) {
    if (!byFarm[r.farmId]) byFarm[r.farmId] = [];
    byFarm[r.farmId].push(r);
  }

  for (const farmId of Object.keys(byFarm)) {
    const series = byFarm[farmId].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp)
    );

    // 1) Drought onset: 2+ consecutive low soil moisture
    let streak = 0;
    for (const r of series) {
      if (r.soilMoisture < t.droughtSoilPct) {
        streak++;
        if (streak === 2) {
          alerts.push({
            id: uuid(),
            farmId,
            type: "drought",
            severity: "medium",
            triggeredAt: r.timestamp,
            resolved: false,
            microinsuranceStatus: "pending", // trigger support
          });
        }
      } else {
        streak = 0;
      }
    }

    // 2) Acute water stress: rapid drop + high temp + no rain
    for (let i = 1; i < series.length; i++) {
      const prev = series[i - 1];
      const cur = series[i];
      const drop = prev.soilMoisture - cur.soilMoisture;

      if (drop >= 2 && cur.temperature >= t.highTempC && cur.rainfall === 0) {
        const severity: Alert["severity"] = drop >= 5 ? "high" : "medium";
        alerts.push({
          id: uuid(),
          farmId,
          type: "water_stress",
          severity,
          triggeredAt: cur.timestamp,
          resolved: false,
          microinsuranceStatus: "pending", // also triggers support
        });
      }
    }

    // 3) Flood / excess water: heavy rain + high soil moisture
    for (const r of series) {
      if (r.rainfall >= t.floodRainMmDay && r.soilMoisture >= 30) {
        alerts.push({
          id: uuid(),
          farmId,
          type: "flood",
          severity: "medium",
          triggeredAt: r.timestamp,
          resolved: false,
          microinsuranceStatus: "pending",
        });
      }
    }

    // 4) Irrigation failure (simple heuristic)
    for (let i = 1; i < series.length; i++) {
      const prev = series[i - 1];
      const cur = series[i];
      if (prev.rainfall > 5 && cur.soilMoisture <= prev.soilMoisture) {
        alerts.push({
          id: uuid(),
          farmId,
          type: "irrigation_failure",
          severity: "low",
          triggeredAt: cur.timestamp,
          resolved: false,
          microinsuranceStatus: "none", // just monitor
        });
      }
    }
  }

  return alerts;
}
