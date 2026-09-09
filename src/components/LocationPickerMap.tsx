'use client';

import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin, Sparkles } from 'lucide-react';

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({
  initialLat,
  initialLng,
  onLocationSelect,
}: LocationPickerProps) {
  const [L, setL] = useState<any>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: initialLat || -2.5489,
    lng: initialLng || 118.0149,
  });

  useEffect(() => {
    import('leaflet').then((leafletModule) => {
      setL(leafletModule.default);
    });
  }, []);

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  if (!L) {
    return (
      <div className="w-full h-56 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-xs font-bold">
        Memuat Peta Pemilih Pinpoint...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, useMapEvents } = require('react-leaflet');

  const customPinIcon = L.divIcon({
    className: 'custom-picker-pin',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-[#F26522] opacity-40 animate-ping"></span>
        <div class="w-7 h-7 rounded-full bg-[#F26522] border-2 border-white shadow-xl flex items-center justify-center text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  function MapClickHandler() {
    useMapEvents({
      click(e: any) {
        const newLat = Number(e.latlng.lat.toFixed(5));
        const newLng = Number(e.latlng.lng.toFixed(5));
        setPosition({ lat: newLat, lng: newLng });
        onLocationSelect(newLat, newLng);
      },
    });
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] gap-2">
        <span className="font-extrabold text-gray-700 flex items-center gap-1 min-w-0 truncate">
          <MapPin size={13} className="text-[#F26522] shrink-0" />
          <span className="truncate">Klik Peta Untuk Menentukan Titik Wilayah</span>
        </span>
        <span className="font-mono text-[11px] text-[#F26522] font-extrabold shrink-0">
          {position.lat}, {position.lng}
        </span>
      </div>

      <div className="w-full h-56 rounded-2xl overflow-hidden relative border border-gray-200 shadow-inner bg-white [&_.leaflet-control-attribution]:hidden">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={initialLat ? 6 : 5}
          minZoom={4}
          maxZoom={12}
          zoomSnap={0.25}
          zoomDelta={0.25}
          wheelPxPerZoomLevel={120}
          zoomControl={true}
          attributionControl={false}
          className="w-full h-full z-0"
        >
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openfreemap.org">OpenStreetMap</a>'
            maxZoom={19}
          />
          <MapClickHandler />
          <Marker position={[position.lat, position.lng]} icon={customPinIcon} />
        </MapContainer>
      </div>
      <p className="text-[10px] text-gray-400">
        * Admin dapat mengeklik posisi pulau di peta untuk menentukan koordinat presisi pin marker.
      </p>
    </div>
  );
}
