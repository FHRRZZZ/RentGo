import React, { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

/**
 * RentGo Morph View Transition Controller
 * Memanfaatkan View Transitions API native browser untuk menghasilkan efek
 * transisi "Morph" (seperti PowerPoint Morph) saat berpindah antar halaman:
 * elemen desain lama pecah/melebur secara halus dan bertransformasi langsung
 * menjadi layout halaman yang baru tanpa layar hitam/tirai yang menutupi.
 */
export default function PageTransition() {
    const resolveTransitionRef = useRef(null);
    const transitionActiveRef = useRef(false);

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

            // 1. Abaikan jika berpindah ke halaman yang sama (misal anchor #sekitar-kita)
            if (currentPath === targetPath) {
                return;
            }

            // 2. Abaikan semua halaman login, register, dan auth
            const isAuthPage = (path) => {
                if (!path) return false;
                const clean = path.toLowerCase().replace(/\/$/, '') || '/';
                return (
                    clean === '/login' ||
                    clean === '/register' ||
                    clean.startsWith('/forgot-password') ||
                    clean.startsWith('/reset-password') ||
                    clean.startsWith('/verify-email') ||
                    clean.startsWith('/confirm-password')
                );
            };

            // Jika halaman asal atau tujuan adalah login/regis, jangan pakai transisi ini
            if (isAuthPage(currentPath) || isAuthPage(targetPath)) {
                return;
            }

            // 3. Picu animasi DOM morph-out langsung: desain lama seketika pecah, melayang & melebur
            const containers = document.querySelectorAll('.morph-page-container');
            containers.forEach((el) => {
                el.classList.add('page-morphing-out');
            });

            // 4. Jika browser mendukung View Transitions API, jalankan juga di level browser
            if (typeof document !== 'undefined' && 'startViewTransition' in document) {
                try {
                    transitionActiveRef.current = true;
                    document.startViewTransition(() => {
                        return new Promise((resolve) => {
                            resolveTransitionRef.current = resolve;
                        });
                    });

                    // Safety fallback jika navigasi memakan waktu lebih dari 1 detik
                    setTimeout(() => {
                        if (resolveTransitionRef.current) {
                            resolveTransitionRef.current();
                            resolveTransitionRef.current = null;
                            transitionActiveRef.current = false;
                        }
                    }, 1000);
                } catch (e) {
                    transitionActiveRef.current = false;
                }
            }
        };

        const handleNavigate = () => {
            if (resolveTransitionRef.current) {
                resolveTransitionRef.current();
                resolveTransitionRef.current = null;
                transitionActiveRef.current = false;
            }
        };

        const handleFinish = () => {
            if (resolveTransitionRef.current) {
                resolveTransitionRef.current();
                resolveTransitionRef.current = null;
                transitionActiveRef.current = false;
            }
            // Bersihkan class jika ada sisa
            document.querySelectorAll('.page-morphing-out').forEach((el) => {
                el.classList.remove('page-morphing-out');
            });
        };

        const removeStart = router.on('start', handleStart);
        const removeNavigate = router.on('navigate', handleNavigate);
        const removeFinish = router.on('finish', handleFinish);

        return () => {
            removeStart();
            removeNavigate();
            removeFinish();
            if (resolveTransitionRef.current) {
                resolveTransitionRef.current();
            }
        };
    }, []);

    // Morph transition berjalan langsung di level DOM lewat browser View Transitions API
    // Tidak membutuhkan overlay visual apapun yang menutupi layar
    return null;
}
