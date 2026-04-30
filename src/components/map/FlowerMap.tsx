import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { getImage } from "../../lib/indexeddb";
import type { FlowerRecord } from "../../types";

const pinIcon = L.divIcon({
  html: '<span style="font-size:32px">📍</span>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
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

function FlowerPopup({ record }: { record: FlowerRecord }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const key = record.photoLocalKey || record.id;
    getImage(key).then((blob) => {
      if (blob) setImageUrl(URL.createObjectURL(blob));
    });
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [record.photoLocalKey, record.id]);

  return (
    <div className="text-center" style={{ minWidth: 120 }}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={record.flowerName}
          style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 8, marginBottom: 4 }}
        />
      )}
      <p style={{ fontWeight: "bold", fontSize: 14, margin: "4px 0 2px" }}>{record.flowerName}</p>
      <p style={{ fontSize: 11, color: "#888" }}>{formatDate(record.capturedAt)}</p>
    </div>
  );
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
          icon={pinIcon}
        >
          <Popup>
            <FlowerPopup record={record} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
