"use client"; 

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const SpecialistMap = () => {
  const mapRef = useRef<any>(null);
  const [map, setMap] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [specialists, setSpecialists] = useState([]);
  const [illness, setIllness] = useState("");

  useEffect(() => {
    if (!mapRef.current) {
      const newMap = L.map("map").setView([20.5937, 78.9629], 5); // Default location: India (Zoomed out)
      mapRef.current = newMap;
      setMap(newMap);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(newMap);
    }
  }, []);

  useEffect(() => {
    if (map && specialists.length > 0) {
      specialists.forEach((specialist: any) => {
        L.marker([specialist.lat, specialist.lng])
          .addTo(map)
          .bindPopup(`<b>${specialist.name}</b><br>${specialist.address}<br><b>Specialty:</b> ${specialist.specialty}`);
      });
    }
  }, [map, specialists]);

  const fetchSpecialists = async () => {
    if (!userLocation) {
      alert("User location is not available. Please allow location access.");
      return;
    }

    try {
      const response = await axios.get(`/api/specialists`, {
        params: {
          illness,
          lat: userLocation[0],
          lng: userLocation[1]
        }
      });
      setSpecialists(response.data.specialists);
    } catch (error) {
      console.error("Error fetching specialists:", error);
    }
  };

  const handleLocationAccess = () => {
    // Manually set location to your college
    const fixedLatitude = 18.531342351484124;
    const fixedLongitude = 73.8673063285546;

    setUserLocation([fixedLatitude, fixedLongitude]);

    if (map) {
      map.setView([fixedLatitude, fixedLongitude], 15); // Adjust zoom level as needed
      L.marker([fixedLatitude, fixedLongitude])
        .addTo(map)
        .bindPopup("<b>you are here!</b>")
        .openPopup();
    }
  };

  return (
    <div className="p-6 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Find Specialist/ Healthcare centers Near You</h1>

        <div className="mb-4">
          <input
            type="text"
            value={illness}
            onChange={(e) => setIllness(e.target.value)}
            placeholder="search for places/ specialists"
            className="border p-2 rounded w-full mb-2"
          />
          <button
            onClick={fetchSpecialists}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >Search
          </button>
          <button
            onClick={handleLocationAccess}
            className="px-4 py-2 bg-green-500 text-white rounded ml-2 hover:bg-green-600"
          >
            Enable Location
          </button>
        </div>

        <div id="map" style={{ height: "400px", width: "100%" }}></div>
      </div>
    </div>
  );
};

export default SpecialistMap;
