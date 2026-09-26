import React, { useState } from 'react';

/**
 * Komponen Avatar Pengguna RentGo.
 * Menampilkan foto profil (Google OAuth / custom) dengan:
 * - referrerPolicy="no-referrer" agar tidak diblokir oleh CDN Google (403 Forbidden)
 * - onError fallback otomatis ke badge inisial huruf jika gambar gagal dimuat
 */
export default function UserAvatar({
    user = {},
    className = 'w-7 h-7',
    textClassName = 'text-xs',
    rounded = 'rounded-full',
}) {
    const [hasError, setHasError] = useState(false);
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    if (user?.avatar && !hasError) {
        return (
            <img
                src={user.avatar}
                alt={user.name || 'Foto Profil'}
                referrerPolicy="no-referrer"
                onError={() => setHasError(true)}
                className={`${className} ${rounded} object-cover shrink-0`}
            />
        );
    }

    return (
        <div
            className={`${className} ${rounded} bg-[#111111] text-[#F5B800] font-semibold flex items-center justify-center ${textClassName} shrink-0`}
        >
            {initial}
        </div>
    );
}
