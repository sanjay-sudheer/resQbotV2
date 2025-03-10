"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

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

const Map = ({ lat, lng }) => {
  const [isMounted, setIsMounted] = useState(false);
  const coords = { lat: lat || 40.7128, lng: lng || -74.006 };
  
  // Ensure map renders only after component mounts (client-side)
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Format Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  
  if (!isMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={[coords.lat, coords.lng]} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
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
      
      {/* Google Maps link overlay */}
      <a 
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 bg-white bg-opacity-90 hover:bg-opacity-100 text-blue-600 px-3 py-1.5 rounded-md flex items-center transition duration-200 z-[1000] text-sm font-medium shadow-md"
      >
        <ExternalLink className="h-4 w-4 mr-1.5" />
        Open in Google Maps
      </a>
    </div>
  );
};

export default Map;