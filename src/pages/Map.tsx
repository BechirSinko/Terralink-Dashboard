import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";


// Type for our farms
type Farm = {
  id: string;
  name: string;
  region: "North" | "Center" | "South";
  crop: "Olives" | "Cereals" | "Dates" | "Other";
  status: "normal" | "warning" | "critical";
  position: LatLngExpression;
};

// Sample farms in Tunisia
const FARMS: Farm[] = [
  {
    id: "f-tn-01",
    name: "Farm TN-01 (Olives)",
    region: "Center",
    crop: "Olives",
    status: "warning",
    position: [35.55, 10.75], // near Sousse
  },
  {
    id: "f-tn-02",
    name: "Farm TN-02 (Dates)",
    region: "South",
    crop: "Dates",
    status: "critical",
    position: [33.88, 10.1], // near Gabès
  },
  {
    id: "f-tn-03",
    name: "Farm TN-03 (Cereals)",
    region: "North",
    crop: "Cereals",
    status: "normal",
    position: [36.8, 10.17], // near Tunis
  },
];

const statusLabel: Record<Farm["status"], string> = {
  normal: "✅ Normal",
  warning: "🟡 Water stress risk",
  critical: "🔴 Drought alert",
};

// Use Leaflet's default marker icon via L.icon
const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapPage() {
  const center: LatLngExpression = [35.3, 9.5]; // center of Tunisia

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm h-[80vh]">
      <h2 className="mb-2 text-lg font-semibold">
        TerraLink Farm Map (Tunisia)
      </h2>
      <p className="mb-3 text-sm text-gray-600">
        Each marker represents a farm equipped with TerraLink sensors. Status is
        derived from recent soil moisture, temperature, and rainfall readings.
      </p>

      <div className="h-full overflow-hidden rounded-xl border">
        <MapContainer
          center={center}
          zoom={6}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {FARMS.map((farm) => (
            <Marker
              key={farm.id}
              position={farm.position}
              icon={defaultIcon}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{farm.name}</div>
                  <div className="text-sm text-gray-700">
                    Region: {farm.region} <br />
                    Crop: {farm.crop}
                  </div>
                  <div className="text-sm">
                    Status:{" "}
                    <span className="font-medium">
                      {statusLabel[farm.status]}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
  <Link
    to={`/farm/${farm.id}`}
    className="text-blue-600 underline"
  >
    View farm details →
  </Link>
</div>

                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
