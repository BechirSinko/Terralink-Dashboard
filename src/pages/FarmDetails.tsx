import { useParams, Link } from "react-router-dom";
import dataRaw from "../sample-data.json";
import type { SensorData } from "../types";
import { detectAlerts } from "../detections";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function FarmDetails() {
  const { farmId } = useParams<{ farmId: string }>();

  const allData = dataRaw as SensorData[];
  const farmData = allData
    .filter((r) => r.farmId === farmId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  if (!farmId) {
    return <div>No farm selected.</div>;
  }

  if (farmData.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Farm {farmId}</h2>
        <p className="text-sm text-gray-600">
          No sensor data found for this farm in the current sample.
        </p>
        <Link to="/alerts" className="text-sm text-blue-600 underline">
          Back to alerts
        </Link>
      </div>
    );
  }

  const latest = farmData[farmData.length - 1];
  const farmAlerts = detectAlerts(allData).filter(
    (a) => a.farmId === farmId
  );

  const chartData = farmData.map((r) => ({
    time: r.timestamp.slice(0, 16).replace("T", " "),
    soilMoisture: r.soilMoisture,
    temperature: r.temperature,
  }));

  const { status, statusText } = getStatus(latest);
  const advice = getIrrigationAdvice(latest);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Farm {farmId} details</h2>
          <p className="text-sm text-gray-600">
            Region: <b>{latest.region}</b> · Crop: <b>{latest.crop}</b>
          </p>
        </div>
        <Link
          to="/map"
          className="text-sm text-blue-600 underline"
        >
          ← Back to map
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <SummaryCard label="Latest soil moisture" value={`${latest.soilMoisture}%`} />
        <SummaryCard label="Latest temperature" value={`${latest.temperature}°C`} />
        <SummaryCard label="Latest rainfall" value={`${latest.rainfall} mm`} />
        <SummaryCard
          label="Status"
          value={statusText}
          highlight={status}
        />
      </div>

      {/* Irrigation advice */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          Smart irrigation advice
        </h3>
        <p className="text-sm text-gray-700">{advice.main}</p>
        {advice.extra && (
          <ul className="mt-2 list-disc pl-5 text-xs text-gray-600">
            {advice.extra.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Time-series chart */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Soil moisture & temperature over time
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="soilMoisture" />
              <Line type="monotone" dataKey="temperature" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts for this farm */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Alerts for this farm
        </h3>
        {farmAlerts.length === 0 ? (
          <p className="text-sm text-gray-600">
            No alerts have been triggered yet for this farm in the sample.
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-[700px] w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  {["Type", "Severity", "Triggered At", "Microinsurance"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-xs text-gray-600"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {farmAlerts.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="px-3 py-2 text-sm">{a.type}</td>
                    <td className="px-3 py-2 text-sm">{a.severity}</td>
                    <td className="px-3 py-2 text-sm">
                      {new Date(a.triggeredAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {formatStatus(a.microinsuranceStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "normal" | "warning" | "critical";
}) {
  const color =
    highlight === "critical"
      ? "text-red-600"
      : highlight === "warning"
      ? "text-amber-600"
      : "";

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function getStatus(latest: SensorData): {
  status: "normal" | "warning" | "critical";
  statusText: string;
} {
  let status: "normal" | "warning" | "critical" = "normal";

  if (latest.soilMoisture < 12 && latest.temperature > 32) {
    status = "critical";
  } else if (latest.soilMoisture < 16) {
    status = "warning";
  }

  const statusText =
    status === "normal"
      ? "✅ Normal"
      : status === "warning"
      ? "🟡 Water stress"
      : "🔴 Drought risk";

  return { status, statusText };
}

function getIrrigationAdvice(latest: SensorData): {
  main: string;
  extra?: string[];
} {
  // Very simple rule-based advice – enough to explain the concept
  if (latest.soilMoisture < 12 && latest.temperature > 32) {
    return {
      main:
        "Critical drought risk detected. Irrigation is strongly recommended as soon as possible, if water is available.",
      extra: [
        "Prioritize this plot in your irrigation schedule.",
        "If you are covered, microinsurance partners are notified to support potential yield loss.",
      ],
    };
  }

  if (latest.soilMoisture < 16) {
    return {
      main:
        "Soil moisture is low. Plan irrigation within the next 24 hours, especially during cooler morning or evening hours.",
      extra: [
        "Avoid mid-day irrigation to reduce evaporation.",
        "Monitor the dashboard to see if moisture continues to fall.",
      ],
    };
  }

  if (latest.soilMoisture > 30 && latest.rainfall > 5) {
    return {
      main:
        "Soil is currently well supplied with water. Irrigation is not needed now and over-irrigation could damage roots.",
      extra: [
        "Wait and re-check soil moisture before scheduling new irrigation cycles.",
      ],
    };
  }

  return {
    main:
      "Conditions are stable. No immediate irrigation is required, but keep monitoring forecasts and soil moisture trends.",
    extra: [
      "Irrigate only if several days of high temperature and no rainfall are expected.",
    ],
  };
}

function formatStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pending partner response";
    case "approved":
      return "Compensation approved";
    case "rejected":
      return "Claim rejected";
    default:
      return "Not triggered";
  }
}
