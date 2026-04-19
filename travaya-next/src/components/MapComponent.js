"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// Fix for default marker icons in NextJS
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom glowing icon
const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Broad GPS coordinates for Indian states
const STATE_COORDINATES = {
  "Andhra Pradesh": [15.9129, 79.7400],
  "Arunachal Pradesh": [28.2180, 94.7278],
  "Assam": [26.2006, 92.9376],
  "Bihar": [25.0961, 85.3131],
  "Chhattisgarh": [21.2787, 81.8661],
  "Goa": [15.2993, 74.1240],
  "Gujarat": [22.2587, 71.1924],
  "Haryana": [29.0588, 76.0856],
  "Himachal Pradesh": [31.1048, 77.1734],
  "Jharkhand": [23.6102, 85.2799],
  "Karnataka": [15.3173, 75.7139],
  "Kerala": [10.8505, 76.2711],
  "Madhya Pradesh": [22.9734, 78.6569],
  "Maharashtra": [19.7515, 75.7139],
  "Manipur": [24.6637, 93.9063],
  "Meghalaya": [25.4670, 91.3662],
  "Mizoram": [23.1645, 92.9376],
  "Nagaland": [26.1584, 94.5624],
  "Odisha": [20.9517, 85.9000],
  "Punjab": [31.1471, 75.3412],
  "Rajasthan": [27.0238, 74.2179],
  "Sikkim": [27.5330, 88.5122],
  "Tamil Nadu": [11.1271, 78.6569],
  "Telangana": [18.1124, 79.0193],
  "Tripura": [23.9408, 91.9882],
  "Uttar Pradesh": [26.8467, 80.9462],
  "Uttarakhand": [30.0668, 79.0193],
  "West Bengal": [22.9868, 87.8550],
  "Delhi": [28.7041, 77.1025],
  "Jammu and Kashmir": [33.7782, 76.5762],
  "Ladakh": [34.1526, 77.5771],
  "default": [20.5937, 78.9629] 
};

export default function MapComponent({ stateName, name, destinations = null }) {
    const defaultPos = STATE_COORDINATES["default"];
    
    // Determine the center. If viewing a specific state, center there. Otherwise center on India.
    const centerPosition = stateName ? (STATE_COORDINATES[stateName] || defaultPos) : defaultPos;
    const zoomLevel = stateName ? 6 : 4;

    return (
        <div className="h-[500px] w-full rounded-[3rem] overflow-hidden border border-border-custom shadow-2xl relative z-0">
            <MapContainer center={centerPosition} zoom={zoomLevel} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                {/* Dark CartoDB Base Map */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {/* If multiple destinations are provided, map over them */}
                {destinations ? (
                     destinations.map(dest => {
                          const pos = STATE_COORDINATES[dest.state] || defaultPos;
                          // Standardize marker position variation so they don't exactly overlap
                          const offset = (Math.random() - 0.5) * 0.5;
                          const dynamicPos = [pos[0] + offset, pos[1] + offset];
                          
                          return (
                              <Marker key={dest._id} position={dynamicPos} icon={customIcon}>
                                  <Popup className="text-center font-sans tracking-tight">
                                      <div className="space-y-1 py-1">
                                           <span className="uppercase tracking-[0.3em] font-black text-[10px] text-gray-500 block">Expedition Node</span>
                                           <span className="text-sm font-black italic uppercase leading-none block">{dest.name}</span>
                                           <Link href={`/packages/${dest._id}`} className="block mt-2 text-[10px] uppercase font-bold text-primary hover:underline">View Intel</Link>
                                      </div>
                                  </Popup>
                              </Marker>
                          )
                     })
                ) : (
                     <Marker position={centerPosition} icon={customIcon}>
                         <Popup className="text-center font-sans tracking-tight">
                             <div className="space-y-1 py-1">
                                  <span className="uppercase tracking-[0.3em] font-black text-[10px] text-gray-500 block">Expedition Node</span>
                                  <span className="text-sm font-black italic uppercase leading-none block">{name}</span>
                             </div>
                         </Popup>
                     </Marker>
                )}
            </MapContainer>
            
            {/* Overlay Gradient for cinematic fade */}
            <div className="absolute inset-0 border-[6px] border-background/20 rounded-[3rem] pointer-events-none z-[1000]" />
        </div>
    );
}
