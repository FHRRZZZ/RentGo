import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

export default function PageTransition() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getCleanPath = (url) => {
            if (!url) return '';
            try {
                if (typeof url === 'string') {
                    return new URL(url, window.location.origin).pathname;
                }
                if (url.pathname) return url.pathname;
            } catch {
                return String(url).split('?')[0].split('#')[0];
            }
            return '';
        };

        const handleStart = (event) => {
            const currentPath = window.location.pathname;
            const targetPath = getCleanPath(event?.detail?.visit?.url);

            if (currentPath === targetPath) {
                return;
            }

            setLoading(true);
        };

        const handleFinish = () => setLoading(false);

        const removeStart = router.on('start', handleStart);
        const removeFinish = router.on('finish', handleFinish);

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    if (!loading) return null;

    return (
        <div className="rentgo-loading-screen" role="status" aria-live="polite">
            <div className="rentgo-loader-content">
                <div className="rentgo-loader-road"><span className="rentgo-loader-road-line" /></div>
                <div className="rentgo-loader-car" aria-hidden="true">
                    <span className="rentgo-loader-car-body" />
                    <span className="rentgo-loader-wheel rentgo-loader-wheel-front" />
                    <span className="rentgo-loader-wheel rentgo-loader-wheel-back" />
                </div>
                <p className="rentgo-loader-label">Menyiapkan perjalanan<span className="rentgo-loader-dots">...</span></p>
            </div>
        </div>
    );
}
