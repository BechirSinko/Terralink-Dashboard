import dataRaw from "../sample-data.json";
import type { SensorData } from "../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";


type DayAgg = {
  day: string;
  soilMoisture: number;
  temperature: number;
  rainfall: number;
};

export default function Analytics() {
  const data = (dataRaw as SensorData[])
    .slice()
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const byDay: Record<string, DayAgg> = {};
  for (const row of data) {
    const day = row.timestamp.slice(0, 10);
    if (!byDay[day]) {
      byDay[day] = { day, soilMoisture: 0, temperature: 0, rainfall: 0 };
    }
    byDay[day].soilMoisture += row.soilMoisture;
    byDay[day].temperature += row.temperature;
    byDay[day].rainfall += row.rainfall;
  }

  const series = Object.values(byDay)
    .map((x) => ({
      ...x,
      soilMoisture: +x.soilMoisture.toFixed(1),
      temperature: +x.temperature.toFixed(1),
      rainfall: +x.rainfall.toFixed(1),
    }))
    .sort((a, b) => a.day.localeCompare(b.day));

  const regions = ["North", "Center", "South"];
  const byRegion = regions.map((region) => {
    const rows = data.filter((d) => d.region === region);
    const avg =
      rows.length === 0
        ? 0
        : rows.reduce((s, r) => s + r.soilMoisture, 0) / rows.length;
    return {
      region,
      soilMoisture: Math.round(avg),
    };
  });

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card title="Soil Moisture & Temperature (Daily)">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="soilMoisture" />
              <Line type="monotone" dataKey="temperature" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Average Moisture by Region">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byRegion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="soilMoisture" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}
