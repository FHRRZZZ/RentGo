import React from 'react';

export default function MorphStage({ Component, pageKey, pageProps }) {
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

    return <Component key={pageKey} {...pageProps} />;
}
