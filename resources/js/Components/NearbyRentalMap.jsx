import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Daftar titik hub armada RentGo di berbagai kota di Indonesia
const RENTAL_HUBS = [
    {
        id: 'jkt-1',
        nama: 'RentGo Hub Soekarno-Hatta (CGK)',
        kota: 'Jakarta',
        lat: -6.1275,
        lng: 106.6537,
        alamat: 'Area Bandara Soetta Terminal 2 & 3',
        mobilTersedia: 14,
        motorTersedia: 8,
        hargaMulai: 300000,
        layanan: 'Antar Jemput Bandara & Lepas Kunci',
    },
    {
        id: 'jkt-2',
        nama: 'RentGo Hub Jakarta Selatan',
        kota: 'Jakarta',
        lat: -6.2615,
        lng: 106.8106,
        alamat: 'Jl. Kemang Raya No. 45, Jaksel',
        mobilTersedia: 18,
        motorTersedia: 12,
        hargaMulai: 350000,
        layanan: 'Lepas Kunci 24 Jam',
    },
    {
        id: 'bdg-1',
        nama: 'RentGo Hub Stasiun Bandung',
        kota: 'Bandung',
        lat: -6.9147,
        lng: 107.6025,
        alamat: 'Pintu Utara Stasiun Hall Bandung',
        mobilTersedia: 10,
        motorTersedia: 15,
        hargaMulai: 90000,
        layanan: 'Siap Pakai Turis & Wisatawan',
    },
    {
        id: 'jog-1',
        nama: 'RentGo Hub Tugu Yogyakarta',
        kota: 'Yogyakarta',
        lat: -7.7828,
        lng: 110.3671,
        alamat: 'Dekat Stasiun Tugu & Malioboro',
        mobilTersedia: 12,
        motorTersedia: 20,
        hargaMulai: 80000,
        layanan: 'Sewa Motor Harian & Mobil Wisata',
    },
    {
        id: 'bali-1',
        nama: 'RentGo Hub Ngurah Rai Bali',
        kota: 'Bali',
        lat: -8.7467,
        lng: 115.1668,
        alamat: 'Kedatangan Domestik Bandara DPS',
        mobilTersedia: 25,
        motorTersedia: 30,
        hargaMulai: 110000,
        layanan: 'Gratis Antar Kuta, Seminyak & Airport',
    },
    {
        id: 'sby-1',
        nama: 'RentGo Hub Surabaya Gubeng',
        kota: 'Surabaya',
        lat: -7.2654,
        lng: 112.7521,
        alamat: 'Jl. Gubeng Pojok No. 12',
        mobilTersedia: 11,
        motorTersedia: 9,
        hargaMulai: 350000,
        layanan: 'Mobil Dinas & Lepas Kunci',
    },
];

