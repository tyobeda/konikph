'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useData } from '@/context/DataContext';
import { MapPin, Users, ImageIcon, Download, Sparkles } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Predefined Coordinates for Indonesian Provinces / Wilayah
const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Aceh': { lat: 4.6951, lng: 96.7494 },
  'Sumatra Utara': { lat: 2.1154, lng: 99.5451 },
  'Sumatera Utara': { lat: 2.1154, lng: 99.5451 },
  'Sumatra Barat': { lat: -0.7399, lng: 100.8000 },
  'Sumatera Barat': { lat: -0.7399, lng: 100.8000 },
  'Riau': { lat: 0.5071, lng: 101.4478 },
  'Kepulauan Riau': { lat: 3.9456, lng: 108.1428 },
  'Jambi': { lat: -1.4852, lng: 102.4381 },
  'Sumatra Selatan': { lat: -3.3199, lng: 104.9147 },
  'Sumatera Selatan': { lat: -3.3199, lng: 104.9147 },
  'Bangka Belitung': { lat: -2.7411, lng: 106.4406 },
  'Bengkulu': { lat: -3.5778, lng: 102.3464 },
  'Lampung': { lat: -4.5586, lng: 105.4068 },
  'DKI Jakarta': { lat: -6.2088, lng: 106.8456 },
  'Jawa Barat': { lat: -6.9175, lng: 107.6191 },
  'Banten': { lat: -6.4058, lng: 106.0640 },
  'Jawa Tengah': { lat: -7.1510, lng: 110.1403 },
  'DI Yogyakarta': { lat: -7.7956, lng: 110.3695 },
  'Jawa Timur': { lat: -7.5360, lng: 112.2384 },
  'Bali': { lat: -8.4095, lng: 115.1889 },
  'Nusa Tenggara Barat': { lat: -8.6529, lng: 117.3616 },
  'Nusa Tenggara Timur': { lat: -8.6574, lng: 121.0794 },
  'Kalimantan Barat': { lat: -0.2787, lng: 111.4753 },
  'Kalimantan Tengah': { lat: -1.6815, lng: 113.3824 },
  'Kalimantan Selatan': { lat: -3.0926, lng: 115.2838 },
  'Kalimantan Timur': { lat: 0.5387, lng: 116.4194 },
  'Kalimantan Utara': { lat: 3.0731, lng: 116.0414 },
  'Sulawesi Utara': { lat: 0.6247, lng: 123.9750 },
  'Gorontalo': { lat: 0.6999, lng: 122.4467 },
  'Sulawesi Tengah': { lat: -1.4300, lng: 121.4456 },
  'Sulawesi Barat': { lat: -2.8441, lng: 119.2321 },
  'Sulawesi Selatan': { lat: -3.6687, lng: 119.9741 },
  'Sulawesi Tenggara': { lat: -4.1449, lng: 122.1746 },
  'Maluku': { lat: -3.2385, lng: 130.1453 },
  'Maluku Utara': { lat: 1.5709, lng: 127.8087 },
  'Papua Barat': { lat: -1.3361, lng: 133.1747 },
  'Papua': { lat: -4.2699, lng: 138.0804 },
};

// Helper function to resolve coordinates from name
function getCoordinatesForDpw(name: string) {
  const normalized = name.replace(/^DPW\s+/i, '').replace(/^PKS\s+/i, '').trim();
  if (PROVINCE_COORDINATES[normalized]) {
    return PROVINCE_COORDINATES[normalized];
  }
  // Try fuzzy matching
  const matchKey = Object.keys(PROVINCE_COORDINATES).find(
    (key) => key.toLowerCase().includes(normalized.toLowerCase()) || normalized.toLowerCase().includes(key.toLowerCase())
  );
  if (matchKey) {
    return PROVINCE_COORDINATES[matchKey];
  }
  // Default center Jakarta if unknown
  return { lat: -2.5489, lng: 118.0149 };
}

