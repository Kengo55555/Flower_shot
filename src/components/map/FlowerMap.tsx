import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { FlowerRecord } from "../../types";

// Fix Leaflet default icon issue with Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface FlowerMapProps {
  records: FlowerRecord[];
}

function FitBounds({ records }: { records: FlowerRecord[] }) {
  const map = useMap();
  useEffect(() => {
    if (records.length === 0) return;
    const bounds = L.latLngBounds(
      records.map((r) => [r.location!.latitude, r.location!.longitude])
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [records, map]);
  return null;
}

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}がつ ${date.getDate()}にち`;
}

export default function FlowerMap({ records }: FlowerMapProps) {
  return (
    <MapContainer
      center={[35.6762, 139.6503]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <FitBounds records={records} />
      {records.map((record) => (
        <Marker
          key={record.id}
          position={[record.location!.latitude, record.location!.longitude]}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold text-base">{record.flowerName}</p>
              <p className="text-xs text-gray-500">
                {formatDate(record.capturedAt)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
