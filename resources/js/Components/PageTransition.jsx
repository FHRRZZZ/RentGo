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

        const isAuthTarget = (urlOrPath) => {
            if (!urlOrPath) return false;
            const path = getCleanPath(urlOrPath).toLowerCase().replace(/\/+$/, '');
            return (
                path === '/login' ||
                path === '/register' ||
                path.startsWith('/login') ||
                path.startsWith('/register') ||
                path.startsWith('/forgot-password') ||
                path.startsWith('/reset-password')
            );
        };

        const isAuthComponent = (component) => {
            return typeof component === 'string' && component.startsWith('Auth/');
        };

        const handleStart = (event) => {
            const currentPath = window.location.pathname;
            const targetUrl = event?.detail?.visit?.url;
            const targetPath = getCleanPath(targetUrl);

            // Jangan tampilkan loading screen di halaman login & register
            if (
                isAuthTarget(currentPath) ||
                isAuthTarget(targetPath) ||
                isAuthComponent(router.page?.component)
            ) {
                setLoading(false);
                return;
            }

            if (currentPath === targetPath) {
                return;
            }

            setLoading(true);
        };

        const handleFinish = () => setLoading(false);
        const handleNavigate = (event) => {
            const pageComponent = event?.detail?.page?.component;
            const pageUrl = event?.detail?.page?.url;
            if (isAuthTarget(pageUrl) || isAuthComponent(pageComponent)) {
                setLoading(false);
            }
        };

        const removeStart = router.on('start', handleStart);
        const removeFinish = router.on('finish', handleFinish);
        const removeNavigate = router.on('navigate', handleNavigate);

        return () => {
            removeStart();
            removeFinish();
            removeNavigate();
        };
    }, []);

    // Proteksi tambahan: jika berada di halaman login atau register, jangan pernah render loading screen
    if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
        if (
            currentPath === '/login' ||
            currentPath === '/register' ||
            currentPath.startsWith('/login') ||
            currentPath.startsWith('/register') ||
            currentPath.startsWith('/forgot-password') ||
            currentPath.startsWith('/reset-password') ||
            (router.page?.component && String(router.page.component).startsWith('Auth/'))
        ) {
            return null;
        }
    }

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
