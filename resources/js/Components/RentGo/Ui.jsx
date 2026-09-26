import React from "react";
import { Link } from "@inertiajs/react";

/**
 * Kumpulan komponen UI kecil yang dipakai ulang lintas halaman RentGo.
 * Tema gelap premium: latar #111111/#0D0D0D, aksen #F5B800,
 * sudut tajam (rounded-sm), border stone-800.
 */

export function StatusBadge({ status, map = {}, className = "" }) {
    const meta = map[status] || {
        label: status || "-",
        color: "bg-stone-100 text-stone-700 border-stone-200",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[11px] font-semibold border ${meta.color} ${className}`}
        >
            {meta.label}
        </span>
    );
}

export function SectionTitle({ kicker, title, description, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 pb-4 border-b border-stone-200">
            <div>
                {kicker && (
                    <p className="text-[11px] text-[#b48200] uppercase tracking-wider font-semibold">
                        {kicker}
                    </p>
                )}
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] mt-1">{title}</h2>
                {description && (
                    <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}

export function Card({ children, className = "" }) {
    return (
        <div className={`bg-white border border-stone-200 rounded-sm shadow-sm ${className}`}>
            {children}
        </div>
    );
}

export function StatCard({ label, value, hint, accent = false }) {
    return (
        <div
            className={`border rounded-sm p-5 shadow-sm transition-all ${
                accent
                    ? "bg-amber-500/10 border-amber-300/60 text-stone-900"
                    : "bg-white border-stone-200 text-stone-900"
            }`}
        >
            <p
                className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold ${
                    accent ? "text-amber-800" : "text-stone-500"
                }`}
            >
                {label}
            </p>
            <p
                className={`text-2xl sm:text-3xl font-bold mt-1.5 tracking-tight ${
                    accent ? "text-amber-900" : "text-[#111111]"
                }`}
            >
                {value}
            </p>
            {hint && (
                <p
                    className={`text-[11px] mt-1.5 ${accent ? "text-amber-800/80" : "text-stone-500"}`}
                >
                    {hint}
                </p>
            )}
        </div>
    );
}

export function EmptyState({ title, description, action }) {
    return (
        <Card className="p-10 text-center">
            <p className="text-sm font-semibold text-[#111111]">{title}</p>
            {description && (
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed max-w-sm mx-auto">{description}</p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </Card>
    );
}

export function FailSafeImage({ src, alt, className = "", fallback }) {
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={(event) => {
                event.currentTarget.onerror = null;
                if (fallback) event.currentTarget.src = fallback;
            }}
        />
    );
}

export function Breadcrumb({ items = [] }) {
    return (
        <nav className="flex items-center gap-2 text-[11px] text-stone-500 mb-4">
            {items.map((item, index) => (
                <React.Fragment key={`${item.label}-${index}`}>
                    {index > 0 && <span className="text-stone-300">/</span>}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-black transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-semibold text-stone-900">
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

export function DataRow({ label, value, strong = false }) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-stone-500">{label}</span>
            <span
                className={
                    strong
                        ? "font-semibold text-[#111111] text-right"
                        : "font-medium text-stone-700 text-right"
                }
            >
                {value}
            </span>
        </div>
    );
}

export function Stars({ rating = 0, className = "" }) {
    const full = Math.round(Number(rating));
    return (
        <span
            className={`text-[#F5B800] ${className}`}
            aria-label={`Rating ${rating} dari 5`}
        >
            {"★".repeat(Math.max(0, Math.min(5, full)))}
            <span className="text-stone-700">
                {"★".repeat(Math.max(0, 5 - full))}
            </span>
        </span>
    );
}
