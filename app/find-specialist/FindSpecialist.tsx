// components/MapView.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
const DefaultIcon = L.icon({
  iconUrl: "/images/marker-icon.png",
  iconRetinaUrl: "/images/marker-icon-2x.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView({ location, places }: {
  location: { lat: number; lon: number },
  places: any[]
}) {
  return (
    <MapContainer
      center={[location.lat, location.lon]}
      zoom={14}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[location.lat, location.lon]}>
        <Popup>Your Location</Popup>
      </Marker>
      {places.map((place) => (
        <Marker
          key={place.properties.place_id}
          position={[place.geometry.coordinates[1], place.geometry.coordinates[0]]}
        >
          <Popup>
            <strong>{place.properties.name}</strong>
            <br />
            {place.properties.address_line2 || "No address available"}
            <br />
            {place.properties.contact?.phone || "No phone"}
            <br />
            {place.properties.datasource?.raw?.website && (
              <a href={place.properties.datasource.raw.website} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}