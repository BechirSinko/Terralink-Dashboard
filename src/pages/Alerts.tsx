import dataRaw from "../sample-data.json";
import type { SensorData } from "../types";
import { detectAlerts } from "../detections";
import { Link } from "react-router-dom";


export default function Alerts() {
  const data = dataRaw as SensorData[];
  const alerts = detectAlerts(data);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Alerts & Microinsurance Triggers
      </h2>

      <div className="overflow-auto">
        <table className="min-w-[900px] w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              {[
                "Type",
                "Severity",
                "Farm",
                "Triggered At",
                "Resolved",
                "Microinsurance Status",
              ].map((h) => (
                <th key={h} className="px-3 py-2 text-sm text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="px-3 py-2">{a.type}</td>
                <td className="px-3 py-2">{a.severity}</td>
                <td className="px-3 py-2">
  <Link
    to={`/farm/${a.farmId}`}
    className="text-sm text-blue-600 underline"
  >
    {a.farmId}
  </Link>
</td>

                <td className="px-3 py-2">
                  {new Date(a.triggeredAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">{a.resolved ? "Yes" : "No"}</td>
                <td className="px-3 py-2">
                  {formatStatus(a.microinsuranceStatus)}
                </td>
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={6}>
                  No alerts detected in the current sample.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        Medium and high severity alerts are automatically flagged as{" "}
        <span className="font-semibold">pending microinsurance</span>, so
        partner NGOs/insurers can react quickly when drought or water stress is
        detected.
      </p>
    </div>
  );
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
