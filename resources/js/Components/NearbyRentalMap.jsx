import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

const RENTAL_HUBS = [
    {
        id: 'jkt-1',
        kode: 'HUB-CGK01',
        nama: 'Bandara Soekarno-Hatta (CGK)',
        kota: 'Jakarta',
        lat: -6.1275,
        lng: 106.6537,
        alamat: 'Gedung Parkir Terminal 2 & 3 Domestik',
        mobilTersedia: 14,
        motorTersedia: 8,
        hargaMulai: 300000,
        layanan: 'Layanan 24 Jam & Antar Terminal',
    },
    {
        id: 'jkt-2',
        kode: 'HUB-JKT02',
        nama: 'Jakarta Selatan (Kemang)',
        kota: 'Jakarta',
        lat: -6.2615,
        lng: 106.8106,
        alamat: 'Jl. Kemang Raya No. 45, Bangka',
        mobilTersedia: 18,
        motorTersedia: 12,
        hargaMulai: 350000,
        layanan: 'Lepas Kunci & Antar Hotel',
    },
    {
        id: 'bdg-1',
        kode: 'HUB-BDG01',
        nama: 'Stasiun Hall Bandung',
        kota: 'Bandung',
        lat: -6.9147,
        lng: 107.6025,
        alamat: 'Drop Zone Pintu Utara Stasiun Bandung',
        mobilTersedia: 10,
        motorTersedia: 15,
        hargaMulai: 90000,
        layanan: 'Siap Pakai Khusus Turis & Liburan',
    },
    {
        id: 'jog-1',
        kode: 'HUB-JOG01',
        nama: 'Tugu & Stasiun Yogyakarta',
        kota: 'Yogyakarta',
        lat: -7.7828,
        lng: 110.3671,
        alamat: 'Kawasan Stasiun Tugu, Malioboro',
        mobilTersedia: 12,
        motorTersedia: 20,
        hargaMulai: 80000,
        layanan: 'Sewa Motor Matic & Mobil Wisata',
    },
    {
        id: 'bali-1',
        kode: 'HUB-DPS01',
        nama: 'Bandara I Gusti Ngurah Rai (DPS)',
        kota: 'Bali',
        lat: -8.7467,
        lng: 115.1668,
        alamat: 'Pick Up Zone Kedatangan Domestik Bali',
        mobilTersedia: 25,
        motorTersedia: 30,
        hargaMulai: 110000,
        layanan: 'Free Antar Kuta, Seminyak & Airport',
    },
    {
        id: 'sby-1',
        kode: 'HUB-SUB01',
        nama: 'Surabaya Pusat (Gubeng)',
        kota: 'Surabaya',
        lat: -7.2654,
        lng: 112.7521,
        alamat: 'Jl. Gubeng Pojok No. 12, Genteng',
        mobilTersedia: 11,
        motorTersedia: 9,
        hargaMulai: 350000,
        layanan: 'Mobil Perjalanan Dinas & Keluarga',
    },
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

export default function NearbyRentalMap({ selectedCity = 'Semua Kota' }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const userMarkerRef = useRef(null);

    const [geoStatus, setGeoStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [selectedHub, setSelectedHub] = useState(RENTAL_HUBS[0]);
    const [hubsWithDistance, setHubsWithDistance] = useState(RENTAL_HUBS);
    const [filterKota, setFilterKota] = useState('Semua');

    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        // Inisialisasi Map
        const map = L.map(mapContainerRef.current, {
            center: [-6.2088, 106.8456],
            zoom: 11,
            zoomControl: false,
            attributionControl: false,
        });

        // Kontrol zoom di pojok kanan atas
        L.control.zoom({ position: 'topright' }).addTo(map);

        // OpenStreetMap Standard Tiles: Bebas watermark, teks jalanan jelas dan tajam
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;

        renderHubPins(RENTAL_HUBS, map, markersLayer, RENTAL_HUBS[0].id);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    const renderHubPins = (hubs, map, layer, activeHubId) => {
        if (!layer) return;
        layer.clearLayers();

        hubs.forEach((hub) => {
            const isActive = hub.id === activeHubId;
            const priceText = `Rp ${(hub.hargaMulai / 1000).toFixed(0)}rb`;

            const markerHtml = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    transform: translate(-50%, -100%);
                ">
                    <div style="
                        background: ${isActive ? '#111111' : '#FFFFFF'};
                        color: ${isActive ? '#F5B800' : '#111111'};
                        border: 2px solid ${isActive ? '#111111' : '#333333'};
                        padding: 3px 8px;
                        border-radius: 2px;
                        font-size: 11px;
                        font-weight: 800;
                        letter-spacing: 0.02em;
                        white-space: nowrap;
                        box-shadow: 0 3px 8px rgba(0,0,0,0.25);
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    ">
                        <span style="
                            display: inline-block;
                            width: 6px;
                            height: 6px;
                            border-radius: 1px;
                            background: ${isActive ? '#F5B800' : '#111111'};
                        "></span>
                        <span>${priceText}</span>
                    </div>
                    <div style="
                        width: 0;
                        height: 0;
                        border-left: 5px solid transparent;
                        border-right: 5px solid transparent;
                        border-top: 6px solid ${isActive ? '#111111' : '#333333'};
                    "></div>
                </div>
            `;

            const icon = L.divIcon({
                className: 'rentgo-pin-marker',
                html: markerHtml,
                iconSize: [0, 0],
            });

            const marker = L.marker([hub.lat, hub.lng], { icon }).addTo(layer);
            marker.on('click', () => {
                setSelectedHub(hub);
                renderHubPins(hubs, map, layer, hub.id);
            });
        });
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) return;

        setGeoStatus('loading');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setGeoStatus('success');

                const map = mapInstanceRef.current;
                if (map) {
                    map.flyTo([latitude, longitude], 13, { duration: 1.2 });

                    if (userMarkerRef.current) {
                        userMarkerRef.current.setLatLng([latitude, longitude]);
                    } else {
                        const userIcon = L.divIcon({
                            className: 'rentgo-radar-user',
                            html: `
                                <div style="
                                    position: relative;
                                    width: 18px;
                                    height: 18px;
                                    transform: translate(-50%, -50%);
                                ">
                                    <div style="
                                        position: absolute;
                                        inset: -5px;
                                        border-radius: 9999px;
                                        background: #111111;
                                        opacity: 0.25;
                                        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                                    "></div>
                                    <div style="
                                        width: 18px;
                                        height: 18px;
                                        border-radius: 9999px;
                                        background: #111111;
                                        border: 2px solid #F5B800;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                    ">
                                        <div style="width: 5px; height: 5px; border-radius: 9999px; background: #F5B800;"></div>
                                    </div>
                                </div>
                            `,
                            iconSize: [0, 0],
                        });

                        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
                    }

                    const sorted = RENTAL_HUBS.map((hub) => {
                        const dist = calculateDistanceKm(latitude, longitude, hub.lat, hub.lng);
                        return { ...hub, distance: parseFloat(dist) };
                    }).sort((a, b) => a.distance - b.distance);

                    setHubsWithDistance(sorted);
                    setSelectedHub(sorted[0]);
                    renderHubPins(sorted, map, markersLayerRef.current, sorted[0].id);
                }
            },
            () => {
                setGeoStatus('error');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleSelectHub = (hub) => {
        setSelectedHub(hub);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([hub.lat, hub.lng], 14, { duration: 1 });
            renderHubPins(hubsWithDistance, mapInstanceRef.current, markersLayerRef.current, hub.id);
        }
    };

    const filteredHubs = filterKota === 'Semua'
        ? hubsWithDistance
        : hubsWithDistance.filter((h) => h.kota === filterKota);

    return (
        <div>
            {/* Header Section: Mengikuti Struktur Asli Welcome.jsx */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                    <span className="text-xs font-bold text-[#F5B800] bg-[#111111] px-2 py-0.5 rounded-xs inline-block mb-1">
                        TITIK PENJEMPUTAN
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#111111]">
                        Titik Armada di Sekitar Anda
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                        Pilih kota penjemputan atau deteksi lokasi untuk melihat titik serah terima kendaraan terdekat.
                    </p>
                </div>

                {/* Filter Kota & Tombol GPS — Bersatu dengan Gaya Tombol Welcome.jsx */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {['Semua', 'Jakarta', 'Bandung', 'Yogyakarta', 'Bali'].map((city) => (
                        <button
                            key={city}
                            type="button"
                            onClick={() => {
                                setFilterKota(city);
                                const targetHub = city === 'Semua'
                                    ? hubsWithDistance[0]
                                    : hubsWithDistance.find((h) => h.kota === city);
                                if (targetHub) handleSelectHub(targetHub);
                            }}
                            className={`text-xs font-bold px-3 py-1.5 rounded-sm border transition-colors whitespace-nowrap ${
                                filterKota === city
                                    ? 'bg-[#111111] text-[#F5B800] border-[#111111]'
                                    : 'bg-white text-stone-700 border-stone-300 hover:border-black'
                            }`}
                        >
                            {city}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={geoStatus === 'loading'}
                        className="text-xs font-bold px-3 py-1.5 rounded-sm bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] border border-[#F5B800] transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span>{geoStatus === 'loading' ? 'Mencari...' : 'Gunakan GPS'}</span>
                    </button>
                </div>
            </div>

            {/* Container Peta & Daftar Hub: Kotak Bersih Tanpa Header Berulang */}
            <div className="border border-stone-200 bg-white rounded-sm overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
                {/* Kolom Peta OpenStreetMap Bebas Watermark */}
                <div className="lg:col-span-8 relative border-b lg:border-b-0 lg:border-r border-stone-200">
                    <div
                        ref={mapContainerRef}
                        className="w-full h-[360px] sm:h-[440px]"
                        style={{ background: '#eef0f2' }}
                    />

                    {/* Badge Lokasi Terpilih di Sudut Peta */}
                    <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-stone-300 px-3 py-2 rounded-sm shadow-sm text-xs max-w-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            <span>{selectedHub.nama}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{selectedHub.alamat}</p>
                    </div>

                    {/* Indikator GPS Ringkas jika Aktif */}
                    {geoStatus === 'success' && (
                        <div className="absolute top-3 left-3 z-10 bg-[#111111] text-[#F5B800] px-2.5 py-1 rounded-sm text-[11px] font-bold shadow-sm">
                            GPS Aktif &bull; Jarak Terdekat: {hubsWithDistance[0]?.distance || '0'} km
                        </div>
                    )}
                </div>

                {/* Kolom Daftar Titik Penjemputan */}
                <div className="lg:col-span-4 p-4 bg-stone-50/50 flex flex-col justify-between max-h-[440px] overflow-y-auto">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                                Titik Penjemputan
                            </span>
                            <span className="text-[10px] font-bold text-stone-400">
                                {filteredHubs.length} Lokasi
                            </span>
                        </div>

                        <div className="space-y-2">
                            {filteredHubs.map((hub) => {
                                const isSelected = selectedHub.id === hub.id;
                                return (
                                    <div
                                        key={hub.id}
                                        onClick={() => handleSelectHub(hub)}
                                        className={`p-3 rounded-sm border cursor-pointer transition-all text-left ${
                                            isSelected
                                                ? 'border-[#111111] bg-white ring-1 ring-[#111111] shadow-xs'
                                                : 'border-stone-200 hover:border-stone-400 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="text-[10px] font-mono text-stone-400 block mb-0.5">
                                                    {hub.kode} &bull; {hub.kota}
                                                </span>
                                                <h4 className="text-xs font-bold text-[#111111] leading-tight">
                                                    {hub.nama}
                                                </h4>
                                            </div>
                                            {hub.distance !== undefined && (
                                                <span className="text-[10px] font-bold bg-[#F5B800] text-[#111111] px-1.5 py-0.5 rounded-xs shrink-0">
                                                    {hub.distance} km
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                                            {hub.alamat}
                                        </p>

                                        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                                            <span className="text-stone-600 font-medium">
                                                {hub.mobilTersedia} Mobil &bull; {hub.motorTersedia} Motor
                                            </span>
                                            <span className="text-[#111111] font-bold">
                                                Mulai Rp {(hub.hargaMulai / 1000).toFixed(0)}rb
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="pt-4 border-t border-stone-200 mt-3">
                        <a
                            href="#armada-mobil"
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] font-bold text-xs p-2.5 rounded-sm uppercase tracking-wider transition-colors text-center"
                        >
                            <span>Pilih Armada di {selectedHub.kota}</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
