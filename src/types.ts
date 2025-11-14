export type SensorData = {
  id: string;
  farmId: string;
  timestamp: string;    // ISO datetime
  temperature: number;  // °C
  soilMoisture: number; // %
  rainfall: number;     // mm
  region: "North" | "Center" | "South";
  crop: "Olives" | "Cereals" | "Dates" | "Other";
};

export type Alert = {
  id: string;
  farmId: string;
  type: "drought" | "water_stress" | "flood" | "irrigation_failure";
  severity: "low" | "medium" | "high";
  triggeredAt: string;  // ISO datetime
  resolved: boolean;
  microinsuranceStatus: "none" | "pending" | "approved" | "rejected";
};

export type KPI = {
  avgSoilMoisture: number;
  avgTemp: number;
  totalRainfall: number;
  activeAlerts: number;
};