// Helper menghitung jarak garis lurus (Haversine formula dalam km)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam km
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

    const [userLocation, setUserLocation] = useState(null);
    const [geoStatus, setGeoStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [geoErrorMsg, setGeoErrorMsg] = useState('');
    const [selectedHub, setSelectedHub] = useState(RENTAL_HUBS[0]);
    const [hubsWithDistance, setHubsWithDistance] = useState(RENTAL_HUBS);

    // Inisialisasi Map Leaflet
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Cegah re-inisialisasi ganda
        if (mapInstanceRef.current) return;

        const defaultCenter = [-6.2088, 106.8456]; // Jakarta
        const map = L.map(mapContainerRef.current, {
            center: defaultCenter,
            zoom: 11,
            zoomControl: false,
        });

        // Zoom control di pojok kanan atas dengan style minimalis
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Tile layer CartoDB Voyager (bersih, modern, tajam, gratis)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;

        renderHubMarkers(RENTAL_HUBS, map, markersLayer);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Render Pin Markers Hub
    const renderHubMarkers = (hubs, map, layer) => {
        if (!layer) return;
        layer.clearLayers();

        hubs.forEach((hub) => {
            // Custom HTML Marker bertema RentGo
            const hubIcon = L.divIcon({
                className: 'custom-hub-marker',
                html: `
                    <div style="
                        background: #111111;
                        color: #F5B800;
                        width: 32px;
                        height: 32px;
                        border-radius: 2px;
                        border: 2px solid #F5B800;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 900;
                        font-size: 11px;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                        cursor: pointer;
                    ">
                        RG
                    </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });

            const marker = L.marker([hub.lat, hub.lng], { icon: hubIcon }).addTo(layer);

            marker.on('click', () => {
                setSelectedHub(hub);
            });

            // Popup bawaan Leaflet
            marker.bindPopup(`
                <div style="font-family: inherit; padding: 4px;">
                    <div style="font-size: 10px; font-weight: 800; color: #b38600; text-transform: uppercase;">Hub Resmi RentGo</div>
                    <div style="font-size: 13px; font-weight: 900; color: #111111; margin-top: 2px;">${hub.nama}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 4px;">${hub.alamat}</div>
                    <div style="font-size: 11px; font-weight: 700; color: #111111; margin-top: 6px;">
                        Mulai Rp ${hub.hargaMulai.toLocaleString('id-ID')} / hari
                    </div>
                </div>
            `);
        });
    };

    // Fungsi Akses Lokasi via Geolocation API Browser
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setGeoStatus('error');
            setGeoErrorMsg('Browser Anda tidak mendukung deteksi lokasi (Geolocation).');
            return;
        }

        setGeoStatus('loading');
        setGeoErrorMsg('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                setGeoStatus('success');

                const map = mapInstanceRef.current;
                if (map) {
                    // Pusatkan peta ke lokasi pengguna
                    map.flyTo([latitude, longitude], 13, { duration: 1.5 });

                    // Tambahkan atau pindahkan marker pengguna
                    if (userMarkerRef.current) {
                        userMarkerRef.current.setLatLng([latitude, longitude]);
                    } else {
                        const userIcon = L.divIcon({
                            className: 'user-pulse-marker',
                            html: `
                                <div style="position: relative; width: 24px; height: 24px;">
                                    <div style="
                                        position: absolute;
                                        inset: 0;
                                        border-radius: 9999px;
                                        background: #F5B800;
                                        opacity: 0.4;
                                        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                                    "></div>
                                    <div style="
                                        position: relative;
                                        width: 24px;
                                        height: 24px;
                                        border-radius: 9999px;
                                        background: #111111;
                                        border: 3px solid #F5B800;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                                    ">
                                        <div style="width: 6px; height: 6px; border-radius: 9999px; background: #F5B800;"></div>
                                    </div>
                                </div>
                            `,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12],
                        });

                        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
                            .addTo(map)
                            .bindPopup('<b>Lokasi Anda Saat Ini</b><br>Mencari armada terdekat...')
                            .openPopup();
                    }

                    // Buat titik armada buatan di sekitar lokasi user secara dinamis jika jauh dari hub
                    const sortedWithDistance = RENTAL_HUBS.map((hub) => {
                        const distance = calculateDistanceKm(latitude, longitude, hub.lat, hub.lng);
                        return { ...hub, distance: parseFloat(distance) };
                    }).sort((a, b) => a.distance - b.distance);

                    setHubsWithDistance(sortedWithDistance);
                    setSelectedHub(sortedWithDistance[0]);
                }
            },
            (error) => {
                setGeoStatus('error');
                if (error.code === error.PERMISSION_DENIED) {
                    setGeoErrorMsg('Izin lokasi ditolak di browser. Silakan aktifkan izin lokasi di pengaturan browser.');
                } else {
                    setGeoErrorMsg('Gagal mendapatkan koordinat GPS. Menampilkan titik armada default.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 60000,
            }
        );
    };

    // Zoom ke Hub tertentu saat diklik di list
    const handleSelectHub = (hub) => {
        setSelectedHub(hub);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([hub.lat, hub.lng], 14, { duration: 1.2 });
        }
    };

    return (
        <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
            {/* Header Sekitar Kita */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/50">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 bg-[#F5B800]"></span>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-500">
                            PETA JARINGAN &amp; LOKASI TERDEKAT
                        </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">
                        Titik Armada &amp; Hub Rental di Sekitar Kita
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                        Lihat lokasi serah terima unit, ketersediaan mobil &amp; motor, serta estimasi jarak dari posisi Anda.
                    </p>
                </div>

                {/* Tombol Akses Lokasi GPS */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={geoStatus === 'loading'}
                        className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-[#F5B800] px-4 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        <svg className={`w-4 h-4 text-[#F5B800] ${geoStatus === 'loading' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            {geoStatus === 'loading' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            )}
                        </svg>
                        <span>{geoStatus === 'loading' ? 'Mencari Lokasi...' : 'Deteksi Lokasi Saya'}</span>
                    </button>
                </div>
            </div>

            {/* Alert Status Geolocation */}
            {geoStatus === 'success' && (
                <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Lokasi Anda terdeteksi! Peta telah disesuaikan dan jarak hub diurutkan dari yang paling dekat.
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700">GPS Aktif</span>
                </div>
            )}

            {geoStatus === 'error' && (
                <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span>{geoErrorMsg}</span>
                </div>
            )}

            {/* Layout Grid: Peta + List Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Kolom Peta Interaktif Leaflet */}
                <div className="lg:col-span-8 relative border-b lg:border-b-0 lg:border-r border-stone-200">
                    <div
                        ref={mapContainerRef}
                        className="w-full h-[360px] sm:h-[440px] z-10"
                        style={{ background: '#f5f5f0' }}
                    />

                    {/* Floating Info Pill di atas peta */}
                    <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs border border-stone-200 p-2.5 rounded-sm shadow-md text-xs max-w-xs">
                        <div className="flex items-center gap-2 font-bold text-[#111111]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>{selectedHub.nama}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{selectedHub.alamat}</p>
                    </div>
                </div>

                {/* Kolom List Hub & Ketersediaan Armada */}
                <div className="lg:col-span-4 p-4 flex flex-col justify-between max-h-[440px] overflow-y-auto">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                                Titik Armada Terdekat
                            </span>
                            <span className="text-[10px] font-bold text-stone-400">
                                {hubsWithDistance.length} Lokasi
                            </span>
                        </div>

                        <div className="space-y-2">
                            {hubsWithDistance.slice(0, 4).map((hub) => (
                                <div
                                    key={hub.id}
                                    onClick={() => handleSelectHub(hub)}
                                    className={`p-3 rounded-sm border cursor-pointer transition-all text-left ${
                                        selectedHub.id === hub.id
                                            ? 'border-black bg-stone-50 ring-1 ring-black'
                                            : 'border-stone-200 hover:border-stone-400 bg-white'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="text-xs font-black text-[#111111] leading-snug">
                                            {hub.nama}
                                        </h4>
                                        {hub.distance !== undefined && (
                                            <span className="text-[10px] font-extrabold bg-[#F5B800] text-[#111111] px-1.5 py-0.5 rounded-sm shrink-0">
                                                {hub.distance} km
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">{hub.alamat}</p>

                                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-stone-700">
                                            🚗 {hub.mobilTersedia} Mobil | 🛵 {hub.motorTersedia} Motor
                                        </span>
                                        <span className="font-black text-[#111111]">
                                            Mulai Rp {hub.hargaMulai.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-stone-200 mt-3">
                        <a
                            href="#armada-mobil"
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] font-bold text-xs p-2.5 rounded-sm uppercase tracking-wider transition-colors"
                        >
                            <span>Pilih Armada di Hub Ini</span>
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