// Inner Leaflet Component to run strictly on Client
function LeafletMapInner() {
  const { dpwList, users, artworks } = useData();
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((leafletModule) => {
      setL(leafletModule.default);
    });
  }, []);

  if (!L) {
    return (
      <div className="w-full h-80 bg-slate-900 rounded-3xl flex items-center justify-center text-white/50 text-xs font-bold">
        Memuat Peta Persebaran Indonesia...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, ZoomControl } = require('react-leaflet');

  // Custom Glowing Leaflet Icon
  const createCustomIcon = (activeCreators: number) => {
    const size = activeCreators > 5 ? 'w-6 h-6' : 'w-5 h-5';
    const bg = activeCreators > 5 ? 'bg-[#F26522]' : 'bg-amber-500';
    
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full ${bg} opacity-40 animate-ping"></span>
          <div class="${size} rounded-full ${bg} border-2 border-white shadow-lg flex items-center justify-center text-[9px] font-black text-white">
            ${activeCreators || 1}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className="w-full h-[360px] sm:h-[400px] rounded-3xl overflow-hidden relative shadow-sm border border-gray-200 bg-white [&_.leaflet-control-attribution]:hidden">
      
      {/* Overlay Badge Top Left */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md text-gray-900 px-4 py-2.5 rounded-2xl border border-gray-200 shadow-md flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#F26522] animate-pulse" />
        <div>
          <h4 className="text-xs font-black tracking-wide text-gray-900 flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#F26522]" />
            <span>Peta Persebaran Wilayah PKSart</span>
          </h4>
          <p className="text-[10px] text-gray-500 font-medium">
            {dpwList.length} Wilayah Official • Real-Time Dynamic Pinpoint
          </p>
        </div>
      </div>

      <MapContainer
        center={[-2.5489, 118.0149]} // Center Indonesia
        zoom={5}
        minZoom={4}
        maxZoom={10}
        zoomSnap={0.25}
        zoomDelta={0.25}
        wheelPxPerZoomLevel={120}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        className="w-full h-full z-0 bg-white"
      >
        {/* Zoom Control Positioned Top Right */}
        <ZoomControl position="topright" />

        {/* CARTO Positron Light Basemap */}
        <TileLayer
          url={`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${
            process.env.NEXT_PUBLIC_CARTO_API_KEY ? `?key=${process.env.NEXT_PUBLIC_CARTO_API_KEY}` : ''
          }`}
          subdomains="abcd"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        {dpwList.map((dpw) => {
          const fallbackCoords = getCoordinatesForDpw(dpw.name);
          const coords = {
            lat: dpw.lat !== undefined && dpw.lat !== null ? dpw.lat : fallbackCoords.lat,
            lng: dpw.lng !== undefined && dpw.lng !== null ? dpw.lng : fallbackCoords.lng,
          };
          const regionNameClean = dpw.name.replace(/^DPW\s+/i, '').replace(/^PKS\s+/i, '').trim();

          // Calculate real stats for this Wilayah
          const creatorsInRegion = users.filter(
            (u) => u.region?.toLowerCase().includes(regionNameClean.toLowerCase())
          ).length;

          const artworksInRegion = artworks.filter(
            (a) => a.region?.toLowerCase().includes(regionNameClean.toLowerCase())
          ).length;

          const totalDownloadsInRegion = artworks
            .filter((a) => a.region?.toLowerCase().includes(regionNameClean.toLowerCase()))
            .reduce((acc, c) => acc + (c.downloadsCount || 0), 0);

          return (
            <Marker
              key={dpw.id}
              position={[coords.lat, coords.lng]}
              icon={createCustomIcon(creatorsInRegion || dpw.activeCreators || 1)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2.5 w-44 font-sans text-center">
                  <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 mb-2 truncate">
                    {dpw.name.replace(/^DPW\s+/i, '')}
                  </h4>

                  <div className="grid grid-cols-3 gap-1 bg-gray-50 p-2 rounded-xl text-center border border-gray-100 items-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users size={13} className="text-blue-500 mb-0.5" />
                      <p className="text-xs font-black text-gray-900">
                        {creatorsInRegion || dpw.activeCreators || 0}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center border-x border-gray-200">
                      <ImageIcon size={13} className="text-[#F26522] mb-0.5" />
                      <p className="text-xs font-black text-gray-900">
                        {artworksInRegion || dpw.totalArtworks || 0}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <Download size={13} className="text-emerald-600 mb-0.5" />
                      <p className="text-xs font-black text-gray-900">
                        {totalDownloadsInRegion}
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// Client-only Export Component
export default function IndonesiaMapSection() {
  return <LeafletMapInner />;
}
