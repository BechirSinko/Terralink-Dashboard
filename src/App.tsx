import { useEffect, useMemo, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Overview from "./pages/Overview.tsx";
import Analytics from "./pages/Analytics.tsx";
import Alerts from "./pages/Alerts.tsx";
import MapPage from "./pages/Map.tsx";
import FarmDetails from "./pages/FarmDetails.tsx";

import dataRaw from "./sample-data.json";
import type { SensorData, Alert as TerraAlert } from "./types";
import { detectAlerts } from "./detections";
import { Toaster, toast } from "react-hot-toast";

export default function App() {
  const data = dataRaw as SensorData[];
  const alerts = useMemo(() => detectAlerts(data), [data]);

  return (
    <div className="min-h-screen bg-emerald-50 text-gray-900">
      {/* Toast system */}
      <Toaster position="top-right" />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex w-60 flex-col border-r bg-gradient-to-b from-emerald-800 via-emerald-700 to-lime-500 px-4 py-6 text-emerald-50">
          {/* Logo / title */}
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-2xl">
              🌱
            </div>
            <div>
              <div className="text-sm uppercase tracking-widest text-emerald-100">
                TerraLink
              </div>
              <div className="text-xs text-emerald-200">
                Climate-smart farming
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-2 text-sm">
            <SideLink to="/" label="Overview" icon="🏠" />
            <SideLink to="/analytics" label="Analytics" icon="📈" />
            <SideLink to="/alerts" label="Alerts" icon="🚨" />
            <SideLink to="/map" label="Map" icon="🗺️" />
          </nav>

          {/* Footer */}
          <div className="mt-6 border-t border-emerald-600/40 pt-4 text-[11px] text-emerald-100">
            TSYP · TerraLink prototype
            <br />
            Built for small Tunisian farmers.
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-4">
            {/* Top bar with bell */}
            <TopBar alerts={alerts} />

            {/* Small banner */}
            <div className="rounded-2xl border border-emerald-100 bg-white/70 px-4 py-3 text-sm text-gray-700 shadow-sm">
              <b>TerraLink</b> uses IoT soil sensors to detect drought and water
              stress early. When thresholds are crossed, alerts are raised and
              microinsurance partners are notified to protect farmers'
              livelihoods.
            </div>

            {/* Filters */}
            <GlobalFilters />

            {/* Routed pages */}
            <div className="rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-md">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/farm/:farmId" element={<FarmDetails />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Sidebar link component ---------- */

function SideLink({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: string;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-xl px-3 py-2 transition",
          "hover:bg-emerald-600/40 hover:text-white",
          isActive
            ? "bg-white/15 font-semibold text-white"
            : "text-emerald-100",
        ].join(" ")
      }
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

/* ---------- Top bar & bell ---------- */

function TopBar({ alerts }: { alerts: TerraAlert[] }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-emerald-500">
          Dashboard
        </div>
        <div className="text-lg font-semibold text-gray-900">
          Tunisian smallholder farms
        </div>
        <div className="text-xs text-gray-500">
          Live sensor simulation + historical data from the pilot.
        </div>
      </div>
      <NotificationBell alerts={alerts} />
    </div>
  );
}

function NotificationBell({ alerts }: { alerts: TerraAlert[] }) {
  const [hasShownInitial, setHasShownInitial] = useState(false);

  useEffect(() => {
    if (!hasShownInitial && alerts.length > 0) {
      const latest = alerts[alerts.length - 1];
      toast(`New ${latest.type} alert on farm ${latest.farmId}`, {
        icon: "🔔",
      });
      setHasShownInitial(true);
    }
  }, [alerts, hasShownInitial]);

  const total = alerts.length;
  const criticalCount = alerts.filter((a) => a.severity === "high").length;

  const handleClick = () => {
    if (alerts.length === 0) {
      toast("No active alerts. All farms are stable 🌱", {
        icon: "✅",
      });
      return;
    }

    const latest = alerts[alerts.length - 1];
    toast(
      `Currently ${total} active alerts (${criticalCount} high). Latest: ${latest.type} on ${latest.farmId}.`,
      {
        icon: "📡",
      }
    );
  };

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-emerald-50"
    >
      <span className="text-lg">🔔</span>
      <span className="text-gray-700">Alerts</span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
        {total}
      </span>
    </button>
  );
}

/* ---------- Filters ---------- */

function GlobalFilters() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <select className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 shadow-sm">
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Last 90 days</option>
      </select>
      <select className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 shadow-sm">
        <option>All regions</option>
        <option>North</option>
        <option>Center</option>
        <option>South</option>
      </select>
      <select className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 shadow-sm">
        <option>All crops</option>
        <option>Olives</option>
        <option>Cereals</option>
        <option>Dates</option>
      </select>
    </div>
  );
}
