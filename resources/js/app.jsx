import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import MorphStage from '@/Components/MorphStage';
import PageTransition from '@/Components/PageTransition';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <PageTransition />
                <App {...props}>
                    {({ Component, key, props: pageProps }) => (
                        <MorphStage Component={Component} pageKey={key} pageProps={pageProps} />
                    )}
                </App>
            </>
        );
    },
    progress: {
        color: '#F5B800',
        showSpinner: false,
    },
});

