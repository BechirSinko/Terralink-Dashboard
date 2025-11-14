import dataRaw from "../sample-data.json";
import type { SensorData, KPI } from "../types";
import { useMemo, useState, useEffect } from "react";
import { detectAlerts } from "../detections";

export default function Overview() {
  const data = dataRaw as SensorData[];

  const kpi = useMemo<KPI>(() => {
    const n = data.length || 1;
    const avgSoil =
      data.reduce((sum, row) => sum + row.soilMoisture, 0) / n;
    const avgTemp =
      data.reduce((sum, row) => sum + row.temperature, 0) / n;
    const totalRain =
      data.reduce((sum, row) => sum + row.rainfall, 0);

    const alerts = detectAlerts(data);

    return {
      avgSoilMoisture: +avgSoil.toFixed(1),
      avgTemp: +avgTemp.toFixed(1),
      totalRainfall: +totalRain.toFixed(1),
      activeAlerts: alerts.length,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Avg Soil Moisture" value={`${kpi.avgSoilMoisture}%`} />
        <KpiCard label="Avg Temperature" value={`${kpi.avgTemp}°C`} />
        <KpiCard label="Total Rainfall" value={`${kpi.totalRainfall} mm`} />
        <KpiCard label="Active Alerts" value={`${kpi.activeAlerts}`} />
      </div>

      {/* Live simulation */}
      <LiveFarmSimulation />
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

/**
 * LiveFarmSimulation
 * Simulates one farm's sensor data changing every few seconds.
 * Great for the demo: you can show how moisture drops, temperature rises,
 * and how the status changes.
 */
function LiveFarmSimulation() {
  const [soilMoisture, setSoilMoisture] = useState(22); // %
  const [temperature, setTemperature] = useState(28);   // °C
  const [rainfall, setRainfall] = useState(0);          // mm (last reading)

  useEffect(() => {
  const id = setInterval(() => {
    setRainfall(() => {
      // sometimes it rains a bit
      const rainEvent = Math.random() < 0.2 ? Math.random() * 10 : 0;
      return Number(rainEvent.toFixed(1));
    });

    setTemperature((prev) => {
      // small random temp variation
      const delta = (Math.random() - 0.5) * 1.5;
      const next = Math.min(40, Math.max(15, prev + delta));
      return Number(next.toFixed(1));
    });

    setSoilMoisture((prev) => {
      // if it rained, moisture goes up; otherwise, it slowly dries out
      const isRain = Math.random() < 0.2;
      const delta = isRain
        ? +(Math.random() * 4).toFixed(1)
        : -+(Math.random() * 2).toFixed(1);
      const next = Math.min(40, Math.max(5, prev + delta));
      return Number(next.toFixed(1));
    });
  }, 2000); // update every 2 seconds

  return () => clearInterval(id);
}, []);


  // Simple status logic similar to detection rules
  let status: "normal" | "warning" | "critical" = "normal";
  if (soilMoisture < 12 && temperature > 32) status = "critical";
  else if (soilMoisture < 16) status = "warning";

  const statusText =
    status === "normal"
      ? "✅ Normal conditions"
      : status === "warning"
      ? "🟡 Water stress risk"
      : "🔴 Drought alert";

  const statusClass =
    status === "normal"
      ? "border-green-500 bg-green-50"
      : status === "warning"
      ? "border-amber-500 bg-amber-50"
      : "border-red-500 bg-red-50";

  return (
    <div
      className={`rounded-2xl border-2 ${statusClass} p-5 transition-colors`}
    >
      <div className="mb-2 text-sm font-semibold text-gray-700">
        Live simulation – example farm
      </div>
      <div className="mb-2 text-sm text-gray-600">
        Values below simulate real-time readings from an ESP32 soil sensor
        station in Tunisia.
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SimMetric label="Soil moisture" value={`${soilMoisture}%`} />
        <SimMetric label="Temperature" value={`${temperature}°C`} />
        <SimMetric label="Recent rainfall" value={`${rainfall} mm`} />
      </div>

      <div className="mt-4 text-sm font-medium">{statusText}</div>
      <div className="mt-1 text-xs text-gray-600">
        In production, this status would feed into the alert engine and
        microinsurance triggers for this specific farmer.
      </div>
    </div>
  );
}

function SimMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/70 p-3 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
