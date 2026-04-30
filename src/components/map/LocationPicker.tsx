import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import type { GeoLocation } from "../../types";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  initialLocation: GeoLocation | null;
  onSelect: (location: GeoLocation) => void;
  onClose: () => void;
}

function MapClickHandler({ onSelect }: { onSelect: (loc: GeoLocation) => void }) {
  useMapEvents({
    click(e) {
      onSelect({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

function MoveToLocation({ location }: { location: GeoLocation }) {
  const map = useMap();
  useEffect(() => {
    map.setView([location.latitude, location.longitude], 15);
  }, [location, map]);
  return null;
}

export default function LocationPicker({ initialLocation, onSelect, onClose }: LocationPickerProps) {
  const [selected, setSelected] = useState<GeoLocation | null>(initialLocation);
  const defaultCenter: GeoLocation = { latitude: 35.6762, longitude: 139.6503 };
  const center = selected || initialLocation || defaultCenter;

  const handleSelect = (loc: GeoLocation) => {
    setSelected(loc);
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-pink text-white">
        <button onClick={onClose} className="text-lg">✕</button>
        <span className="font-bold">ばしょを えらんでね</span>
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="font-bold disabled:opacity-50"
        >
          けってい
        </button>
      </div>
      <p className="text-center text-xs text-gray-500 py-2">
        ちずを タップして ばしょを えらんでね
      </p>
      <div className="flex-1">
        <MapContainer
          center={[center.latitude, center.longitude]}
          zoom={selected ? 15 : 13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onSelect={handleSelect} />
          {selected && (
            <>
              <Marker position={[selected.latitude, selected.longitude]} />
              <MoveToLocation location={selected} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
