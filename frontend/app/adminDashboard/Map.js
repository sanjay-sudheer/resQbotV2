"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix default marker issue in Leaflet with Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// This component handles the map position updates
function ChangeView({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.setView([coords.lat, coords.lng], 13);
  }, [coords, map]);
  
  return null;
}

const Map = ({ coords = { lat: 40.7128, lng: -74.006 } }) => {
  return (
    <MapContainer 
      center={[coords.lat, coords.lng]} 
      zoom={13} 
      style={{ height: "400px", width: "100%" }}
    >
      <ChangeView coords={coords} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[coords.lat, coords.lng]}>
        <Popup>Issue reported here</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;