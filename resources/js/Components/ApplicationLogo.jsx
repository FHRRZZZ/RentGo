export default function ApplicationLogo({
    className = '',
    theme = 'light',
    iconOnly = false,
    height = 'h-8',
    iconSize,
    alt = 'RentGo',
    ...props
}) {
    const isDark = theme === 'dark';
    const effectiveHeight = height || iconSize || 'h-8';
    const logoSrc = iconOnly
        ? (isDark ? '/logo-icon-dark.png' : '/logo-icon.png')
        : (isDark ? '/logo-dark.png' : '/logo.png');

    return (
        <img
            src={logoSrc}
            alt={alt}
            className={`${effectiveHeight} w-auto object-contain select-none ${className}`}
            {...props}
        />
    );
}
