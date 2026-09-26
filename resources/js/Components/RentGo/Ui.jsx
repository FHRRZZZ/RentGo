import React from "react";
import { Link } from "@inertiajs/react";

/**
 * Kumpulan komponen UI kecil yang dipakai ulang lintas halaman RentGo.
 * Gaya mengikuti tema yang sudah ada: latar terang, aksen #F5B800,
 * tegas #111, sudut tajam (rounded-sm).
 */

export function StatusBadge({ status, map = {}, className = "" }) {
    const meta = map[status] || {
        label: status || "-",
        color: "bg-stone-100 text-stone-600 border-stone-300",
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
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 pb-4 border-b border-stone-200">
            <div>
                {kicker && (
                    <p className="text-[10px] text-stone-500 uppercase tracking-[0.16em] font-bold">
                        {kicker}
                    </p>
                )}
                <h2 className="text-xl font-semibold mt-1">{title}</h2>
                {description && (
                    <p className="text-xs text-stone-500 mt-1">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}

export function Card({ children, className = "" }) {
    return (
        <div className={`bg-white border-stone-200 rounded-sm ${className}`}>
            {children}
        </div>
    );
}

export function StatCard({ label, value, hint, accent = false }) {
    return (
        <div
            className={`border rounded-sm p-4 ${accent ? "bg-[#111] text-white border-stone-800" : "bg-white border-stone-200"}`}
        >
            <p
                className={`text-[10px] uppercase tracking-[0.16em] font-bold ${accent ? "text-[#F5B800]" : "text-stone-500"}`}
            >
                {label}
            </p>
            <p
                className={`text-xl font-semibold mt-1.5 ${accent ? "text-white" : "text-[#111]"}`}
            >
                {value}
            </p>
            {hint && (
                <p
                    className={`text-[11px] mt-1 ${accent ? "text-stone-400" : "text-stone-400"}`}
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
            <p className="text-sm font-semibold text-stone-800">{title}</p>
            {description && (
                <p className="text-xs text-stone-400 mt-1">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
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
                        <Link href={item.href} className="hover:text-black">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-semibold text-[#111]">
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
                        ? "font-semibold text-[#111] text-right"
                        : "font-medium text-[#111] text-right"
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
            <span className="text-stone-300">
                {"★".repeat(Math.max(0, 5 - full))}
            </span>
        </span>
    );
}
