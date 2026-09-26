import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";

/**
 * LocationPicker — peta pemilih titik lokasi usaha mitra (Leaflet + OpenStreetMap).
 *
 * Fitur:
 *  - Klik peta atau geser pin untuk menetapkan titik presisi.
 *  - Tombol "Gunakan GPS" memakai geolokasi perangkat (navigator.geolocation).
 *  - Kotak pencarian alamat (geocoding Nominatim, gratis) & reverse-geocode
 *    yang otomatis mengisi kolom alamat/kota/provinsi saat titik dipilih.
 *  - Callback onChange mengirim { latitude, longitude, address, city, province }.
 *
 * Tidak butuh API key karena memakai tile OSM + layanan Nominatim publik.
 */
const DEFAULT_CENTER = [-6.2088, 106.8456]; // Jakarta

const PIN_HTML = `
    <div style="position: relative; transform: translate(-50%, -100%);">
        <div style="
            width: 30px; height: 30px; border-radius: 9999px 9999px 9999px 0;
            background: #111; border: 3px solid #F5B800;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            display: flex; align-items: center; justify-content: center;
        ">
            <div style="width: 8px; height: 8px; border-radius: 9999px; background: #F5B800;"></div>
        </div>
    </div>
`;

export default function LocationPicker({
    latitude = null,
    longitude = null,
    address = "",
    city = "",
    onPick,
    height = 320,
    hintText = "Klik pada peta untuk menandai titik lokasi usaha",
    footerText = "Titik ini jadi lokasi pin mitra Anda pada peta pencarian unit.",
}) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const reverseTimerRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [locating, setLocating] = useState(false);
    const [status, setStatus] = useState("");
    const [showHint, setShowHint] = useState(!latitude || !longitude);

    const hasCoord =
        latitude !== null &&
        longitude !== null &&
        !Number.isNaN(Number(latitude)) &&
        !Number.isNaN(Number(longitude));

    /** Reverse geocode: koordinat → alamat (Nominatim). */
    const reverseGeocode = (lat, lng) => {
        setStatus("Mengisi alamat otomatis...");
        fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id`,
        )
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data) {
                    setStatus("");
                    return;
                }
                const a = data.address || {};
                const streetParts = [
                    a.road,
                    a.neighbourhood || a.hamlet || a.village || a.suburb,
                    a.city_district || a.district,
                ].filter(Boolean);
                const fullAddress =
                    streetParts.length > 0
                        ? streetParts.join(", ")
                        : data.display_name || "";
                const resolvedCity =
                    a.city ||
                    a.town ||
                    a.municipality ||
                    a.village ||
                    a.county ||
                    "";
                const resolvedProvince = a.state || a.region || "";

                onPick?.({
                    latitude: lat,
                    longitude: lng,
                    address: fullAddress,
                    city: resolvedCity,
                    province: resolvedProvince,
                });
                setStatus(
                    "Alamat terisi otomatis. Silakan periksa & lengkapi bila perlu.",
                );
            })
            .catch(() => setStatus(""));
    };

    const scheduleReverse = (lat, lng) => {
        if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
        reverseTimerRef.current = setTimeout(
            () => reverseGeocode(lat, lng),
            450,
        );
    };

    /** Tetapkan titik + update marker + reverse geocode. */
    const setPoint = (lat, lng, { geocode = true } = {}) => {
        const map = mapRef.current;
        if (map) {
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                const icon = L.divIcon({
                    className: "rentgo-location-pin",
                    html: PIN_HTML,
                    iconSize: [0, 0],
                });
                markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
            }
        }
        setShowHint(false);
        onPick?.({ latitude: lat, longitude: lng });
        if (geocode) scheduleReverse(lat, lng);
    };

    // Inisialisasi peta sekali.
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const start = hasCoord
            ? [Number(latitude), Number(longitude)]
            : DEFAULT_CENTER;

        const map = L.map(containerRef.current, {
            center: start,
            zoom: hasCoord ? 16 : 12,
            zoomControl: true,
            attributionControl: false,
        });

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
        }).addTo(map);

        map.on("click", (e) => {
            setPoint(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;

        if (hasCoord) {
            const icon = L.divIcon({
                className: "rentgo-location-pin",
                html: PIN_HTML,
                iconSize: [0, 0],
            });
            markerRef.current = L.marker(
                [Number(latitude), Number(longitude)],
                {
                    icon,
                },
            ).addTo(map);
        }

        // Leaflet butuh invalidateSize bila container baru muncul.
        setTimeout(() => map.invalidateSize(), 200);

        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setStatus("Perangkat/browser tidak mendukung geolokasi.");
            return;
        }
        setLocating(true);
        setStatus("Mendeteksi lokasi...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                setLocating(false);
                mapRef.current?.flyTo([lat, lng], 17, { duration: 1 });
                setPoint(lat, lng);
            },
            () => {
                setLocating(false);
                setStatus(
                    "Gagal mendeteksi lokasi. Berikan izin lokasi atau pilih manual di peta.",
                );
            },
            { enableHighAccuracy: true, timeout: 9000 },
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        setSearching(true);
        setStatus("Mencari alamat...");

        const query = /\d{5}/.test(q) ? q : `${q}, Indonesia`;
        fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=id&countrycodes=id&q=${encodeURIComponent(query)}`,
        )
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                setSearching(false);
                if (!data || data.length === 0) {
                    setStatus(
                        "Alamat tidak ditemukan. Coba kata kunci lain atau pilih langsung di peta.",
                    );
                    return;
                }
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                mapRef.current?.flyTo([lat, lng], 16, { duration: 1 });
                setPoint(lat, lng, { geocode: false });
                reverseGeocode(lat, lng);
            })
            .catch(() => {
                setSearching(false);
                setStatus("Gagal mencari alamat. Pilih langsung di peta.");
            });
    };

    return (
        <div className="rounded-sm border-stone-300 bg-white overflow-hidden">
            {/* Toolbar pencarian & GPS */}
            <div className="flex flex-col sm:flex-row gap-2 p-2.5 border-b border-stone-200 bg-stone-50">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari alamat / nama tempat (mis. Jl. Dago, Bandung)"
                        className="flex-1 text-xs bg-white border-stone-300 rounded-sm px-3 py-2 focus:border-[#111] outline-none"
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        className="text-xs font-semibold bg-[#111] text-[#F5B800] px-3 py-2 rounded-sm hover:bg-black transition-colors disabled:opacity-50 shrink-0"
                    >
                        {searching ? "Mencari..." : "Cari"}
                    </button>
                </form>
                <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locating}
                    className="text-xs font-bold bg-[#F5B800] hover:bg-[#e0a800] text-[#111] px-3 py-2 rounded-sm border-[#F5B800] transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5"
                >
                    <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                    </svg>
                    {locating ? "Melacak..." : "Gunakan GPS"}
                </button>
            </div>

            {/* Peta */}
            <div className="relative">
                <div
                    ref={containerRef}
                    style={{ height, background: "#eef0f2" }}
                    className="w-full"
                />
                {showHint && (
                    <div className="pointer-events-none absolute inset-x-0 top-2 mx-auto w-max max-w-[90%] bg-[#111] text-[#F5B800] text-[11px] font-semibold px-3 py-1.5 rounded-sm shadow-md">
                        {hintText}
                    </div>
                )}
            </div>

            {/* Footer status & koordinat */}
            <div className="p-2.5 border-t border-stone-200 bg-stone-50 text-[11px] text-stone-600 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-mono">
                        {hasCoord
                            ? `📍 ${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
                            : "Koordinat belum ditandai"}
                    </span>
                    {hasCoord && (
                        <span className="text-emerald-700 font-semibold shrink-0">
                            Titik tersimpan
                        </span>
                    )}
                </div>
                {address && (
                    <p className="text-stone-500 line-clamp-1">
                        <span className="font-semibold text-stone-600">
                            Alamat terdeteksi:
                        </span>{" "}
                        {address}
                        {city ? `, ${city}` : ""}
                    </p>
                )}
                {status && <p className="text-stone-500">{status}</p>}
                <p className="text-stone-400">{footerText}</p>
            </div>
        </div>
    );
}
