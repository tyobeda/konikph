'use client';

import React, { useEffect, useState } from 'react';
import { useData } from '@/context/DataContext';
import { MapPin, Users, Trophy, Sparkles, Clock, PhoneCall } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Default Center: GOR Tebat Monok, Kepahiang, Bengkulu
const KEPAHIANG_CENTER: { lat: number; lng: number } = { lat: -3.6496, lng: 102.5768 };

// Inner Leaflet Component to run strictly on Client
function LeafletMapInner() {
  const { dpwList } = useData();
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((leafletModule) => {
      setL(leafletModule.default);
    });
  }, []);

  if (!L) {
    return (
      <div className="w-full h-80 bg-slate-900 rounded-3xl flex items-center justify-center text-white/50 text-xs font-bold">
        Memuat Peta Lokasi Cabor Kepahiang...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, ZoomControl } = require('react-leaflet');

  // Custom Glowing Leaflet Icon
  const createCustomIcon = (code: string) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full bg-red-600 opacity-40 animate-ping"></span>
          <div class="w-7 h-7 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-[8px] font-black text-white">
            ${code.slice(0, 3)}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className="w-full h-[360px] sm:h-[400px] rounded-3xl overflow-hidden relative shadow-sm border border-slate-200 dark:border-slate-800 bg-white [&_.leaflet-control-attribution]:hidden">
      {/* Overlay Badge Top Left */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
        <div>
          <h4 className="text-xs font-black tracking-wide flex items-center gap-1.5">
            <Sparkles size={13} className="text-red-600" />
            <span>Peta Cabang Olahraga KONI Kepahiang</span>
          </h4>
          <p className="text-[10px] text-slate-500 font-medium">
            {dpwList.length} Cabang Olahraga Binaan • GOR Tebat Monok & Fasilitas Daerah
          </p>
        </div>
      </div>

      <MapContainer
        center={[KEPAHIANG_CENTER.lat, KEPAHIANG_CENTER.lng]}
        zoom={13}
        minZoom={10}
        maxZoom={18}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        className="w-full h-full z-0 bg-white"
      >
        <ZoomControl position="topright" />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        {dpwList.map((cabor) => {
          const coords = {
            lat: cabor.lat !== undefined && cabor.lat !== null ? cabor.lat : KEPAHIANG_CENTER.lat,
            lng: cabor.lng !== undefined && cabor.lng !== null ? cabor.lng : KEPAHIANG_CENTER.lng,
          };

          return (
            <Marker
              key={cabor.id}
              position={[coords.lat, coords.lng]}
              icon={createCustomIcon(cabor.code || 'KONI')}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 w-52 font-sans text-left space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase">
                      {cabor.code}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold truncate">
                      {cabor.category || 'Olahraga'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                    {cabor.name}
                  </h4>

                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                    <p className="flex items-center gap-1 truncate">
                      <Users size={12} className="text-red-500 shrink-0" />
                      <span>{cabor.coordinator || 'Pengurus'}</span>
                    </p>
                    <p className="flex items-center gap-1 truncate">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span>{cabor.address || 'GOR Tebat Monok'}</span>
                    </p>
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

export default function IndonesiaMapSection() {
  return <LeafletMapInner />;
}
