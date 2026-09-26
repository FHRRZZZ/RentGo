import React, { useMemo, useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";

/**
 * Halaman Pesan (customer).
 *
 * Seluruh data dummy percakapan sudah dihapus. Halaman hanya menampilkan
 * percakapan yang benar-benar dikirim server lewat prop `conversations`.
 * Selama fitur chat belum terhubung, halaman menampilkan keadaan kosong.
 */

function Avatar({ conversation, small = false }) {
    return (
        <div
            className={`${small ? "h-10 w-10 text-[11px]" : "h-12 w-12 text-xs"} ${
                conversation.tone || "bg-stone-200 text-stone-700"
            } relative flex shrink-0 items-center justify-center rounded-full font-bold`}
        >
            {conversation.initials || (conversation.name || "?").charAt(0)}
            {conversation.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            )}
        </div>
    );
}

export default function MessageIndex({
    auth = {},
    conversations: propConversations = [],
}) {
    // Hanya percakapan asli dari server.
    const conversationsList = useMemo(
        () => (propConversations || []).filter((c) => c && c.id !== undefined),
        [propConversations],
    );
    const hasConversations = conversationsList.length > 0;
    const { url } = usePage();

    // Percakapan aktif mengikuti query ?conversation=ID bila valid.
    const initialId = useMemo(() => {
        const match = /[?&]conversation=(\d+)/.exec(url || "");
        if (match) {
            const id = Number(match[1]);
            if (conversationsList.some((c) => c.id === id)) return id;
        }
        return conversationsList[0]?.id ?? null;
    }, [url, conversationsList]);

    const [selectedId, setSelectedId] = useState(initialId);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("semua");
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        setSelectedId(initialId);
    }, [initialId]);

    const selectedConversation =
        conversationsList.find((c) => c.id === selectedId) ||
        conversationsList[0] ||
        null;

    const visibleConversations = useMemo(
        () =>
            conversationsList.filter((c) => {
                const matchesQuery =
                    `${c.name || ""} ${c.subject || ""} ${c.preview || ""}`
                        .toLowerCase()
                        .includes(query.toLowerCase());
                const matchesFilter =
                    filter === "semua" ||
                    (filter === "belum-dibaca" && c.unread > 0);
                return matchesQuery && matchesFilter;
            }),
        [conversationsList, filter, query],
    );

    const currentMessages = selectedConversation?.messages || [];

    const handleSend = (e) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text || !selectedConversation) return;
        setSending(true);
        router.post(
            `/message/${selectedConversation.id}`,
            { body: text },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDraft("");
                    setSending(false);
                },
                onError: () => setSending(false),
            },
        );
    };

    const handleSelect = (id) => {
        setSelectedId(id);
        const target = conversationsList.find((c) => c.id === id);
        if (target && target.unread > 0) {
            router.post(
                `/message/${id}/read`,
                {},
                { preserveScroll: true, preserveState: true },
            );
        }
    };

    return (
        <CustomerLayout
            auth={auth}
            activeNav="pesan"
            backHref="/"
            backLabel="Beranda"
            maxWidth="max-w-[1440px]"
        >
            <Head title="Pesan - RentGo" />

            {/* Page Header */}
            <div className="mb-6">
                <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#F5B800]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                        Pusat Komunikasi
                    </span>
                </div>
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-[#111]">
                            Pesan
                        </h1>
                        <p className="mt-1 text-xs text-stone-500">
                            Tetap terhubung dengan mitra rental dan tim RentGo.
                        </p>
                    </div>
                    <span className="rounded-sm border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600">
                        {conversationsList.length} percakapan
                    </span>
                </div>
            </div>

            {/* Chat Layout */}
            <section className="grid min-h-[660px] overflow-hidden rounded-sm border-stone-200 bg-white shadow-sm lg:h-[calc(100vh-13rem)] lg:min-h-[680px] lg:grid-cols-[360px_1fr] xl:grid-cols-[380px_1fr]">
                {/* Sidebar Percakapan */}
                <aside className="flex flex-col border-b border-stone-200 lg:border-b-0 lg:border-r">
                    <div className="border-b border-stone-200 p-4">
                        <label className="relative block">
                            <span className="sr-only">Cari percakapan</span>
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path strokeLinecap="round" d="m20 20-4-4" />
                            </svg>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari percakapan"
                                className="w-full rounded-sm border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-[#111] focus:bg-white"
                            />
                        </label>
                        <div className="mt-3 flex gap-1 rounded-sm bg-stone-100 p-1">
                            {[
                                ["semua", "Semua"],
                                ["belum-dibaca", "Belum dibaca"],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setFilter(value)}
                                    className={`flex-1 rounded-sm px-2 py-2 text-[11px] font-semibold transition ${
                                        filter === value
                                            ? "bg-[#111] text-[#F5B800]"
                                            : "text-stone-500 hover:text-[#111]"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 divide-y divide-stone-100 overflow-y-auto">
                        {visibleConversations.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => handleSelect(c.id)}
                                className={`flex w-full gap-3 p-4 text-left transition hover:bg-stone-50 ${
                                    selectedId === c.id
                                        ? "border-l-2 border-[#F5B800] bg-[#FFFBEA]"
                                        : "border-l-2 border-transparent"
                                }`}
                            >
                                <Avatar conversation={c} small />
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="truncate text-xs font-semibold text-stone-900">
                                            {c.name}
                                        </span>
                                        <span className="shrink-0 text-[10px] text-stone-400">
                                            {c.time}
                                        </span>
                                    </span>
                                    <span className="mt-1 block truncate text-[10px] font-medium text-stone-500">
                                        {c.subject}
                                    </span>
                                    <span className="mt-1 block truncate text-[11px] text-stone-400">
                                        {c.preview}
                                    </span>
                                </span>
                                {c.unread > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F5B800] px-1 text-[10px] font-bold text-[#111]">
                                        {c.unread}
                                    </span>
                                )}
                            </button>
                        ))}
                        {visibleConversations.length === 0 && (
                            <p className="p-6 text-center text-xs text-stone-400">
                                {hasConversations
                                    ? "Percakapan tidak ditemukan."
                                    : "Belum ada percakapan. Hubungi mitra dari halaman Pesanan Saya."}
                            </p>
                        )}
                    </div>
                </aside>

                {/* Area Chat */}
                <div className="flex min-h-[520px] flex-col bg-stone-50 lg:min-h-0">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-4 sm:px-6">
                        {selectedConversation ? (
                            <>
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar
                                        conversation={selectedConversation}
                                    />
                                    <div className="min-w-0">
                                        <h2 className="truncate text-sm font-semibold">
                                            {selectedConversation.name}
                                        </h2>
                                        <p className="mt-1 truncate text-[11px] text-stone-400">
                                            {selectedConversation.online
                                                ? "Online sekarang"
                                                : "Offline"}{" "}
                                            &middot;{" "}
                                            {selectedConversation.subject}
                                        </p>
                                    </div>
                                </div>
                                <span className="hidden rounded-sm border-stone-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500 sm:inline-block">
                                    {selectedConversation.orderId}
                                </span>
                            </>
                        ) : (
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-stone-700">
                                    Belum ada percakapan
                                </h2>
                                <p className="mt-1 text-[11px] text-stone-400">
                                    Pesan akan muncul setelah Anda menghubungi
                                    mitra penyedia unit.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pesan */}
                    <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                        {!hasConversations && (
                            <p className="py-10 text-center text-xs text-stone-400">
                                Belum ada percakapan. Gunakan tombol Chat
                                Mitra pada halaman Pesanan Saya untuk mulai
                                berkomunikasi.
                            </p>
                        )}
                        {selectedConversation &&
                            currentMessages.length === 0 && (
                                <p className="py-10 text-center text-xs text-stone-400">
                                    Belum ada pesan pada percakapan ini.
                                </p>
                            )}
                        {selectedConversation &&
                            currentMessages.map((msg, i) => (
                                <div
                                    key={msg.id ?? `${msg.time}-${i}`}
                                    className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`flex max-w-[82%] flex-col sm:max-w-[65%] ${
                                            msg.from === "me"
                                                ? "items-end"
                                                : "items-start"
                                        }`}
                                    >
                                        <div
                                            className={`rounded-sm px-4 py-3 text-xs leading-relaxed ${
                                                msg.from === "me"
                                                    ? "bg-[#111] text-white"
                                                    : "border border-stone-200 bg-white text-stone-700"
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="mt-1 px-1 text-[10px] text-stone-400">
                                            {msg.time}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Input Pesan */}
                    <form
                        onSubmit={handleSend}
                        className="border-t border-stone-200 bg-white p-4 sm:p-5"
                    >
                        <div className="flex items-end gap-3">
                            <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                rows="1"
                                disabled={!selectedConversation}
                                placeholder={
                                    selectedConversation
                                        ? "Tulis pesan..."
                                        : "Belum ada percakapan aktif"
                                }
                                className="max-h-28 min-h-11 flex-1 resize-none rounded-sm border-stone-200 bg-stone-50 px-3 py-3 text-xs outline-none transition focus:border-[#111] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            <button
                                type="submit"
                                disabled={
                                    sending ||
                                    !draft.trim() ||
                                    !selectedConversation
                                }
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[#F5B800] text-[#111] transition hover:bg-[#e0a800] disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Kirim pesan"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 3-8.5 18-3.5-8-8-3.5L21 3Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 13 21 3"
                                    />
                                </svg>
                            </button>
                        </div>
                        <p className="mt-2 text-[10px] text-stone-400">
                            Pesan tersimpan di server dan dapat dibaca mitra
                            melalui Portal Mitra.
                        </p>
                    </form>
                </div>
            </section>
        </CustomerLayout>
    );
}
