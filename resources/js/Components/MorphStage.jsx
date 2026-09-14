import React, { useState, useEffect, useRef } from 'react';

/**
 * RentGo PowerPoint-Style Morph Stage
 * Menahan halaman lama dan merender halaman baru secara simultan selama ~550ms
 * agar terjadi animasi transisi "Morph" nyata persis seperti di PowerPoint:
 * - Halaman lama pecah, menyusut (scale down), melayang dan melebur (blur out)
 * - Halaman baru mengembang (scale in), memfokus (unblur) dan menyatu ke layar
 * - Khusus Login & Register (yang memakai layout AuthSplitLayout) dikecualikan
 */
export default function MorphStage({ Component, pageKey, pageProps }) {
    // 1. Jika halaman adalah Auth (Login/Register), gunakan layout split aslinya langsung
    if (Component && Component.layout) {
        if (typeof Component.layout === 'function') {
            return Component.layout(<Component key={pageKey} {...pageProps} />);
        }
        if (Array.isArray(Component.layout)) {
            return Component.layout
                .concat(<Component key={pageKey} {...pageProps} />)
                .reverse()
                .reduce((children, Layout) => React.createElement(Layout, { children, ...pageProps }));
        }
    }

    const [current, setCurrent] = useState({ Component, pageKey, pageProps });
    const [outgoing, setOutgoing] = useState(null);
    const [isMorphing, setIsMorphing] = useState(false);
    const prevKeyRef = useRef(pageKey);

    useEffect(() => {
        // Jika pageKey berubah (artinya user berpindah halaman via Inertia)
        if (pageKey && pageKey !== prevKeyRef.current) {
            prevKeyRef.current = pageKey;

            // Jangan morph jika berpindah dari/ke auth page
            const isAuthPage = (comp) => comp && comp.layout;
            if (isAuthPage(current.Component) || isAuthPage(Component)) {
                setCurrent({ Component, pageKey, pageProps });
                setOutgoing(null);
                setIsMorphing(false);
                return;
            }

            const currentScrollY = window.scrollY || 0;

            // Simpan snapshot halaman lama
            setOutgoing({
                Component: current.Component,
                pageKey: current.pageKey,
                pageProps: current.pageProps,
                scrollY: currentScrollY,
            });

            // Pasang halaman baru
            setCurrent({ Component, pageKey, pageProps });
            setIsMorphing(true);

            // Scroll halaman baru ke atas secara instan
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Durasi Morph nyata: 550ms (terlihat jelas & sinematik persis PPT)
            const timer = setTimeout(() => {
                setOutgoing(null);
                setIsMorphing(false);
            }, 550);

            return () => clearTimeout(timer);
        } else {
            setCurrent({ Component, pageKey, pageProps });
        }
    }, [pageKey, Component, pageProps]);

    const CurrentComponent = current.Component;
    const OutgoingComponent = outgoing ? outgoing.Component : null;

    // Jika sedang dalam fase Morph antar halaman
    if (outgoing && isMorphing && OutgoingComponent) {
        return (
            <div className="relative w-full min-h-screen overflow-hidden bg-[#111111]">
                {/* Halaman Lama: PPT Morph Break Out */}
                <div
                    className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden"
                    style={{
                        animation: 'pptMorphBreak 0.52s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                        transformOrigin: '50% 25%',
                    }}
                >
                    <div style={{ transform: `translateY(-${outgoing.scrollY}px)` }}>
                        <OutgoingComponent {...outgoing.pageProps} />
                    </div>
                </div>

                {/* Halaman Baru: PPT Morph Assemble In */}
                <div
                    className="relative w-full min-h-screen z-20"
                    style={{
                        animation: 'pptMorphAssemble 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
                        transformOrigin: '50% 25%',
                    }}
                >
                    <CurrentComponent key={current.pageKey} {...current.pageProps} />
                </div>
            </div>
        );
    }

    return <CurrentComponent key={current.pageKey} {...current.pageProps} />;
}
