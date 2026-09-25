'use client';

import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

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

  const defaultLat = -2.5489;
  const defaultLng = 118.0149;

  const validLat = initialLat !== null && initialLat !== undefined && !isNaN(initialLat) ? initialLat : defaultLat;
  const validLng = initialLng !== null && initialLng !== undefined && !isNaN(initialLng) ? initialLng : defaultLng;

  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: validLat,
    lng: validLng,
  });

  useEffect(() => {
    import('leaflet').then((leafletModule) => {
      setL(leafletModule.default);
    });
  }, []);

  useEffect(() => {
    if (initialLat !== null && initialLat !== undefined && !isNaN(initialLat) &&
        initialLng !== null && initialLng !== undefined && !isNaN(initialLng)) {
      setPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  if (!L) {
    return (
      <div className="w-full h-56 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 text-xs font-bold animate-pulse">
        Memuat Peta Pemilih Pinpoint...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, useMapEvents, useMap } = require('react-leaflet');

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

  function MapController({ center, isSpecificLocation }: { center: [number, number]; isSpecificLocation: boolean }) {
    const map = useMap();
    const initializedRef = React.useRef(false);

    useEffect(() => {
      if (center && !isNaN(center[0]) && !isNaN(center[1])) {
        if (!initializedRef.current) {
          initializedRef.current = true;
          const targetZoom = isSpecificLocation ? 8 : 5;
          map.setView(center, targetZoom, { animate: false });
        } else {
          const currentZoom = map.getZoom();
          const targetZoom = isSpecificLocation && currentZoom < 7 ? 7 : currentZoom;
          if (targetZoom !== currentZoom) {
            map.setView(center, targetZoom, { animate: true });
          } else {
            map.panTo(center, { animate: true });
          }
        }
      }
    }, [center[0], center[1], isSpecificLocation, map]);
    return null;
  }

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

  const isSpecific = Math.abs(position.lat - defaultLat) > 0.001 || Math.abs(position.lng - defaultLng) > 0.001;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] gap-2">
        <span className="font-extrabold text-gray-700 dark:text-gray-300 flex items-center gap-1 min-w-0 truncate">
          <MapPin size={13} className="text-[#F26522] shrink-0" />
          <span className="truncate">Klik Peta Untuk Menentukan Titik Koordinat</span>
        </span>
        <span className="font-mono text-[11px] text-[#F26522] font-extrabold shrink-0 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800/40">
          {position.lat}, {position.lng}
        </span>
      </div>

      <div className="w-full h-56 rounded-2xl overflow-hidden relative border border-gray-200 dark:border-gray-700 shadow-inner bg-white dark:bg-gray-800 [&_.leaflet-control-attribution]:hidden">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={isSpecific ? 7 : 5}
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
            url={`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${
              process.env.NEXT_PUBLIC_CARTO_API_KEY ? `?key=${process.env.NEXT_PUBLIC_CARTO_API_KEY}` : ''
            }`}
            subdomains="abcd"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
          />
          <MapController center={[position.lat, position.lng]} isSpecificLocation={isSpecific} />
          <MapClickHandler />
          <Marker position={[position.lat, position.lng]} icon={customPinIcon} />
        </MapContainer>
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        * Klik pada peta untuk memindahkan pin marker ke koordinat kantor sekretariat wilayah.
      </p>
    </div>
  );
}
