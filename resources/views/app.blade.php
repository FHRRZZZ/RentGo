<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <style>
            /* ============================================================
               RentGo PowerPoint-Style Morph Transition
               Desain halaman pecah, melebur & menyatu langsung ke halaman baru
               ============================================================ */
            @keyframes pptMorphBreak {
                0% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    filter: blur(0px);
                }
                40% {
                    opacity: 0.65;
                    transform: scale(0.96) translateY(-14px);
                    filter: blur(3px);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.90) translateY(-36px);
                    filter: blur(8px);
                }
            }

            @keyframes pptMorphAssemble {
                0% {
                    opacity: 0;
                    transform: scale(1.10) translateY(32px);
                    filter: blur(8px);
                }
                50% {
                    opacity: 0.85;
                    transform: scale(1.02) translateY(8px);
                    filter: blur(2px);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    filter: blur(0px);
                }
            }

            @keyframes pageMorphBreak {
                0% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    filter: blur(0px);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.96) translateY(-14px);
                    filter: blur(4px);
                }
            }

            @keyframes pageMorphAssemble {
                0% {
                    opacity: 0;
                    transform: scale(1.04) translateY(16px);
                    filter: blur(4px);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    filter: blur(0px);
                }
            }

            .morph-page-container {
                animation: pageMorphAssemble 0.42s cubic-bezier(0.16, 1, 0.3, 1) both;
                transform-origin: center top;
                will-change: transform, opacity, filter;
            }

            .page-morphing-out {
                animation: pageMorphBreak 0.28s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
                pointer-events: none;
            }

            /* Native View Transitions (ketika didukung browser) */
            @view-transition {
                navigation: auto;
            }
            ::view-transition-group(root) {
                animation-duration: 0.45s;
                animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            ::view-transition-old(root) {
                animation: pageMorphBreak 0.38s cubic-bezier(0.4, 0, 0.2, 1) both;
            }
            ::view-transition-new(root) {
                animation: pageMorphAssemble 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
            }
            ::view-transition-group(main-navbar) {
                animation-duration: 0.35s;
                animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .morph-navbar {
                view-transition-name: main-navbar;
            }
            ::view-transition-group(page-hero) {
                animation-duration: 0.4s;
                animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .morph-hero {
                view-transition-name: page-hero;
            }
        </style>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
